import { describe, it, expect } from 'vitest'
import {
  DEFAULT_ENABLED_ZONES,
  HAIR_ZONES,
  FACE_ZONES,
  ALL_SPECIFIC_ZONES,
} from '../../src/detection/types'

describe('Detection Types Constants', () => {
  it('DEFAULT_ENABLED_ZONES should contain fullFace', () => {
    expect(DEFAULT_ENABLED_ZONES).toContain('fullFace')
    expect(DEFAULT_ENABLED_ZONES).toHaveLength(1)
  })

  it('HAIR_ZONES should contain scalp and eyebrows', () => {
    expect(HAIR_ZONES).toContain('scalp')
    expect(HAIR_ZONES).toContain('eyebrows')
    expect(HAIR_ZONES).toHaveLength(2)
  })

  it('FACE_ZONES should contain all face areas', () => {
    expect(FACE_ZONES).toContain('forehead')
    expect(FACE_ZONES).toContain('eyes')
    expect(FACE_ZONES).toContain('nose')
    expect(FACE_ZONES).toContain('cheeks')
    expect(FACE_ZONES).toContain('mouth')
    expect(FACE_ZONES).toContain('chin')
    expect(FACE_ZONES).toContain('ears')
    expect(FACE_ZONES).toHaveLength(7)
  })

  it('ALL_SPECIFIC_ZONES should combine HAIR and FACE zones', () => {
    expect(ALL_SPECIFIC_ZONES).toHaveLength(HAIR_ZONES.length + FACE_ZONES.length)
    for (const zone of HAIR_ZONES) {
      expect(ALL_SPECIFIC_ZONES).toContain(zone)
    }
    for (const zone of FACE_ZONES) {
      expect(ALL_SPECIFIC_ZONES).toContain(zone)
    }
  })

  it('fullFace should not be in specific zones', () => {
    expect(ALL_SPECIFIC_ZONES).not.toContain('fullFace')
  })
})
