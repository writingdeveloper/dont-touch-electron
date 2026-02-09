export interface AppSettings {
  autoStart: boolean
  minimizeToTray: boolean
  startMinimized: boolean
  hidePreview: boolean
  closeAction: 'ask' | 'quit' | 'tray'
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  autoStart: false,
  minimizeToTray: true,
  startMinimized: false,
  hidePreview: false,
  closeAction: 'ask',
}
