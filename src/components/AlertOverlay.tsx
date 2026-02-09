import { useState, useEffect, useCallback, useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

interface AlertOverlayProps {
  onDismiss?: () => void
  canDismiss?: boolean
}

export function AlertOverlay({ onDismiss, canDismiss = true }: AlertOverlayProps) {
  const { t } = useLanguage()
  const [isShaking, setIsShaking] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Auto-focus on mount for accessibility
  useEffect(() => {
    overlayRef.current?.focus()
  }, [])

  const handleDismiss = useCallback(() => {
    if (canDismiss) {
      onDismiss?.()
    } else {
      setIsShaking(true)
      setShowHint(true)
      setTimeout(() => setIsShaking(false), 500)
      setTimeout(() => setShowHint(false), 2000)
    }
  }, [canDismiss, onDismiss])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleDismiss()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDismiss])

  return (
    <div
      ref={overlayRef}
      className="alert-overlay-fullscreen"
      onClick={handleDismiss}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      tabIndex={-1}
    >
      {/* Animated background lines */}
      <div className="alert-bg-lines" aria-hidden="true" />

      {/* Corner brackets */}
      <div className="alert-corner top-left" aria-hidden="true" />
      <div className="alert-corner top-right" aria-hidden="true" />
      <div className="alert-corner bottom-left" aria-hidden="true" />
      <div className="alert-corner bottom-right" aria-hidden="true" />

      <div className={`alert-content-fullscreen ${isShaking ? 'shake' : ''}`}>
        <div className="alert-warning-badge">
          <span className="badge-text">{t.alertWarning}</span>
        </div>

        <div className="alert-icon-container" aria-hidden="true">
          <svg className="alert-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h1 id="alert-title" className="alert-title">{t.alertTitle}</h1>
        <p className="alert-subtitle">{t.alertSubtitle}</p>

        <div className="alert-status" role="status" aria-live="assertive">
          <div className="status-line">
            <span className="status-label">{t.alertStatus}:</span>
            <span className="status-value danger">{t.alertViolation}</span>
          </div>
          <div className="status-line">
            <span className="status-label">{t.alertAction}:</span>
            <span className="status-value">{canDismiss ? t.alertClearToDismiss : t.alertHandStillNear}</span>
          </div>
        </div>

        <div className={`alert-hint ${showHint ? 'hint-warning' : ''}`}>
          {showHint
            ? t.alertMoveHandAway
            : t.alertDismissHint
          }
        </div>
      </div>

      <style>{`
        .alert-overlay-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1a0000 0%, #330000 50%, #1a0000 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          cursor: pointer;
          animation: fadeIn 0.3s ease-out;
          overflow: hidden;
        }

        .alert-bg-lines {
          position: absolute;
          top: 0;
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

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .alert-corner {
          position: absolute;
          width: 80px;
          height: 80px;
          z-index: 1;
        }

        .alert-corner::before,
        .alert-corner::after {
          content: '';
          position: absolute;
          background: #ff4444;
        }

        .alert-corner.top-left {
          top: 30px;
          left: 30px;
        }
        .alert-corner.top-left::before {
          width: 4px;
          height: 100%;
          left: 0;
        }
        .alert-corner.top-left::after {
          width: 100%;
          height: 4px;
          top: 0;
        }

        .alert-corner.top-right {
          top: 30px;
          right: 30px;
        }
        .alert-corner.top-right::before {
          width: 4px;
          height: 100%;
          right: 0;
        }
        .alert-corner.top-right::after {
          width: 100%;
          height: 4px;
          top: 0;
        }

        .alert-corner.bottom-left {
          bottom: 30px;
          left: 30px;
        }
        .alert-corner.bottom-left::before {
          width: 4px;
          height: 100%;
          left: 0;
        }
        .alert-corner.bottom-left::after {
          width: 100%;
          height: 4px;
          bottom: 0;
        }

        .alert-corner.bottom-right {
          bottom: 30px;
          right: 30px;
        }
        .alert-corner.bottom-right::before {
          width: 4px;
          height: 100%;
          right: 0;
        }
        .alert-corner.bottom-right::after {
          width: 100%;
          height: 4px;
          bottom: 0;
        }

        .alert-content-fullscreen {
          text-align: center;
          color: white;
          padding: 40px;
          max-width: 700px;
          position: relative;
          z-index: 2;
        }

        .alert-content-fullscreen.shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-15px); }
          20%, 40%, 60%, 80% { transform: translateX(15px); }
        }

        .alert-warning-badge {
          display: inline-block;
          padding: 8px 30px;
          background: #ff4444;
          border-radius: 4px;
          margin-bottom: 30px;
          animation: badge-pulse 1s ease-in-out infinite;
        }

        @keyframes badge-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 68, 68, 0.5); }
          50% { box-shadow: 0 0 40px rgba(255, 68, 68, 0.8); }
        }

        .badge-text {
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 4px;
          font-family: monospace;
        }

        .alert-icon-container {
          margin-bottom: 30px;
        }

        .alert-icon-svg {
          width: 100px;
          height: 100px;
          color: #ff4444;
          animation: icon-pulse 1s ease-in-out infinite;
        }

        @keyframes icon-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255, 68, 68, 0.5)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 20px rgba(255, 68, 68, 0.8)); }
        }

        .alert-title {
          font-size: 42px;
          font-weight: bold;
          margin: 0 0 15px 0;
          letter-spacing: 3px;
          text-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
          font-family: 'Segoe UI', sans-serif;
        }

        .alert-subtitle {
          font-size: 18px;
          color: #ffbbbb;
          margin: 0 0 40px 0;
          letter-spacing: 1px;
        }

        .alert-status {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 68, 68, 0.3);
          border-radius: 8px;
          padding: 20px 30px;
          margin-bottom: 30px;
          display: inline-block;
        }

        .status-line {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 8px 0;
          font-family: monospace;
          font-size: 14px;
        }

        .status-label {
          color: #aaa;
          letter-spacing: 1px;
        }

        .status-value {
          color: #00ff88;
          font-weight: bold;
          letter-spacing: 1px;
        }

        .status-value.danger {
          color: #ff6b6b;
          animation: blink 0.5s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0.5; }
        }

        .alert-hint {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          padding: 12px 25px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 25px;
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
