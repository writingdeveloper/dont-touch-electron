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
      setShowHint(true)
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
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="fullscreen-alert-title"
      aria-describedby="fullscreen-alert-subtitle"
    >
      <div className="alert-content">
        <div className="alert-attention-badge">
          <span className="badge-text">{t.alertWarning}</span>
        </div>

        <div className="alert-icon-container">
          <svg className="alert-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 11.5V7a2 2 0 0 1 4 0v3" />
            <path d="M11 10V5a2 2 0 0 1 4 0v6" />
            <path d="M15 11V7a2 2 0 0 1 4 0v7a7 7 0 0 1-14 0v-2.5a2 2 0 0 1 4 0V14" />
            <path d="M4 4l16 16" />
          </svg>
        </div>

        <h1 className="alert-title" id="fullscreen-alert-title">{t.alertTitle}</h1>
        <p className="alert-subtitle" id="fullscreen-alert-subtitle">{t.alertSubtitle}</p>

        <div className="alert-status">
          <div className="status-line">
            <span className="status-label">{t.alertStatus}:</span>
            <span className="status-value attention">{t.alertViolation}</span>
          </div>
          {alertData.activeZone && (
            <div className="status-line">
              <span className="status-label">{t.alertZoneDetected}:</span>
              <span className="status-value zone">{getZoneName(alertData.activeZone)}</span>
            </div>
          )}
          <div className="status-line">
            <span className="status-label">{t.alertAction}:</span>
            <span className="status-value" style={{ color: alertData.canDismiss ? '#86efac' : '#fbbf24' }}>
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
          background: #14131c;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .alert-content {
          text-align: center;
          color: white;
          padding: 60px;
          max-width: 800px;
          position: relative;
          z-index: 2;
        }

        .alert-attention-badge {
          display: inline-block;
          padding: 10px 24px;
          background: rgba(245, 158, 11, 0.16);
          border: 1px solid rgba(245, 158, 11, 0.35);
          border-radius: 999px;
          margin-bottom: 34px;
        }

        .badge-text {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0;
          color: #fbbf24;
        }

        .alert-icon-container {
          margin-bottom: 40px;
        }

        .alert-icon-svg {
          width: 132px;
          height: 132px;
          color: #f59e0b;
        }

        .alert-title {
          font-size: 52px;
          font-weight: 750;
          margin: 0 0 20px 0;
          letter-spacing: 0;
        }

        .alert-subtitle {
          font-size: 22px;
          color: #fef3c7;
          margin: 0 0 50px 0;
          letter-spacing: 0;
        }

        .alert-status {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(245, 158, 11, 0.28);
          border-radius: 12px;
          padding: 25px 40px;
          margin-bottom: 40px;
          display: inline-block;
          width: min(440px, calc(100vw - 48px));
        }

        .status-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin: 12px 0;
          font-size: 16px;
        }

        .status-label {
          color: #888;
          letter-spacing: 0;
        }

        .status-value {
          font-weight: bold;
          letter-spacing: 0;
        }

        .status-value.attention {
          color: #fbbf24;
        }

        .status-value.zone {
          color: #7dd3fc;
        }

        .alert-hint {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.5);
          padding: 15px 30px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          display: inline-block;
          transition: all 0.3s ease;
          letter-spacing: 0;
        }

        .alert-hint.hint-warning {
          color: #fbbf24;
          background: rgba(245, 158, 11, 0.15);
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
