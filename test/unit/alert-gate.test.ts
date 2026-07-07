import { describe, expect, it } from 'vitest'
import {
  getSuppressedReminderSideEffects,
  REMINDER_SIDE_EFFECTS,
  shouldSuppressReminderSideEffects,
} from '../../src/utils/alertGate'

describe('alert reminder gate', () => {
  it('allows reminder side effects by default', () => {
    const state = { alertTimeoutActive: false, resumeAfterHandClear: false }

    expect(shouldSuppressReminderSideEffects(state)).toBe(false)
    expect(getSuppressedReminderSideEffects(state)).toEqual([])
  })

  it('blocks every reminder side effect during an active eating break', () => {
    const state = { alertTimeoutActive: true, resumeAfterHandClear: false }

    expect(shouldSuppressReminderSideEffects(state)).toBe(true)
    expect(getSuppressedReminderSideEffects(state)).toEqual([...REMINDER_SIDE_EFFECTS])
  })

  it('keeps side effects blocked until the hand clears after expiry', () => {
    const state = { alertTimeoutActive: false, resumeAfterHandClear: true }

    expect(shouldSuppressReminderSideEffects(state)).toBe(true)
    expect(getSuppressedReminderSideEffects(state)).toEqual([
      'fullscreen-alert',
      'desktop-notification',
      'alert-sound',
      'touch-stat',
      'meditation-modal',
    ])
  })
})
