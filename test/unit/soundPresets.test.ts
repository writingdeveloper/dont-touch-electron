import { describe, it, expect } from 'vitest'
import { TONE_PRESETS, VOICE_PRESETS, DEFAULT_PRESET_ID } from '../../src/audio/soundPresets'

describe('soundPresets', () => {
  it('has at least one tone preset', () => {
    expect(TONE_PRESETS.length).toBeGreaterThan(0)
  })

  it('every tone has a unique id starting with tone-', () => {
    const ids = TONE_PRESETS.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id.startsWith('tone-')).toBe(true)
  })

  it('every voice has a unique id starting with voice-', () => {
    const ids = VOICE_PRESETS.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id.startsWith('voice-')).toBe(true)
  })

  it('every voice declares a language', () => {
    for (const v of VOICE_PRESETS) expect(v.language).toMatch(/^(en|ko|ja|zh|es|ru)$/)
  })

  it('default preset id matches an existing tone', () => {
    expect(TONE_PRESETS.some(p => p.id === DEFAULT_PRESET_ID)).toBe(true)
  })
})
