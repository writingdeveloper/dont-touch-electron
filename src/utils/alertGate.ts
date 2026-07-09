export const REMINDER_SIDE_EFFECTS = [
  'fullscreen-alert',
  'desktop-notification',
  'alert-sound',
  'touch-stat',
  'meditation-modal',
] as const

export type ReminderSideEffect = typeof REMINDER_SIDE_EFFECTS[number]

interface AlertGateState {
  alertTimeoutActive: boolean
  resumeAfterHandClear: boolean
}

export function shouldSuppressReminderSideEffects(state: AlertGateState): boolean {
  return state.alertTimeoutActive || state.resumeAfterHandClear
}

export function getSuppressedReminderSideEffects(state: AlertGateState): ReminderSideEffect[] {
  return shouldSuppressReminderSideEffects(state) ? [...REMINDER_SIDE_EFFECTS] : []
}
