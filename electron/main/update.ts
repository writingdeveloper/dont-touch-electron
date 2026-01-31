import { app, ipcMain } from 'electron'
import { trackEvent } from '@aptabase/electron/main'
import { autoUpdater, type UpdateInfo, type ProgressInfo } from 'electron-updater'

interface UpdateDownloadedEvent {
  downloadedFile: string;
  version: string;
}

export function update(win: Electron.BrowserWindow) {
  // Configure autoUpdater
  autoUpdater.autoDownload = false
  autoUpdater.disableWebInstaller = false
  autoUpdater.allowDowngrade = false

  // start check
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...')
  })
  // update available
  autoUpdater.on('update-available', (info: UpdateInfo) => {
    console.log('Update available:', info.version)
    win.webContents.send('update-can-available', { update: true, version: app.getVersion(), newVersion: info?.version })
    trackEvent('update_available', {
      current_version: app.getVersion(),
      new_version: info?.version || 'unknown'
    })
  })
  // update not available
  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    console.log('No update available, current version:', app.getVersion())
    win.webContents.send('update-can-available', { update: false, version: app.getVersion(), newVersion: info?.version })
  })
  // error
  autoUpdater.on('error', (err: Error) => {
    console.error('Auto-updater error:', err)
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

  // Start downloading and feedback on progress
  ipcMain.handle('start-download', (event: Electron.IpcMainInvokeEvent) => {
    startDownload(
      (error, progressInfo) => {
        if (error) {
          // feedback download error message
          event.sender.send('update-error', { message: error.message, error })
        } else {
          // feedback update progress message
          event.sender.send('download-progress', progressInfo)
        }
      },
      () => {
        // feedback update downloaded message
        event.sender.send('update-downloaded')
        trackEvent('update_downloaded')
      }
    )
  })

  // Install now
  ipcMain.handle('quit-and-install', () => {
    trackEvent('update_installed')
    autoUpdater.quitAndInstall(false, true)
  })
}

function startDownload(
  callback: (error: Error | null, info: ProgressInfo | null) => void,
  complete: (event: UpdateDownloadedEvent) => void,
) {
  autoUpdater.on('download-progress', (info) => callback(null, info))
  autoUpdater.on('error', (error) => callback(error, null))
  autoUpdater.on('update-downloaded', complete)
  autoUpdater.downloadUpdate()
}
