import { app, BrowserWindow, shell, ipcMain, Tray, Menu, nativeImage, screen } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { update } from './update'
import { registerCustomSoundScheme, registerCustomSoundIO } from './customSoundIO'

registerCustomSoundScheme()

// App settings interface and storage
interface AppSettings {
  autoStart: boolean
  minimizeToTray: boolean
  startMinimized: boolean
  hidePreview: boolean
  closeAction: 'ask' | 'quit' | 'tray'
  alertSoundId: string
  alertVolume: number
  rightRailCollapsed: boolean
  alertTimeoutDefaultMinutes: 5 | 10 | 15 | 30 | 45 | 60
  cameraQuality: 'balanced' | 'high' | 'maximum'
  detectionDebugHud: boolean
}

const DEFAULT_APP_SETTINGS: AppSettings = {
  autoStart: false,
  minimizeToTray: true,
  startMinimized: false,
  hidePreview: false,
  closeAction: 'ask',
  alertSoundId: 'tone-chime',
  alertVolume: 0.5,
  rightRailCollapsed: false,
  alertTimeoutDefaultMinutes: 15,
  cameraQuality: 'high',
  detectionDebugHud: false,
}

const APP_SETTINGS_FILE = path.join(app.getPath('userData'), 'app-settings.json')

function loadAppSettings(): AppSettings {
  try {
    if (fs.existsSync(APP_SETTINGS_FILE)) {
      const data = fs.readFileSync(APP_SETTINGS_FILE, 'utf-8')
      const parsed = JSON.parse(data)
      // Merge over defaults and coerce types: a partial/corrupt/older-schema file
      // must not leave fields undefined, which would silently break the
      // close/minimize-to-tray behavior that branches on these booleans.
      if (parsed && typeof parsed === 'object') {
        return coerceAppSettings(parsed)
      }
    }
  } catch (err) {
    console.error('Failed to load app settings:', err)
  }
  return { ...DEFAULT_APP_SETTINGS }
}

function saveAppSettings(settings: AppSettings): void {
  try {
    fs.writeFileSync(APP_SETTINGS_FILE, JSON.stringify(settings, null, 2))
  } catch (err) {
    console.error('Failed to save app settings:', err)
  }
}

let appSettings = loadAppSettings()

function isCloseAction(value: unknown): value is AppSettings['closeAction'] {
  return value === 'ask' || value === 'quit' || value === 'tray'
}

function isAlertTimeoutDefaultMinutes(value: unknown): value is AppSettings['alertTimeoutDefaultMinutes'] {
  return value === 5 || value === 10 || value === 15 || value === 30 || value === 45 || value === 60
}

function isCameraQuality(value: unknown): value is AppSettings['cameraQuality'] {
  return value === 'balanced' || value === 'high' || value === 'maximum'
}

function coerceVolume(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(1, value))
    : DEFAULT_APP_SETTINGS.alertVolume
}

function coerceAppSettings(value: unknown): AppSettings {
  if (!value || typeof value !== 'object') return { ...DEFAULT_APP_SETTINGS }
  const parsed = value as Partial<AppSettings>

  return {
    autoStart: Boolean(parsed.autoStart ?? DEFAULT_APP_SETTINGS.autoStart),
    minimizeToTray: Boolean(parsed.minimizeToTray ?? DEFAULT_APP_SETTINGS.minimizeToTray),
    startMinimized: Boolean(parsed.startMinimized ?? DEFAULT_APP_SETTINGS.startMinimized),
    hidePreview: Boolean(parsed.hidePreview ?? DEFAULT_APP_SETTINGS.hidePreview),
    closeAction: isCloseAction(parsed.closeAction) ? parsed.closeAction : DEFAULT_APP_SETTINGS.closeAction,
    alertSoundId: typeof parsed.alertSoundId === 'string' ? parsed.alertSoundId : DEFAULT_APP_SETTINGS.alertSoundId,
    alertVolume: coerceVolume(parsed.alertVolume),
    rightRailCollapsed: Boolean(parsed.rightRailCollapsed ?? DEFAULT_APP_SETTINGS.rightRailCollapsed),
    alertTimeoutDefaultMinutes: isAlertTimeoutDefaultMinutes(parsed.alertTimeoutDefaultMinutes)
      ? parsed.alertTimeoutDefaultMinutes
      : DEFAULT_APP_SETTINGS.alertTimeoutDefaultMinutes,
    cameraQuality: isCameraQuality(parsed.cameraQuality)
      ? parsed.cameraQuality
      : DEFAULT_APP_SETTINGS.cameraQuality,
    detectionDebugHud: Boolean(parsed.detectionDebugHud ?? DEFAULT_APP_SETTINGS.detectionDebugHud),
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
let alertWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false
let alertShowRequestId = 0

// URL validation for external links
function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

const preload = path.join(__dirname, '../preload/index.js')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

// Tray menu translations
type TrayLang = 'en' | 'ko' | 'ja' | 'zh' | 'es' | 'ru'
const trayTranslations: Record<TrayLang, { show: string; start: string; stop: string; quit: string; tooltip: string }> = {
  en: { show: 'Show App', start: 'Start Detection', stop: 'Stop Detection', quit: 'Quit', tooltip: "Don't Touch" },
  ko: { show: '앱 열기', start: '감지 시작', stop: '감지 중지', quit: '종료', tooltip: '손대지마' },
  ja: { show: 'アプリを表示', start: '検出開始', stop: '検出停止', quit: '終了', tooltip: '触らないで' },
  zh: { show: '显示应用', start: '开始检测', stop: '停止检测', quit: '退出', tooltip: '别碰' },
  es: { show: 'Mostrar App', start: 'Iniciar Detección', stop: 'Detener Detección', quit: 'Salir', tooltip: 'No Toques' },
  ru: { show: 'Показать', start: 'Начать обнаружение', stop: 'Остановить', quit: 'Выход', tooltip: 'Не трогай' },
}

let currentLang: TrayLang = 'en'

function updateTrayMenu(lang: TrayLang) {
  if (!tray) return
  currentLang = lang
  const t = trayTranslations[lang] || trayTranslations.en

  const contextMenu = Menu.buildFromTemplate([
    {
      label: t.show,
      click: () => {
        win?.show()
      },
    },
    {
      label: t.start,
      click: () => {
        win?.webContents.send('toggle-detection', true)
        win?.show()
      },
    },
    {
      label: t.stop,
      click: () => {
        win?.webContents.send('toggle-detection', false)
      },
    },
    { type: 'separator' },
    {
      label: t.quit,
      click: () => {
        isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setToolTip(t.tooltip)
  tray.setContextMenu(contextMenu)
}

function createTray() {
  const iconPath = path.join(process.env.VITE_PUBLIC, 'icon.ico')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  updateTrayMenu(currentLang)

  tray.on('click', () => {
    win?.show()
  })
}

function createAlertWindow() {
  // Get the primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  const { bounds } = primaryDisplay

  alertWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    fullscreen: false, // Don't use fullscreen mode
    fullscreenable: false,
    alwaysOnTop: true,
    frame: false,
    transparent: false,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: true,
    show: false,
    backgroundColor: '#1a0000',
    // Use kiosk mode alternative for Windows
    kiosk: false,
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Set always on top with screen-saver level to cover taskbar
  alertWindow.setAlwaysOnTop(true, 'screen-saver')

  // Load alert page
  if (VITE_DEV_SERVER_URL) {
    alertWindow.loadURL(`${VITE_DEV_SERVER_URL}#/alert`)
  } else {
    alertWindow.loadFile(indexHtml, { hash: '/alert' })
  }

  alertWindow.on('closed', () => {
    alertWindow = null
  })

  return alertWindow
}

async function createWindow() {
  win = new BrowserWindow({
    title: "Don't Touch",
    icon: path.join(process.env.VITE_PUBLIC, 'icon.ico'),
    width: 850,
    height: 680,
    minWidth: 700,
    minHeight: 550,
    maxWidth: 1200,
    maxHeight: 900,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload,
      backgroundThrottling: false, // Keep detection running when alert window takes focus
    },
    show: false,
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool only in development mode AND when not packaged
    if (!app.isPackaged) {
      win.webContents.openDevTools()
    }
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Forward renderer console messages to terminal (for debugging)
  win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    // Only forward debug messages (containing [Debug] or [Proximity])
    if (message.includes('[Debug]') || message.includes('[Proximity]') || message.includes('Touch detected')) {
      const levelStr = ['LOG', 'WARN', 'ERROR'][level] || 'LOG'
      console.log(`[Renderer ${levelStr}] ${message}`)
    }
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isValidExternalUrl(url)) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Show window when ready (unless startMinimized is enabled)
  win.once('ready-to-show', () => {
    if (!appSettings.startMinimized) {
      win?.show()
    }
  })

  // Minimize to tray or quit based on settings
  win.on('close', (event) => {
    if (!isQuitting && appSettings.minimizeToTray) {
      event.preventDefault()
      win?.hide()
    }
  })

  // Auto update
  update(win)
}

// IPC Handlers for fullscreen alert
ipcMain.handle('show-fullscreen-alert', (_, data) => {
  const showRequestId = ++alertShowRequestId

  if (!alertWindow) {
    createAlertWindow()
  }

  const sendDataAndShow = () => {
    if (showRequestId !== alertShowRequestId || !alertWindow) {
      return
    }

    // Ensure window covers entire screen including taskbar
    const primaryDisplay = screen.getPrimaryDisplay()
    const { bounds } = primaryDisplay
    alertWindow?.setBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height })
    alertWindow?.setAlwaysOnTop(true, 'screen-saver')

    alertWindow?.webContents.send('alert-data', data)
    alertWindow?.show()
    alertWindow?.focus()
  }

  if (alertWindow?.webContents.isLoading()) {
    alertWindow?.webContents.once('did-finish-load', sendDataAndShow)
  } else {
    sendDataAndShow()
  }

  return true
})

ipcMain.handle('hide-fullscreen-alert', () => {
  alertShowRequestId++

  if (alertWindow) {
    alertWindow.hide()
  }
  return true
})

ipcMain.handle('update-alert-data', (_, data) => {
  if (alertWindow && alertWindow.isVisible()) {
    alertWindow.webContents.send('alert-data', data)
  }
  return true
})

// Listen for alert window close request from renderer
ipcMain.on('close-alert-window', () => {
  if (alertWindow) {
    alertWindow.hide()
  }
  // Notify main window that alert was dismissed
  win?.webContents.send('alert-dismissed')
})

// DEBUG: Forward renderer logs to main process console (terminal)
ipcMain.on('debug-log', (_, ...args) => {
  console.log('[Renderer]', ...args)
})

// Update tray menu language
ipcMain.on('set-language', (_, lang: string) => {
  if (lang in trayTranslations) {
    updateTrayMenu(lang as TrayLang)
  }
})

// App settings IPC handlers
ipcMain.handle('get-app-settings', () => {
  return appSettings
})

ipcMain.handle('set-app-settings', (_, settings: AppSettings) => {
  appSettings = coerceAppSettings(settings)
  saveAppSettings(appSettings)

  // Update auto-start setting
  app.setLoginItemSettings({
    openAtLogin: appSettings.autoStart,
    openAsHidden: appSettings.startMinimized,
  })

  return true
})

// App version IPC handler
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

// Window control IPC handlers
ipcMain.handle('window-minimize', () => {
  if (appSettings.minimizeToTray) {
    win?.hide()
  } else {
    win?.minimize()
  }
  return true
})

ipcMain.handle('window-close', () => {
  if (appSettings.minimizeToTray) {
    win?.hide()
  } else {
    isQuitting = true
    app.quit()
  }
  return true
})

// Window hide (minimize to tray)
ipcMain.handle('window-hide', () => {
  win?.hide()
  return true
})

// Window quit (close app)
ipcMain.handle('window-quit', () => {
  isQuitting = true
  app.quit()
  return true
})

app.whenReady().then(() => {
  registerCustomSoundIO()
  createWindow()
  createTray()
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  isQuitting = true
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// Open external URL in default browser (with validation)
ipcMain.handle('open-external', (_, url: string) => {
  if (typeof url === 'string' && isValidExternalUrl(url)) {
    shell.openExternal(url)
  } else {
    console.warn(`[Security] Blocked invalid external URL: ${url}`)
  }
  return true
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
