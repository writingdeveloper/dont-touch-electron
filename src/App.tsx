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

function App() {
  const { t, language } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [showMeditationModal, setShowMeditationModal] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const detectingStartTimeRef = useRef<number | null>(null)

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

  useEffect(() => {
    if (!showAlert) return

    const checkInterval = setInterval(() => {
      const handNear = isHandNearHead()

      window.ipcRenderer?.invoke('update-alert-data', {
        canDismiss: !handNear,
        activeZone,
        language,
      })

      if (!handNear) {
        setShowAlert(false)
        window.ipcRenderer?.invoke('hide-fullscreen-alert')
        clearInterval(checkInterval)
      }
    }, 100)

    return () => clearInterval(checkInterval)
  }, [showAlert, activeZone, language, isHandNearHead])

  useEffect(() => {
    if (showAlert && detectionState === 'IDLE') {
      setShowAlert(false)
      window.ipcRenderer?.invoke('hide-fullscreen-alert')
    }
  }, [showAlert, detectionState])

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
          </div>
          <div className="status-indicator" style={{ color: status.color }}>
            <span className="status-dot" style={{ background: status.color }} />
            {status.text}
          </div>
        </div>
        <div className="header-right">
          <button className="header-btn" onClick={() => setShowAbout(true)} title="About">
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
          />
          <div className="window-controls">
            <button
              className="window-btn minimize"
              onClick={() => window.ipcRenderer?.invoke('window-minimize')}
              title="Minimize to tray"
            >
              ─
            </button>
            <button
              className="window-btn close"
              onClick={() => window.ipcRenderer?.invoke('window-close')}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      </header>

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
    </div>
  )
}

export default App
