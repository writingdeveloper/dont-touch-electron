export type HandRejectionReason =
  | 'low-confidence'
  | 'invalid-landmarks'
  | 'off-frame'
  | 'collapsed'

export interface RawHandLandmark {
  x: number
  y: number
  z?: number
}

export interface HandValidationResult {
  valid: boolean
  pointConfidence: number
  reason?: HandRejectionReason
}

export const HAND_VALIDATION = {
  minHandConfidence: 0.65,
  minValidLandmarks: 18,
  offFrameMargin: 0.08,
  maxOffFrameRatio: 0.25,
  minNormalizedSpan: 0.045,
  minNormalizedArea: 0.0012,
} as const

function isFiniteLandmark(landmark: RawHandLandmark): boolean {
  return Number.isFinite(landmark.x) && Number.isFinite(landmark.y)
}

function isOffFrame(landmark: RawHandLandmark): boolean {
  const margin = HAND_VALIDATION.offFrameMargin
  return (
    landmark.x < -margin ||
    landmark.x > 1 + margin ||
    landmark.y < -margin ||
    landmark.y > 1 + margin
  )
}

export function validateHandLandmarks(
  landmarks: RawHandLandmark[],
  handednessScore: number
): HandValidationResult {
  if (!Number.isFinite(handednessScore) || handednessScore < HAND_VALIDATION.minHandConfidence) {
    return { valid: false, pointConfidence: 0, reason: 'low-confidence' }
  }

  if (landmarks.length < HAND_VALIDATION.minValidLandmarks) {
    return { valid: false, pointConfidence: 0, reason: 'invalid-landmarks' }
  }

  const finiteLandmarks = landmarks.filter(isFiniteLandmark)
  if (finiteLandmarks.length < HAND_VALIDATION.minValidLandmarks) {
    return { valid: false, pointConfidence: 0, reason: 'invalid-landmarks' }
  }

  const offFrameCount = finiteLandmarks.filter(isOffFrame).length
  const offFrameRatio = offFrameCount / finiteLandmarks.length
  if (offFrameRatio > HAND_VALIDATION.maxOffFrameRatio) {
    return { valid: false, pointConfidence: 0, reason: 'off-frame' }
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const landmark of finiteLandmarks) {
    minX = Math.min(minX, landmark.x)
    maxX = Math.max(maxX, landmark.x)
    minY = Math.min(minY, landmark.y)
    maxY = Math.max(maxY, landmark.y)
  }

  const spanX = maxX - minX
  const spanY = maxY - minY
  const maxSpan = Math.max(spanX, spanY)
  const area = spanX * spanY

  if (maxSpan < HAND_VALIDATION.minNormalizedSpan || area < HAND_VALIDATION.minNormalizedArea) {
    return { valid: false, pointConfidence: 0, reason: 'collapsed' }
  }

  return {
    valid: true,
    pointConfidence: Math.max(0, Math.min(1, handednessScore - offFrameRatio * 0.25)),
  }
}
