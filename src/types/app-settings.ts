export const ALERT_TIMEOUT_MINUTES = [5, 10, 15, 30, 45, 60] as const

export type AlertTimeoutMinutes = typeof ALERT_TIMEOUT_MINUTES[number]
export type AlertTimeoutReason = 'eating'

export interface AlertTimeoutState {
  reason: AlertTimeoutReason
  startedAt: number
  activeUntil: number
}

export interface AppSettings {
  autoStart: boolean
  minimizeToTray: boolean
  startMinimized: boolean
  hidePreview: boolean
  closeAction: 'ask' | 'quit' | 'tray'
  alertSoundId: string
  alertVolume: number
  rightRailCollapsed: boolean
  alertTimeoutDefaultMinutes: AlertTimeoutMinutes
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  autoStart: false,
  minimizeToTray: true,
  startMinimized: false,
  hidePreview: false,
  closeAction: 'ask',
  alertSoundId: 'tone-chime',
  alertVolume: 0.5,
  rightRailCollapsed: false,
  alertTimeoutDefaultMinutes: 15,
}
