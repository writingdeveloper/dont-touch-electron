import { describe, expect, it } from 'vitest'
import { classifyCameraError, classifyModelError } from '../../src/utils/recovery'

describe('recovery issue classification', () => {
  it('classifies camera permission failures with actionable copy', () => {
    const issue = classifyCameraError(new DOMException('Permission denied', 'NotAllowedError'))

    expect(issue.kind).toBe('camera')
    expect(issue.title).toBe('Camera permission is blocked')
    expect(issue.action).toBe('retry-camera')
    expect(issue.actionLabel).toBe('Try again')
    expect(issue.secondaryAction).toBe('refresh-cameras')
    expect(issue.secondaryActionLabel).toBe('Refresh cameras')
    expect(issue.message).toContain("Don't Touch")
  })

  it('classifies stale selected camera failures with default camera recovery', () => {
    const issue = classifyCameraError(new DOMException('Device missing', 'OverconstrainedError'))

    expect(issue.title).toBe('Selected camera is unavailable')
    expect(issue.action).toBe('default-camera')
    expect(issue.actionLabel).toBe('Try default camera')
  })

  it('classifies model failures without exposing MediaPipe as the primary message', () => {
    const issue = classifyModelError(new Error('Unknown error loading model'))

    expect(issue.kind).toBe('model')
    expect(issue.title).toBe('Detection model could not start')
    expect(issue.action).toBe('retry-model')
    expect(issue.actionLabel).toBe('Retry model')
    expect(issue.message).not.toContain('MediaPipe')
    expect(issue.detail).toContain('Unknown error loading model')
  })
})
