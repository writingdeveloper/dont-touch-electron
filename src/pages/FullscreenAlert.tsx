import { useState, useEffect, useCallback } from 'react'
import { useLanguage, getZoneTranslationKey } from '../i18n/LanguageContext'
import { DetectionZone } from '../detection/types'

interface AlertData {
  canDismiss: boolean
  activeZone: DetectionZone | null
  language?: string
}

export function FullscreenAlert() {
  const { t } = useLanguage()
  const [alertData, setAlertData] = useState<AlertData>({
    canDismiss: false, // Start with false since alert shows when hand IS near
    activeZone: null,
  })
  const [isShaking, setIsShaking] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Listen for alert data from main process
  useEffect(() => {
    const handleAlertData = (_event: unknown, data: AlertData) => {
      setAlertData(data)
      // Note: Auto-dismiss is now handled by the main app (App.tsx)
      // This component just updates the display state
    }

    window.ipcRenderer?.on('alert-data', handleAlertData)

    return () => {
      window.ipcRenderer?.off('alert-data', handleAlertData)
    }
  }, [])

  const handleDismiss = useCallback(() => {
    if (alertData.canDismiss) {
      window.ipcRenderer?.send('close-alert-window')
    } else {
      setIsShaking(true)
      setShowHint(true)
      setTimeout(() => setIsShaking(false), 500)
      setTimeout(() => setShowHint(false), 2000)
    }
  }, [alertData.canDismiss])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleDismiss()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDismiss])

  const getZoneName = (zone: DetectionZone | null): string => {
    if (!zone) return ''
    const key = getZoneTranslationKey(zone)
    return t[key] || zone
  }

  return (
    <div
      className="fullscreen-alert"
      onClick={handleDismiss}
    >
      {/* Animated background lines */}
      <div className="alert-bg-lines" />

      {/* Corner brackets */}
      <div className="alert-corner top-left" />
      <div className="alert-corner top-right" />
      <div className="alert-corner bottom-left" />
      <div className="alert-corner bottom-right" />

      <div className={`alert-content ${isShaking ? 'shake' : ''}`}>
        <div className="alert-warning-badge">
          <span className="badge-text">{t.alertWarning}</span>
        </div>

        <div className="alert-icon-container">
          <svg className="alert-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
          </svg>
        </div>

        <h1 className="alert-title">{t.alertTitle}</h1>
        <p className="alert-subtitle">{t.alertSubtitle}</p>

        <div className="alert-status">
          <div className="status-line">
            <span className="status-label">{t.alertStatus}:</span>
            <span className="status-value danger">{t.alertViolation}</span>
          </div>
          {alertData.activeZone && (
            <div className="status-line">
              <span className="status-label">{t.alertZoneDetected}:</span>
              <span className="status-value zone">{getZoneName(alertData.activeZone)}</span>
            </div>
          )}
          <div className="status-line">
            <span className="status-label">{t.alertAction}:</span>
            <span className="status-value" style={{ color: alertData.canDismiss ? '#00ff88' : '#ffaa00' }}>
              {alertData.canDismiss ? t.alertClearToDismiss : t.alertHandStillNear}
            </span>
          </div>
        </div>

        <div className={`alert-hint ${showHint ? 'hint-warning' : ''}`}>
          {showHint ? t.alertMoveHandAway : t.alertDismissHint}
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .fullscreen-alert {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1a0000 0%, #330000 50%, #1a0000 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .alert-bg-lines {
          position: absolute;
          top: -80px;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 40px,
            rgba(255, 0, 0, 0.03) 40px,
            rgba(255, 0, 0, 0.03) 80px
          );
          animation: scroll-lines 20s linear infinite;
        }

        @keyframes scroll-lines {
          0% { transform: translateY(0); }
          100% { transform: translateY(80px); }
        }

        .alert-corner {
          position: absolute;
          width: 100px;
          height: 100px;
          z-index: 1;
        }

        .alert-corner::before,
        .alert-corner::after {
          content: '';
          position: absolute;
          background: #ff4444;
        }

        .alert-corner.top-left {
          top: 40px;
          left: 40px;
        }
        .alert-corner.top-left::before {
          width: 5px;
          height: 100%;
          left: 0;
        }
        .alert-corner.top-left::after {
          width: 100%;
          height: 5px;
          top: 0;
        }

        .alert-corner.top-right {
          top: 40px;
          right: 40px;
        }
        .alert-corner.top-right::before {
          width: 5px;
          height: 100%;
          right: 0;
        }
        .alert-corner.top-right::after {
          width: 100%;
          height: 5px;
          top: 0;
        }

        .alert-corner.bottom-left {
          bottom: 40px;
          left: 40px;
        }
        .alert-corner.bottom-left::before {
          width: 5px;
          height: 100%;
          left: 0;
        }
        .alert-corner.bottom-left::after {
          width: 100%;
          height: 5px;
          bottom: 0;
        }

        .alert-corner.bottom-right {
          bottom: 40px;
          right: 40px;
        }
        .alert-corner.bottom-right::before {
          width: 5px;
          height: 100%;
          right: 0;
        }
        .alert-corner.bottom-right::after {
          width: 100%;
          height: 5px;
          bottom: 0;
        }

        .alert-content {
          text-align: center;
          color: white;
          padding: 60px;
          max-width: 800px;
          position: relative;
          z-index: 2;
        }

        .alert-content.shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-20px); }
          20%, 40%, 60%, 80% { transform: translateX(20px); }
        }

        .alert-warning-badge {
          display: inline-block;
          padding: 12px 40px;
          background: #ff4444;
          border-radius: 4px;
          margin-bottom: 40px;
          animation: badge-pulse 1s ease-in-out infinite;
        }

        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 30px rgba(255, 68, 68, 0.5); }
          50% { box-shadow: 0 0 60px rgba(255, 68, 68, 0.8); }
        }

        .badge-text {
          font-size: 18px;
          font-weight: bold;
          letter-spacing: 6px;
          font-family: monospace;
        }

        .alert-icon-container {
          margin-bottom: 40px;
        }

        .alert-icon-svg {
          width: 140px;
          height: 140px;
          color: #ff4444;
          animation: icon-pulse 1s ease-in-out infinite;
        }

        @keyframes icon-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(255, 68, 68, 0.5)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 30px rgba(255, 68, 68, 0.8)); }
        }

        .alert-title {
          font-size: 56px;
          font-weight: bold;
          margin: 0 0 20px 0;
          letter-spacing: 4px;
          text-shadow: 0 0 40px rgba(255, 68, 68, 0.5);
        }

        .alert-subtitle {
          font-size: 22px;
          color: #ffaaaa;
          margin: 0 0 50px 0;
          letter-spacing: 1px;
        }

        .alert-status {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 68, 68, 0.3);
          border-radius: 12px;
          padding: 25px 40px;
          margin-bottom: 40px;
          display: inline-block;
          min-width: 400px;
        }

        .status-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin: 12px 0;
          font-family: monospace;
          font-size: 16px;
        }

        .status-label {
          color: #888;
          letter-spacing: 1px;
        }

        .status-value {
          font-weight: bold;
          letter-spacing: 1px;
        }

        .status-value.danger {
          color: #ff4444;
          animation: blink 0.5s ease-in-out infinite;
        }

        .status-value.zone {
          color: #ffaa00;
        }

        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0.5; }
        }

        .alert-hint {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.5);
          padding: 15px 30px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 30px;
          display: inline-block;
          transition: all 0.3s ease;
          font-family: monospace;
          letter-spacing: 0.5px;
        }

        .alert-hint.hint-warning {
          color: #FFD700;
          background: rgba(255, 215, 0, 0.15);
          font-weight: bold;
          animation: hint-pulse 0.5s ease-in-out infinite;
        }

        @keyframes hint-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  )
}
