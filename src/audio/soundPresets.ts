import type { Language } from '../i18n/translations'

export type PresetCategory = 'tone' | 'voice'

export interface SoundPreset {
  id: string
  category: PresetCategory
  labelKey: string
  language?: Language
  fileName: string
}

export const TONE_PRESETS: SoundPreset[] = [
  { id: 'tone-soft', category: 'tone', labelKey: 'soundToneSoft', fileName: 'tone-soft.wav' },
  { id: 'tone-chime', category: 'tone', labelKey: 'soundToneChime', fileName: 'tone-chime.wav' },
  { id: 'tone-buzzer', category: 'tone', labelKey: 'soundToneBuzzer', fileName: 'tone-buzzer.wav' },
]

export const VOICE_PRESETS: SoundPreset[] = [
  { id: 'voice-en-stop', category: 'voice', language: 'en', labelKey: 'soundVoiceEnStop', fileName: 'voice-en-stop.mp3' },
  { id: 'voice-en-handsdown', category: 'voice', language: 'en', labelKey: 'soundVoiceEnHandsDown', fileName: 'voice-en-handsdown.mp3' },
  { id: 'voice-ko-stop', category: 'voice', language: 'ko', labelKey: 'soundVoiceKoStop', fileName: 'voice-ko-sondaejima.mp3' },
  { id: 'voice-ja-stop', category: 'voice', language: 'ja', labelKey: 'soundVoiceJaStop', fileName: 'voice-ja-sawaranai.mp3' },
  { id: 'voice-zh-stop', category: 'voice', language: 'zh', labelKey: 'soundVoiceZhStop', fileName: 'voice-zh-bie.mp3' },
  { id: 'voice-es-stop', category: 'voice', language: 'es', labelKey: 'soundVoiceEsStop', fileName: 'voice-es-no.mp3' },
  { id: 'voice-ru-stop', category: 'voice', language: 'ru', labelKey: 'soundVoiceRuStop', fileName: 'voice-ru-stop.mp3' },
]

export const ALL_PRESETS: SoundPreset[] = [...TONE_PRESETS, ...VOICE_PRESETS]

export const DEFAULT_PRESET_ID = 'tone-chime'

export function findPreset(id: string): SoundPreset | undefined {
  return ALL_PRESETS.find(p => p.id === id)
}
