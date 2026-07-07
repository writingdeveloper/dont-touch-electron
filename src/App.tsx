import { useRef, useState, useEffect, useCallback } from 'react'
import { useCamera } from './hooks/useCamera'
import { useDetection } from './hooks/useDetection'
import { useStatistics } from './hooks/useStatistics'
import { VideoPreview } from './components/VideoPreview'
import { Controls } from './components/Controls'
import { SettingsPanel } from './components/SettingsPanel'
import { ActivityRail } from './components/ActivityRail'
import { MeditationModal } from './components/MeditationModal'
import { CalendarView } from './components/CalendarView'
import { AboutModal } from './components/AboutModal'
import { CloseConfirmModal } from './components/CloseConfirmModal'
import { RecoveryPanel } from './components/RecoveryPanel'
import { useLanguage } from './i18n/LanguageContext'
import { AlertTimeoutState, AppSettings, DEFAULT_APP_SETTINGS } from './types/app-settings'
import { STORAGE_KEYS } from './constants/storage-keys'
import { IPC_CHANNELS } from './constants/ipc-channels'
import { safeInvoke } from './utils/ipc'
import {
  clearAlertTimeout,
  coerceAlertTimeoutMinutes,
  createAlertTimeout,
  formatAlertTimeoutRemaining,
  getAlertTimeoutRemainingMs,
  isAlertTimeoutActive,
  loadAlertTimeout,
  saveAlertTimeout,
} from './utils/alertTimeout'
import { shouldSuppressReminderSideEffects } from './utils/alertGate'
import { AlertSoundService } from './audio/AlertSoundService'
import { PRESET_BASE_URL } from './audio/soundPresets'
import { resolveCustomSoundUrl } from './audio/customSoundStorage'
import './App.css'

interface UpdateInfo {
  update: boolean
  version: string
  newVersion?: string
}

function App() {
  const { t, language } = useLanguage()
  const alertSoundServiceRef = useRef(
    new AlertSoundService({
      presetBaseUrl: PRESET_BASE_URL,
      resolveCustomSoundUrl,
    })
  )
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isStartingCamera, setIsStartingCamera] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [showMeditationModal, setShowMeditationModal] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [appVersion, setAppVersion] = useState('')
  const detectingStartTimeRef = useRef<number | null>(null)
  const [setupComplete, setSetupComplete] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SETUP_COMPLETE) === 'true'
    } catch {
      return false
    }
  })

  // Update notification state
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null)
  const [updateBannerDismissed, setUpdateBannerDismissed] = useState(false)
  const [updateDownloading, setUpdateDownloading] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)
  const [updateDownloaded, setUpdateDownloaded] = useState(false)

  // App settings state
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.APP_SETTINGS)
      if (stored) {
        const parsed = { ...DEFAULT_APP_SETTINGS, ...JSON.parse(stored) }
        return {
          ...parsed,
          rightRailCollapsed: Boolean(parsed.rightRailCollapsed),
          alertTimeoutDefaultMinutes: coerceAlertTimeoutMinutes(parsed.alertTimeoutDefaultMinutes),
        }
      }
    } catch {
      // Ignore
    }
    return DEFAULT_APP_SETTINGS
  })
  const [alertTimeout, setAlertTimeout] = useState<AlertTimeoutState | null>(() => {
    try {
      return loadAlertTimeout(localStorage)
    } catch {
      return null
    }
  })
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [resumeAfterHandClear, setResumeAfterHandClear] = useState(false)

  const alertTimeoutActive = isAlertTimeoutActive(alertTimeout, nowMs)
  const alertTimeoutRemainingMs = getAlertTimeoutRemainingMs(alertTimeout, nowMs)
  const remindersSuppressed = shouldSuppressReminderSideEffects({
    alertTimeoutActive,
    resumeAfterHandClear,
  })

  const updateAppSettings = (newSettings: Partial<AppSettings>) => {
    const merged = { ...appSettings, ...newSettings }
    const updated = {
      ...merged,
      rightRailCollapsed: Boolean(merged.rightRailCollapsed),
      alertTimeoutDefaultMinutes: coerceAlertTimeoutMinutes(merged.alertTimeoutDefaultMinutes),
    }
    setAppSettings(updated)
    try {
      localStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(updated))
    } catch {
      // Ignore
    }
    safeInvoke(IPC_CHANNELS.SET_APP_SETTINGS, updated)
  }

  const handleCloseClick = () => {
    if (appSettings.closeAction === 'ask') {
      setShowCloseModal(true)
    } else if (appSettings.closeAction === 'tray') {
      safeInvoke(IPC_CHANNELS.WINDOW_HIDE)
    } else {
      safeInvoke(IPC_CHANNELS.WINDOW_QUIT)
    }
  }

  const handleCloseAction = (action: 'quit' | 'tray', remember: boolean) => {
    setShowCloseModal(false)
    if (remember) {
      updateAppSettings({ closeAction: action })
    }
    if (action === 'tray') {
      safeInvoke(IPC_CHANNELS.WINDOW_HIDE)
    } else {
      safeInvoke(IPC_CHANNELS.WINDOW_QUIT)
    }
  }

  useEffect(() => {
    window.appInfo?.getVersion().then(setAppVersion).catch(() => {})
  }, [])

  // Listen for update availability (from splash screen check or manual check)
  useEffect(() => {
    const handleUpdateAvailable = (_event: Electron.IpcRendererEvent, info: UpdateInfo) => {
      if (info.update) {
        setUpdateAvailable(info)
        // Auto-open About modal when update is available
        setShowAbout(true)
      }
    }

    const handleDownloadProgress = (_event: Electron.IpcRendererEvent, info: { percent: number }) => {
      setUpdateDownloading(true)
      setUpdateProgress(info.percent || 0)
    }

    const handleUpdateDownloaded = () => {
      setUpdateDownloading(false)
      setUpdateDownloaded(true)
      setUpdateProgress(100)
    }

    window.ipcRenderer?.on(IPC_CHANNELS.UPDATE_CAN_AVAILABLE, handleUpdateAvailable)
    window.ipcRenderer?.on(IPC_CHANNELS.DOWNLOAD_PROGRESS, handleDownloadProgress)
    window.ipcRenderer?.on(IPC_CHANNELS.UPDATE_DOWNLOADED, handleUpdateDownloaded)

    // The splash screen runs the update check before this component mounts, so
    // the one-shot 'update-can-available' broadcast can fire with no listener.
    // Fetch any result that resolved during the splash so the banner still shows.
    window.ipcRenderer?.invoke(IPC_CHANNELS.GET_UPDATE_STATUS).then((info: UpdateInfo | null) => {
      if (info?.update) {
        setUpdateAvailable(info)
        setShowAbout(true)
      }
    }).catch(() => {})

    return () => {
      window.ipcRenderer?.off(IPC_CHANNELS.UPDATE_CAN_AVAILABLE, handleUpdateAvailable)
      window.ipcRenderer?.off(IPC_CHANNELS.DOWNLOAD_PROGRESS, handleDownloadProgress)
      window.ipcRenderer?.off(IPC_CHANNELS.UPDATE_DOWNLOADED, handleUpdateDownloaded)
    }
  }, [])

  const {
    stream,
    error: cameraError,
    devices: cameraDevices,
    selectedDeviceId: selectedCameraId,
    startCamera,
    stopCamera,
    setSelectedDeviceId: setSelectedCameraId,
    refreshDevices,
  } = useCamera()

  const {
    todayTouchCount,
    todayStats,
    progress,
    settings: habitSettings,
    recordTouch,
    recordMeditation,
    shouldRecommendMeditation,
    setMeditationRecommended,
    updateSettings: updateHabitSettings,
    exportData,
    importData,
    getMonthlyStats,
  } = useStatistics()

  const {
    isModelLoaded,
    modelError,
    detectionState,
    isNearHead,
    progress: detectionProgress,
    activeZone,
    config,
    faceLandmarksCount,
    handsCount,
    startDetection,
    stopDetection,
    retryModelLoad,
    isHandNearHead,
    updateConfig,
  } = useDetection({
    videoRef,
    canvasRef,
    onAlert: handleAlert,
  })

  useEffect(() => {
    if (!alertTimeout) return

    const timer = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [alertTimeout])

  useEffect(() => {
    if (!alertTimeout) return

    if (!alertTimeoutActive) {
      clearAlertTimeout(localStorage)
      setAlertTimeout(null)
      setResumeAfterHandClear(isRunning && isHandNearHead())
    }
  }, [alertTimeout, alertTimeoutActive, isHandNearHead, isRunning])

  useEffect(() => {
    if (resumeAfterHandClear && !isHandNearHead()) {
      setResumeAfterHandClear(false)
    }
  }, [resumeAfterHandClear, isHandNearHead, isNearHead])

  const handleStartAlertTimeout = useCallback(() => {
    const timeout = createAlertTimeout(appSettings.alertTimeoutDefaultMinutes)
    setNowMs(Date.now())
    setAlertTimeout(timeout)
    setResumeAfterHandClear(false)
    saveAlertTimeout(localStorage, timeout)

    alertSoundServiceRef.current.stop()
    if (showAlert) {
      setShowAlert(false)
      safeInvoke(IPC_CHANNELS.HIDE_FULLSCREEN_ALERT)
    }
  }, [appSettings.alertTimeoutDefaultMinutes, showAlert])

  const handleStopAlertTimeout = useCallback(() => {
    clearAlertTimeout(localStorage)
    setAlertTimeout(null)
    setNowMs(Date.now())
    setResumeAfterHandClear(isRunning && isHandNearHead())
  }, [isHandNearHead, isRunning])

  useEffect(() => {
    if (detectionState === 'DETECTING') {
      if (remindersSuppressed) {
        detectingStartTimeRef.current = null
        return
      }
      // Set the start time once, when detection begins — NOT on every activeZone
      // change (the fingertip drifts across zones each frame, which previously kept
      // resetting this ref and under-reported the touch duration).
      if (detectingStartTimeRef.current === null) {
        detectingStartTimeRef.current = Date.now()
      }
    } else if (detectionState === 'ALERT' && detectingStartTimeRef.current !== null) {
      const duration = Date.now() - detectingStartTimeRef.current
      if (!remindersSuppressed) {
        recordTouch(duration, activeZone)
      }
      detectingStartTimeRef.current = null
    } else if (detectionState === 'IDLE' || detectionState === 'COOLDOWN') {
      // Detection ended (with or without an alert) — reset for the next cycle.
      detectingStartTimeRef.current = null
    }
  }, [detectionState, activeZone, recordTouch, remindersSuppressed])

  useEffect(() => {
    if (shouldRecommendMeditation && !showMeditationModal && !showAlert && !remindersSuppressed) {
      setShowMeditationModal(true)
      setMeditationRecommended()
    }
  }, [shouldRecommendMeditation, showMeditationModal, showAlert, setMeditationRecommended, remindersSuppressed])

  function handleAlert() {
    if (remindersSuppressed) return

    setShowAlert(true)

    safeInvoke(IPC_CHANNELS.SHOW_FULLSCREEN_ALERT, {
      canDismiss: false,
      activeZone,
      language,
    })

    if (window.ipcRenderer) {
      new Notification(t.appTitle, {
        body: t.alertSubtitle,
        icon: './favicon.ico'
      })
    }

    void alertSoundServiceRef.current.play(appSettings.alertSoundId, appSettings.alertVolume)
  }

  // Use refs to track alert state without causing effect re-runs
  const alertStartTimeRef = useRef<number>(0)
  const consecutiveNotNearCountRef = useRef<number>(0)

  useEffect(() => {
    if (!showAlert) {
      // Reset refs when alert is hidden
      alertStartTimeRef.current = 0
      consecutiveNotNearCountRef.current = 0
      return
    }

    // Only set start time once when alert first appears
    if (alertStartTimeRef.current === 0) {
      alertStartTimeRef.current = Date.now()
      consecutiveNotNearCountRef.current = 0
    }

    const MINIMUM_ALERT_DURATION = 2000 // Alert must show for at least 2 seconds
    const REQUIRED_CONSECUTIVE_FRAMES = 15 // ~1.5 seconds at 100ms intervals

    const checkInterval = setInterval(() => {
      const handNear = isHandNearHead()
      const elapsedTime = Date.now() - alertStartTimeRef.current

      safeInvoke(IPC_CHANNELS.UPDATE_ALERT_DATA, {
        canDismiss: !handNear && elapsedTime >= MINIMUM_ALERT_DURATION,
        activeZone,
        language,
      })

      // Don't allow dismissal before minimum duration
      if (elapsedTime < MINIMUM_ALERT_DURATION) {
        consecutiveNotNearCountRef.current = 0
        return
      }

      if (!handNear) {
        consecutiveNotNearCountRef.current++
        // Only hide alert after hand has been away for sustained period
        if (consecutiveNotNearCountRef.current >= REQUIRED_CONSECUTIVE_FRAMES) {
          setShowAlert(false)
          safeInvoke(IPC_CHANNELS.HIDE_FULLSCREEN_ALERT)
          clearInterval(checkInterval)
        }
      } else {
        // Reset counter if hand is detected near head again
        consecutiveNotNearCountRef.current = 0
      }
    }, 100)

    return () => clearInterval(checkInterval)
  }, [showAlert, activeZone, language, isHandNearHead])

  useEffect(() => {
    // Only close alert when detection is stopped AND hand is not near head
    // This prevents the alert from flickering when cooldown ends but hand is still touching
    if (showAlert && detectionState === 'IDLE' && !isHandNearHead()) {
      setShowAlert(false)
      safeInvoke(IPC_CHANNELS.HIDE_FULLSCREEN_ALERT)
    }
  }, [showAlert, detectionState, isHandNearHead])

  useEffect(() => {
    const handleAlertDismissed = () => setShowAlert(false)
    window.ipcRenderer?.on(IPC_CHANNELS.ALERT_DISMISSED, handleAlertDismissed)
    return () => {
      window.ipcRenderer?.off(IPC_CHANNELS.ALERT_DISMISSED, handleAlertDismissed)
    }
  }, [])

  const handleToggle = useCallback(async () => {
    if (isRunning) {
      stopDetection()
      stopCamera()
      setIsRunning(false)
    } else {
      setIsStartingCamera(true)
      try {
        const started = await startCamera()
        setIsRunning(started)
      } finally {
        setIsStartingCamera(false)
      }
    }
  }, [isRunning, startCamera, stopCamera, stopDetection])

  const handleRetryCamera = useCallback(async (useDefaultCamera = false) => {
    if (useDefaultCamera) {
      setSelectedCameraId(null)
    }
    setIsStartingCamera(true)
    try {
      const started = await startCamera(useDefaultCamera ? null : undefined)
      setIsRunning(started)
    } finally {
      setIsStartingCamera(false)
    }
  }, [setSelectedCameraId, startCamera])

  const handleSetupComplete = useCallback(() => {
    setSetupComplete(true)
    try {
      localStorage.setItem(STORAGE_KEYS.SETUP_COMPLETE, 'true')
    } catch {
      // Ignore storage errors
    }
  }, [])

  // Tray "Start/Stop Detection" sends this; mirror the in-app toggle so the tray
  // control actually starts/stops detection (it previously had no renderer listener).
  useEffect(() => {
    const handleToggleDetection = (_event: Electron.IpcRendererEvent, shouldStart: boolean) => {
      if (shouldStart !== isRunning) void handleToggle()
    }
    window.ipcRenderer?.on(IPC_CHANNELS.TOGGLE_DETECTION, handleToggleDetection)
    return () => {
      window.ipcRenderer?.off(IPC_CHANNELS.TOGGLE_DETECTION, handleToggleDetection)
    }
  }, [isRunning, handleToggle])

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  useEffect(() => {
    if (isRunning && stream && isModelLoaded) {
      startDetection()
    }
  }, [isRunning, stream, isModelLoaded, startDetection])

  const handleMeditationComplete = (completed: boolean, durationMinutes: number) => {
    if (completed && durationMinutes > 0) {
      recordMeditation(durationMinutes)
    }
    setShowMeditationModal(false)
  }

  const getStatusText = () => {
    if (!isModelLoaded) return { text: t.statusInit, color: '#ffa500' }
    if (!isRunning) return { text: t.statusStandby, color: '#94a3b8' }
    if (alertTimeoutActive) {
      return {
        text: `${t.alertTimeoutButton} · ${formatAlertTimeoutRemaining(alertTimeoutRemainingMs)}`,
        color: '#7dd3fc',
      }
    }
    if (resumeAfterHandClear) return { text: t.alertTimeoutClearToResume, color: '#fbbf24' }
    if (detectionState === 'ALERT') return { text: t.statusAlert, color: '#f59e0b' }
    if (detectionState === 'DETECTING') return { text: t.statusDetecting, color: '#f59e0b' }
    if (detectionState === 'COOLDOWN') return { text: t.statusCooldown, color: '#94a3b8' }
    return { text: t.statusMonitoring, color: '#34d399' }
  }

  const status = getStatusText()
  const recoveryIssues = [cameraError, modelError].filter((issue): issue is NonNullable<typeof issue> => Boolean(issue))

  return (
    <div className="app-container">
      {/* Modern Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3l7 3v5c0 4.5-2.8 8.5-7 10-4.2-1.5-7-5.5-7-10V6l7-3z" />
              </svg>
            </span>
            <span className="logo-text">{t.appTitle}</span>
            {appVersion && <span className="app-version">v{appVersion}</span>}
          </div>
          <div className="status-indicator" style={{ color: status.color }}>
            <span className="status-dot" style={{ background: status.color }} />
            {status.text}
          </div>
        </div>
        <div className="header-right">
          <button className="header-btn" onClick={() => setShowAbout(true)} title={t.buttonAbout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
          <SettingsPanel
            config={config}
            onConfigChange={updateConfig}
            isRunning={isRunning}
            habitSettings={habitSettings}
            onHabitSettingsChange={updateHabitSettings}
            onExportData={exportData}
            onImportData={importData}
            cameraDevices={cameraDevices}
            selectedCameraId={selectedCameraId}
            onCameraChange={setSelectedCameraId}
            hidePreview={appSettings.hidePreview}
            onHidePreviewChange={(hide) => updateAppSettings({ hidePreview: hide })}
            closeAction={appSettings.closeAction}
            onCloseActionChange={(action) => updateAppSettings({ closeAction: action })}
            alertSoundId={appSettings.alertSoundId}
            alertVolume={appSettings.alertVolume}
            onAlertSoundChange={(changes) => updateAppSettings(changes)}
            onPreviewSound={(id) => void alertSoundServiceRef.current.preview(id, appSettings.alertVolume)}
            alertTimeoutDefaultMinutes={appSettings.alertTimeoutDefaultMinutes}
            onAlertTimeoutDefaultChange={(minutes) => updateAppSettings({ alertTimeoutDefaultMinutes: minutes })}
          />
          <div className="window-controls">
            <button
              className="window-btn close"
              onClick={handleCloseClick}
              title={t.buttonClose}
            >
              ✕
            </button>
          </div>
        </div>
      </header>

      {/* Update Banner */}
      {updateAvailable && !updateBannerDismissed && (
        <div className={`update-banner ${updateDownloaded ? 'ready' : updateDownloading ? 'downloading' : ''}`}>
          <div className="update-banner-content">
            {updateDownloaded ? (
              <>
                <span className="update-banner-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span className="update-banner-text">
                  {t.updateAvailable}: v{updateAvailable.newVersion}
                </span>
                <button
                  className="update-banner-action-btn install"
                  onClick={() => safeInvoke(IPC_CHANNELS.QUIT_AND_INSTALL)}
                >
                  {t.updateInstall}
                </button>
              </>
            ) : updateDownloading ? (
              <>
                <span className="update-banner-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
                <span className="update-banner-text">
                  {t.updateDownloading} {updateProgress.toFixed(0)}%
                </span>
                <div className="update-banner-progress">
                  <div className="update-banner-progress-fill" style={{ width: `${updateProgress}%` }} />
                </div>
              </>
            ) : (
              <>
                <span className="update-banner-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
                  </svg>
                </span>
                <span className="update-banner-text">
                  {t.updateAvailable}: v{updateAvailable.newVersion}
                </span>
                <button
                  className="update-banner-action-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setUpdateDownloading(true)
                    safeInvoke(IPC_CHANNELS.START_DOWNLOAD)
                  }}
                >
                  {t.updateDownload}
                </button>
                <button
                  className="update-banner-details"
                  onClick={() => setShowAbout(true)}
                >
                  {t.buttonAbout}
                </button>
              </>
            )}
          </div>
          {!updateDownloading && !updateDownloaded && (
            <button
              className="update-banner-close"
              onClick={(e) => {
                e.stopPropagation()
                setUpdateBannerDismissed(true)
              }}
              title={t.updateLater}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="app-main">
        {/* Video Area */}
        <div className="video-area">
          <VideoPreview
            videoRef={videoRef}
            canvasRef={canvasRef}
            isRunning={isRunning}
            faceLandmarksCount={faceLandmarksCount}
            handsCount={handsCount}
            hidePreview={appSettings.hidePreview}
          />

          {/* Progress Bar (when detecting) */}
          {(detectionState === 'DETECTING' || detectionState === 'COOLDOWN') && !remindersSuppressed && (
            <div className="detection-progress">
              <div
                className={`progress-fill ${detectionState === 'DETECTING' ? 'warning' : 'cooldown'}`}
                style={{ width: `${detectionProgress * 100}%` }}
              />
            </div>
          )}
        </div>

        <ActivityRail
          collapsed={appSettings.rightRailCollapsed}
          todayStats={todayStats}
          progress={progress}
          habitSettings={habitSettings}
          setupComplete={setupComplete}
          enabledZones={config.enabledZones}
          activeZone={activeZone}
          onToggleCollapsed={() => updateAppSettings({ rightRailCollapsed: !appSettings.rightRailCollapsed })}
          onOpenCalendar={() => setShowCalendar(true)}
          onOpenMeditation={() => setShowMeditationModal(true)}
          onSetupComplete={handleSetupComplete}
        />
      </main>

      <RecoveryPanel
        issues={recoveryIssues}
        onRetryCamera={handleRetryCamera}
        onRefreshCameras={() => void refreshDevices()}
        onRetryModel={retryModelLoad}
      />

      {/* Footer Controls */}
      <footer className="app-footer">
        <Controls
          isRunning={isRunning}
          isModelLoaded={isModelLoaded}
          isStarting={isStartingCamera}
          onToggle={handleToggle}
          isAlertTimeoutActive={alertTimeoutActive}
          alertTimeoutRemainingLabel={formatAlertTimeoutRemaining(alertTimeoutRemainingMs)}
          alertTimeoutDisabled={!isRunning}
          onStartAlertTimeout={handleStartAlertTimeout}
          onStopAlertTimeout={handleStopAlertTimeout}
        />
      </footer>

      {/* Modals */}
      {showMeditationModal && (
        <MeditationModal
          touchCount={todayTouchCount}
          onComplete={handleMeditationComplete}
          onDismiss={() => setShowMeditationModal(false)}
          onSnooze={() => setShowMeditationModal(false)}
        />
      )}

      {showCalendar && (
        <CalendarView
          getMonthlyStats={getMonthlyStats}
          settings={habitSettings}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} />
      )}

      {showCloseModal && (
        <CloseConfirmModal
          onClose={handleCloseAction}
          onCancel={() => setShowCloseModal(false)}
        />
      )}
    </div>
  )
}

export default App
