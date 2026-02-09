// IPC channel constants for renderer process
// Note: electron/main/index.ts uses string literals directly (separate build)
// Keep these in sync with electron/main/index.ts and electron/preload/index.ts

export const IPC_CHANNELS = {
  // Alert system
  SHOW_FULLSCREEN_ALERT: 'show-fullscreen-alert',
  HIDE_FULLSCREEN_ALERT: 'hide-fullscreen-alert',
  UPDATE_ALERT_DATA: 'update-alert-data',
  CLOSE_ALERT_WINDOW: 'close-alert-window',
  ALERT_DATA: 'alert-data',
  ALERT_DISMISSED: 'alert-dismissed',

  // Window controls
  WINDOW_MINIMIZE: 'window-minimize',
  WINDOW_CLOSE: 'window-close',
  WINDOW_HIDE: 'window-hide',
  WINDOW_QUIT: 'window-quit',

  // App settings
  GET_APP_SETTINGS: 'get-app-settings',
  SET_APP_SETTINGS: 'set-app-settings',
  GET_APP_VERSION: 'get-app-version',

  // Updates
  CHECK_UPDATE: 'check-update',
  CHECK_UPDATE_SILENT: 'check-update-silent',
  START_DOWNLOAD: 'start-download',
  QUIT_AND_INSTALL: 'quit-and-install',
  UPDATE_CAN_AVAILABLE: 'update-can-available',
  DOWNLOAD_PROGRESS: 'download-progress',
  UPDATE_DOWNLOADED: 'update-downloaded',
  UPDATE_ERROR: 'update-error',

  // Analytics
  TRACK_EVENT: 'track-event',

  // Language
  SET_LANGUAGE: 'set-language',

  // Detection
  TOGGLE_DETECTION: 'toggle-detection',

  // Debug
  DEBUG_LOG: 'debug-log',

  // External
  OPEN_EXTERNAL: 'open-external',
  OPEN_WIN: 'open-win',

  // Misc
  MAIN_PROCESS_MESSAGE: 'main-process-message',
} as const
