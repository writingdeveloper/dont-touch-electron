import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/utils/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

const playSpy = vi.fn().mockResolvedValue(undefined)
class FakeAudio {
  src: string
  volume = 1
  constructor(src: string) {
    this.src = src
  }
  play() {
    return playSpy(this.src, this.volume)
  }
}
vi.stubGlobal('Audio', FakeAudio)

import { AlertSoundService } from '../../src/audio/AlertSoundService'

function makeService(resolveCustom = vi.fn()) {
  return new AlertSoundService({
    presetBaseUrl: '/sounds/',
    resolveCustomSoundUrl: resolveCustom,
  })
}

describe('AlertSoundService', () => {
  beforeEach(() => {
    playSpy.mockClear()
    playSpy.mockResolvedValue(undefined)
  })

  it('plays a tone preset by id at the requested volume', async () => {
    const svc = makeService()
    await svc.play('tone-chime', 0.3)
    expect(playSpy).toHaveBeenCalledTimes(1)
    const [src, volume] = playSpy.mock.calls[0]
    expect(src).toBe('/sounds/tone-chime.wav')
    expect(volume).toBeCloseTo(0.3)
  })

  it('plays a voice preset by id', async () => {
    const svc = makeService()
    await svc.play('voice-ru-stop', 0.5)
    expect(playSpy.mock.calls[0][0]).toBe('/sounds/voice-ru-stop.mp3')
  })

  it('clamps volume to [0, 1]', async () => {
    const svc = makeService()
    await svc.play('tone-chime', 5)
    expect(playSpy.mock.calls[0][1]).toBe(1)
    playSpy.mockClear()
    await svc.play('tone-chime', -0.1)
    expect(playSpy.mock.calls[0][1]).toBe(0)
  })

  it('asks the resolver for custom sound URLs', async () => {
    const resolver = vi.fn().mockResolvedValue('custom-sound://abc-123')
    const svc = makeService(resolver)
    await svc.play('custom-abc-123', 0.5)
    expect(resolver).toHaveBeenCalledWith('custom-abc-123')
    expect(playSpy.mock.calls[0][0]).toBe('custom-sound://abc-123')
  })

  it('falls back when an unknown preset id is requested', async () => {
    const svc = makeService()
    await svc.play('does-not-exist', 0.5)
    expect(playSpy.mock.calls[0][0]).toBe('/sounds/tone-chime.wav')
  })

  it('falls back when Audio.play rejects', async () => {
    playSpy.mockRejectedValueOnce(new Error('boom'))
    const fallback = vi.fn()
    const svc = new AlertSoundService({
      presetBaseUrl: '/sounds/',
      resolveCustomSoundUrl: vi.fn(),
      sineFallback: fallback,
    })
    await svc.play('tone-chime', 0.5)
    expect(fallback).toHaveBeenCalledTimes(1)
  })
})
