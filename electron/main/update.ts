import { app, ipcMain } from 'electron'
import { trackAnalytics } from './analytics'
import { autoUpdater, type UpdateInfo, type ProgressInfo } from 'electron-updater'

// The main window that auto-updater events should be forwarded to.
let currentWin: Electron.BrowserWindow | null = null

// `autoUpdater` is a process-wide singleton and `ipcMain.handle` throws on a
// duplicate channel, so listeners and handlers must be wired exactly once for
// the lifetime of the app. `update()` may be called more than once (e.g. when
// the main window is re-created on macOS `activate`); subsequent calls only
// refresh the target window.
let wired = false

// Latest update-availability result, cached so a renderer that subscribes late
// (App mounts only after the ~6s splash screen) can fetch it on demand instead
// of missing the one-shot broadcast triggered by the splash's update check.
let lastUpdateStatus: { update: boolean; version: string; newVersion?: string } | null = null

export function update(win: Electron.BrowserWindow) {
  currentWin = win

  // Configure autoUpdater
  autoUpdater.autoDownload = false
  autoUpdater.disableWebInstaller = false
  autoUpdater.allowDowngrade = false

  if (wired) return
  wired = true

  // start check
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...')
  })

  // update available
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    console.log('Update available:', info.version)
    lastUpdateStatus = { update: true, version: app.getVersion(), newVersion: info?.version }
    currentWin?.webContents.send('update-can-available', lastUpdateStatus)
    trackAnalytics('update_available', {
      current_version: app.getVersion(),
      new_version: info?.version || 'unknown'
    })
  })

  // update not available
  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    console.log('No update available, current version:', app.getVersion())
    lastUpdateStatus = { update: false, version: app.getVersion(), newVersion: info?.version }
    currentWin?.webContents.send('update-can-available', lastUpdateStatus)
  })

  // download progress
  autoUpdater.on('download-progress', (info: ProgressInfo) => {
    currentWin?.webContents.send('download-progress', info)
  })

  // download complete
  autoUpdater.on('update-downloaded', () => {
    currentWin?.webContents.send('update-downloaded')
    trackAnalytics('update_downloaded')
  })

  // error
  autoUpdater.on('error', (err: Error) => {
    console.error('Auto-updater error:', err)
    currentWin?.webContents.send('update-error', { message: err.message, error: err })
  })

  // Checking for updates
  ipcMain.handle('check-update', async () => {
    if (!app.isPackaged) {
      const error = new Error('The update feature is only available after the package.')
      return { message: error.message, error }
    }

    try {
      return await autoUpdater.checkForUpdatesAndNotify()
    } catch (error) {
      return { message: 'Network error', error }
    }
  })

  // Silent update check (for splash screen - doesn't throw errors)
  ipcMain.handle('check-update-silent', async () => {
    if (!app.isPackaged) {
      return { checked: false, reason: 'dev-mode' }
    }

    try {
      await autoUpdater.checkForUpdates()
      return { checked: true }
    } catch {
      // Silently ignore errors during startup
      return { checked: false, reason: 'network-error' }
    }
  })

  // Cached update-availability result, for renderers (e.g. App) that mount and
  // subscribe only after the splash-screen check has already resolved.
  ipcMain.handle('get-update-status', () => lastUpdateStatus)

  // Start downloading; progress, completion and errors flow back through the
  // listeners registered above.
  ipcMain.handle('start-download', () => {
    autoUpdater.downloadUpdate()
  })

  // Install now
  ipcMain.handle('quit-and-install', () => {
    trackAnalytics('update_installed')
    autoUpdater.quitAndInstall(false, true)
  })
}
