import { describe, it, expect, vi, beforeEach } from 'vitest'

// electron-updater's `autoUpdater` is a process-wide singleton EventEmitter.
// Back it with a real EventEmitter so we assert on genuine listener counts
// (real behaviour) rather than on mock bookkeeping.
vi.mock('electron-updater', async () => {
  const { EventEmitter } = await import('node:events')
  const autoUpdater: any = new EventEmitter()
  autoUpdater.autoDownload = true
  autoUpdater.disableWebInstaller = false
  autoUpdater.allowDowngrade = true
  autoUpdater.checkForUpdates = vi.fn().mockResolvedValue(undefined)
  autoUpdater.checkForUpdatesAndNotify = vi.fn().mockResolvedValue(undefined)
  autoUpdater.downloadUpdate = vi.fn()
  autoUpdater.quitAndInstall = vi.fn()
  return { autoUpdater }
})

// Faithful ipcMain: the real one throws when a channel is registered twice.
vi.mock('electron', () => {
  const handlers = new Map<string, (...args: any[]) => any>()
  return {
    app: { getVersion: () => '1.3.0', isPackaged: true },
    ipcMain: {
      handle: (channel: string, fn: (...args: any[]) => any) => {
        if (handlers.has(channel)) {
          throw new Error(`Attempted to register a second handler for '${channel}'`)
        }
        handlers.set(channel, fn)
      },
      removeHandler: (channel: string) => handlers.delete(channel),
      __handlers: handlers,
    },
  }
})

vi.mock('../../electron/main/analytics', () => ({
  initAnalytics: vi.fn(),
  trackAnalytics: vi.fn().mockResolvedValue(undefined),
}))

const makeWin = () => ({ webContents: { send: vi.fn() } }) as any

beforeEach(async () => {
  // Re-import `update` fresh each test (resets its one-time "wired" guard)...
  vi.resetModules()
  // ...and clear the shared singleton mock state, which vitest keeps alive
  // across resetModules because vi.mock factories are not re-run.
  vi.clearAllMocks()
  const { ipcMain } = await import('electron')
  ;(ipcMain as any).__handlers.clear()
  const { autoUpdater } = await import('electron-updater')
  ;(autoUpdater as any).removeAllListeners()
})

describe('electron/main/update auto-updater wiring', () => {
  it('registers exactly one download-progress listener no matter how many times start-download runs', async () => {
    const { update } = await import('../../electron/main/update')
    const { autoUpdater } = await import('electron-updater')
    const { ipcMain } = await import('electron')

    update(makeWin())
    const startDownload = (ipcMain as any).__handlers.get('start-download')
    startDownload()
    startDownload()
    startDownload()

    expect((autoUpdater as any).listenerCount('download-progress')).toBe(1)
    // ...while still triggering the download each time it is invoked.
    expect((autoUpdater as any).downloadUpdate).toHaveBeenCalledTimes(3)
  })

  it('can be invoked repeatedly (e.g. window re-creation) without throwing or duplicating listeners', async () => {
    const { update } = await import('../../electron/main/update')
    const { autoUpdater } = await import('electron-updater')
    const win = makeWin()

    expect(() => {
      update(win)
      update(win)
      update(win)
    }).not.toThrow()
    expect((autoUpdater as any).listenerCount('update-available')).toBe(1)
  })
})
