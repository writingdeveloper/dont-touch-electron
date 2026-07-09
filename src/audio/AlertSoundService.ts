import { logger } from '../utils/logger'
import { findPreset, DEFAULT_PRESET_ID } from './soundPresets'

export interface AlertSoundServiceOptions {
  presetBaseUrl: string
  resolveCustomSoundUrl: (id: string) => Promise<string | null>
  sineFallback?: () => void
}

function defaultSineFallback() {
  try {
    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
    if (!AC) return
    const ctx = new AC()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // last-resort: silence
  }
}

function clampVolume(v: number): number {
  if (Number.isNaN(v) || !Number.isFinite(v)) return 0.5
  return Math.max(0, Math.min(1, v))
}

export class AlertSoundService {
  private opts: AlertSoundServiceOptions
  private currentAudio: HTMLAudioElement | null = null

  constructor(opts: AlertSoundServiceOptions) {
    this.opts = opts
  }

  private async resolveUrl(id: string): Promise<string> {
    if (id.startsWith('custom-')) {
      const url = await this.opts.resolveCustomSoundUrl(id)
      if (url) return url
      logger.warn(`AlertSoundService: custom sound "${id}" not found, falling back to default`)
      const def = findPreset(DEFAULT_PRESET_ID)!
      return this.opts.presetBaseUrl + def.fileName
    }
    const preset = findPreset(id) ?? findPreset(DEFAULT_PRESET_ID)!
    return this.opts.presetBaseUrl + preset.fileName
  }

  async play(id: string, volume: number): Promise<void> {
    const url = await this.resolveUrl(id)
    const audio = new Audio(url)
    this.stop()
    this.currentAudio = audio
    audio.volume = clampVolume(volume)
    audio.addEventListener('ended', () => {
      if (this.currentAudio === audio) {
        this.currentAudio = null
      }
    }, { once: true })
    try {
      await audio.play()
    } catch (err) {
      if (this.currentAudio === audio) {
        this.currentAudio = null
      }
      logger.warn(`AlertSoundService: playback failed for "${id}", using sine fallback`, err)
      ;(this.opts.sineFallback ?? defaultSineFallback)()
    }
  }

  async preview(id: string, volume: number): Promise<void> {
    return this.play(id, volume)
  }

  stop(): void {
    if (!this.currentAudio) return
    this.currentAudio.pause()
    this.currentAudio.currentTime = 0
    this.currentAudio = null
  }
}
