export interface AppSettings {
  autoStart: boolean
  minimizeToTray: boolean
  startMinimized: boolean
  hidePreview: boolean
  closeAction: 'ask' | 'quit' | 'tray'
  alertSoundId: string
  alertVolume: number
  analyticsEnabled: boolean
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  autoStart: false,
  minimizeToTray: true,
  startMinimized: false,
  hidePreview: false,
  closeAction: 'ask',
  alertSoundId: 'tone-chime',
  alertVolume: 0.5,
  analyticsEnabled: true,
}
