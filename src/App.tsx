import { useRef, useState, useEffect, useCallback } from 'react'
import { useCamera } from './hooks/useCamera'
import { useDetection } from './hooks/useDetection'
import { useStatistics } from './hooks/useStatistics'
import { VideoPreview } from './components/VideoPreview'
import { Controls } from './components/Controls'
import { SettingsPanel } from './components/SettingsPanel'
import { DailyStatsCard } from './components/DailyStatsCard'
import { MeditationModal } from './components/MeditationModal'
import { CalendarView } from './components/CalendarView'
import { AboutModal } from './components/AboutModal'
import { CloseConfirmModal } from './components/CloseConfirmModal'
import { useLanguage } from './i18n/LanguageContext'
import './App.css'

// Play alert sound with Web Audio API fallback
function playAlertSound() {
  const audio = new Audio('/alert.wav')
  audio.volume = 0.5

  audio.play().catch(() => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch {
      // Silent fallback if audio fails
    }
  })
}

interface AppSettings {
  autoStart: boolean
  minimizeToTray: boolean
  startMinimized: boolean
  hidePreview: boolean
  closeAction: 'ask' | 'quit' | 'tray'
}

const defaultAppSettings: AppSettings = {
  autoStart: false,
  minimizeToTray: true,
  startMinimized: false,
  hidePreview: false,
  closeAction: 'ask',
}

interface UpdateInfo {
  update: boolean
  version: string
  newVersion?: string
}

function App() {
  const { t, language } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [showMeditationModal, setShowMeditationModal] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [appVersion, setAppVersion] = useState('')
  const detectingStartTimeRef = useRef<number | null>(null)

  // Update notification state
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null)
  const [updateBannerDismissed, setUpdateBannerDismissed] = useState(false)
  const [updateDownloading, setUpdateDownloading] = useState(false)
  const [updateProgress, setUpdateProgress] = useState(0)
  const [updateDownloaded, setUpdateDownloaded] = useState(false)

  // App settings state
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('dont-touch-app-settings')
      if (stored) {
        return { ...defaultAppSettings, ...JSON.parse(stored) }
      }
    } catch {
      // Ignore
    }
    return defaultAppSettings
  })

  const updateAppSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...appSettings, ...newSettings }
    setAppSettings(updated)
    try {
      localStorage.setItem('dont-touch-app-settings', JSON.stringify(updated))
    } catch {
      // Ignore
    }
    window.ipcRenderer?.invoke('set-app-settings', updated)
  }

  const handleCloseClick = () => {
    if (appSettings.closeAction === 'ask') {
      setShowCloseModal(true)
    } else if (appSettings.closeAction === 'tray') {
      window.ipcRenderer?.invoke('window-hide')
    } else {
      window.ipcRenderer?.invoke('window-quit')
    }
  }

  const handleCloseAction = (action: 'quit' | 'tray', remember: boolean) => {
    setShowCloseModal(false)
    if (remember) {
      updateAppSettings({ closeAction: action })
    }
    if (action === 'tray') {
      window.ipcRenderer?.invoke('window-hide')
    } else {
      window.ipcRenderer?.invoke('window-quit')
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

    window.ipcRenderer?.on('update-can-available', handleUpdateAvailable)
    window.ipcRenderer?.on('download-progress', handleDownloadProgress)
    window.ipcRenderer?.on('update-downloaded', handleUpdateDownloaded)
    return () => {
      window.ipcRenderer?.off('update-can-available', handleUpdateAvailable)
      window.ipcRenderer?.off('download-progress', handleDownloadProgress)
      window.ipcRenderer?.off('update-downloaded', handleUpdateDownloaded)
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
    detectionState,
    isNearHead,
    progress: detectionProgress,
    activeZone,
    config,
    faceLandmarksCount,
    handsCount,
    startDetection,
    stopDetection,
    isHandNearHead,
    updateConfig,
  } = useDetection({
    videoRef,
    canvasRef,
    onAlert: handleAlert,
  })

  useEffect(() => {
    if (detectionState === 'DETECTING') {
      detectingStartTimeRef.current = Date.now()
    } else if (detectionState === 'ALERT' && detectingStartTimeRef.current) {
      const duration = Date.now() - detectingStartTimeRef.current
      recordTouch(duration, activeZone)
      detectingStartTimeRef.current = null
    }
  }, [detectionState, activeZone, recordTouch])

  useEffect(() => {
    if (shouldRecommendMeditation && !showMeditationModal && !showAlert) {
      setShowMeditationModal(true)
      setMeditationRecommended()
    }
  }, [shouldRecommendMeditation, showMeditationModal, showAlert, setMeditationRecommended])

  function handleAlert() {
    setShowAlert(true)

    window.ipcRenderer?.invoke('show-fullscreen-alert', {
      canDismiss: false,
      activeZone,
      language,
    })

    if (window.ipcRenderer) {
      new Notification(t.appTitle, {
        body: t.alertSubtitle,
        icon: '/favicon.ico'
      })
    }

    playAlertSound()
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

      window.ipcRenderer?.invoke('update-alert-data', {
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
          window.ipcRenderer?.invoke('hide-fullscreen-alert')
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
      window.ipcRenderer?.invoke('hide-fullscreen-alert')
    }
  }, [showAlert, detectionState, isHandNearHead])

  useEffect(() => {
    const handleAlertDismissed = () => setShowAlert(false)
    window.ipcRenderer?.on('alert-dismissed', handleAlertDismissed)
    return () => {
      window.ipcRenderer?.off('alert-dismissed', handleAlertDismissed)
    }
  }, [])

  const handleToggle = useCallback(async () => {
    if (isRunning) {
      stopDetection()
      stopCamera()
      setIsRunning(false)
    } else {
      await startCamera()
      setIsRunning(true)
    }
  }, [isRunning, startCamera, stopCamera, stopDetection])

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
    if (!isRunning) return { text: t.statusStandby, color: '#666' }
    if (detectionState === 'ALERT') return { text: t.statusAlert, color: '#ff4444' }
    if (detectionState === 'DETECTING') return { text: t.statusDetecting, color: '#ffa500' }
    if (detectionState === 'COOLDOWN') return { text: t.statusCooldown, color: '#666' }
    return { text: t.statusMonitoring, color: '#00ff88' }
  }

  const status = getStatusText()

  return (
    <div className="app-container">
      {/* Modern Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-icon">🛡️</span>
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
                <span className="update-banner-icon">✅</span>
                <span className="update-banner-text">
                  {t.updateAvailable}: v{updateAvailable.newVersion}
                </span>
                <button
                  className="update-banner-action-btn install"
                  onClick={() => window.ipcRenderer?.invoke('quit-and-install')}
                >
                  {t.updateInstall}
                </button>
              </>
            ) : updateDownloading ? (
              <>
                <span className="update-banner-icon">⏳</span>
                <span className="update-banner-text">
                  {t.updateDownloading} {updateProgress.toFixed(0)}%
                </span>
                <div className="update-banner-progress">
                  <div className="update-banner-progress-fill" style={{ width: `${updateProgress}%` }} />
                </div>
              </>
            ) : (
              <>
                <span className="update-banner-icon">🎉</span>
                <span className="update-banner-text">
                  {t.updateAvailable}: v{updateAvailable.newVersion}
                </span>
                <button
                  className="update-banner-action-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setUpdateDownloading(true)
                    window.ipcRenderer?.invoke('start-download')
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
          {(detectionState === 'DETECTING' || detectionState === 'COOLDOWN') && (
            <div className="detection-progress">
              <div
                className={`progress-fill ${detectionState === 'DETECTING' ? 'warning' : 'cooldown'}`}
                style={{ width: `${detectionProgress * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Side Panel */}
        <aside className="side-panel">
          <DailyStatsCard
            stats={todayStats}
            progress={progress}
            settings={habitSettings}
          />

          <div className="quick-actions">
            <button className="quick-btn" onClick={() => setShowCalendar(true)}>
              <span>📅</span>
              <span>{t.calendarTitle || '기록'}</span>
            </button>
            <button className="quick-btn meditation" onClick={() => setShowMeditationModal(true)}>
              <span>🧘</span>
              <span>{t.meditationButton || '명상'}</span>
            </button>
          </div>

          <div className="zone-info">
            <span className="zone-title">{t.settingsDetectionZones}</span>
            <div className="zone-list">
              {config.enabledZones.map((zone) => (
                <span key={zone} className={`zone-tag ${activeZone === zone ? 'active' : ''}`}>
                  {t[`zone${zone.charAt(0).toUpperCase() + zone.slice(1)}` as keyof typeof t]}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Controls */}
      <footer className="app-footer">
        <Controls
          isRunning={isRunning}
          isModelLoaded={isModelLoaded}
          onToggle={handleToggle}
        />
      </footer>

      {/* Error */}
      {cameraError && (
        <div className="error-toast">
          {t.cameraError}: {cameraError}
        </div>
      )}

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
