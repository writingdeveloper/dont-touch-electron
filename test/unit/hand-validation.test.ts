import { describe, expect, it } from 'vitest'
import { HAND_VALIDATION, RawHandLandmark, validateHandLandmarks } from '../../src/detection/handValidation'

function makeLandmarks(): RawHandLandmark[] {
  return Array.from({ length: 21 }, (_, index) => ({
    x: 0.35 + (index % 5) * 0.035,
    y: 0.35 + Math.floor(index / 5) * 0.035,
  }))
}

describe('hand validation', () => {
  it('rejects handedness confidence below the conservative threshold', () => {
    expect(validateHandLandmarks(makeLandmarks(), HAND_VALIDATION.minHandConfidence - 0.01)).toEqual({
      valid: false,
      pointConfidence: 0,
      reason: 'low-confidence',
    })
  })

  it('accepts handedness confidence at the conservative threshold', () => {
    const result = validateHandLandmarks(makeLandmarks(), HAND_VALIDATION.minHandConfidence)
    expect(result.valid).toBe(true)
    expect(result.pointConfidence).toBe(HAND_VALIDATION.minHandConfidence)
  })

  it('rejects invalid or incomplete landmarks', () => {
    expect(validateHandLandmarks(makeLandmarks().slice(0, 17), 0.9)).toEqual({
      valid: false,
      pointConfidence: 0,
      reason: 'invalid-landmarks',
    })

    const invalid = makeLandmarks()
    invalid[0] = { x: Number.NaN, y: 0.5 }
    invalid[1] = { x: Number.NaN, y: 0.5 }
    invalid[2] = { x: Number.NaN, y: 0.5 }
    invalid[3] = { x: Number.NaN, y: 0.5 }
    expect(validateHandLandmarks(invalid, 0.9).reason).toBe('invalid-landmarks')
  })

  it('allows modest cropped/off-frame hands and reduces confidence', () => {
    const cropped = makeLandmarks()
    for (let index = 0; index < 5; index++) {
      cropped[index] = { x: -0.09, y: 0.4 + index * 0.02 }
    }

    const result = validateHandLandmarks(cropped, 0.9)
    expect(result.valid).toBe(true)
    expect(result.pointConfidence).toBeLessThan(0.9)
  })

  it('rejects too many off-frame landmarks', () => {
    const offFrame = makeLandmarks()
    for (let index = 0; index < 6; index++) {
      offFrame[index] = { x: -0.09, y: 0.4 + index * 0.02 }
    }

    expect(validateHandLandmarks(offFrame, 0.9)).toEqual({
      valid: false,
      pointConfidence: 0,
      reason: 'off-frame',
    })
  })

  it('rejects collapsed or tiny hand clusters', () => {
    const collapsed = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5 }))

    expect(validateHandLandmarks(collapsed, 0.9)).toEqual({
      valid: false,
      pointConfidence: 0,
      reason: 'collapsed',
    })
  })
})
