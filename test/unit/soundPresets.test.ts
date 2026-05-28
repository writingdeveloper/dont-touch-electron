import { describe, it, expect } from 'vitest'
import { TONE_PRESETS, VOICE_PRESETS, DEFAULT_PRESET_ID, PRESET_BASE_URL } from '../../src/audio/soundPresets'

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

describe('PRESET_BASE_URL', () => {
  // The packaged app loads the renderer via file://.../dist/index.html. A preset
  // URL must resolve next to index.html, not at the filesystem root (which 404s
  // every sound and collapses playback onto the single sine fallback).
  const packagedDoc = 'file:///C:/Program%20Files/DontTouch/resources/app.asar/dist/index.html'

  it('resolves preset files inside the app directory under the packaged file:// protocol', () => {
    const resolved = new URL(PRESET_BASE_URL + 'tone-soft.wav', packagedDoc).href
    expect(resolved).toContain('/dist/sounds/tone-soft.wav')
    expect(resolved).not.toBe('file:///C:/sounds/tone-soft.wav')
  })

  it('also resolves correctly under the Vite dev server (http)', () => {
    const resolved = new URL(PRESET_BASE_URL + 'tone-soft.wav', 'http://127.0.0.1:7777/').href
    expect(resolved).toBe('http://127.0.0.1:7777/sounds/tone-soft.wav')
  })
})
