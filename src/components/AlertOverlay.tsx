import { useState, useEffect, useCallback, useRef } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

interface AlertOverlayProps {
  onDismiss?: () => void
  canDismiss?: boolean
}

export function AlertOverlay({ onDismiss, canDismiss = true }: AlertOverlayProps) {
  const { t } = useLanguage()
  const [showHint, setShowHint] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    overlayRef.current?.focus()
  }, [])

  const handleDismiss = useCallback(() => {
    if (canDismiss) {
      onDismiss?.()
      return
    }

    setShowHint(true)
    window.setTimeout(() => setShowHint(false), 2000)
  }, [canDismiss, onDismiss])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === ' ' || event.key === 'Enter') {
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
      aria-describedby="alert-subtitle"
      tabIndex={-1}
    >
      <div className="alert-content-fullscreen">
        <div className="alert-attention-badge">
          <span className="badge-text">{t.alertWarning}</span>
        </div>

        <div className="alert-icon-container" aria-hidden="true">
          <svg className="alert-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 11.5V7a2 2 0 0 1 4 0v3" />
            <path d="M11 10V5a2 2 0 0 1 4 0v6" />
            <path d="M15 11V7a2 2 0 0 1 4 0v7a7 7 0 0 1-14 0v-2.5a2 2 0 0 1 4 0V14" />
            <path d="M4 4l16 16" />
          </svg>
        </div>

        <h1 id="alert-title" className="alert-title">{t.alertTitle}</h1>
        <p id="alert-subtitle" className="alert-subtitle">{t.alertSubtitle}</p>

        <div className="alert-status" role="status" aria-live="assertive">
          <div className="status-line">
            <span className="status-label">{t.alertStatus}:</span>
            <span className="status-value attention">{t.alertViolation}</span>
          </div>
          <div className="status-line">
            <span className="status-label">{t.alertAction}:</span>
            <span className={`status-value ${canDismiss ? 'clear' : 'pending'}`}>
              {canDismiss ? t.alertClearToDismiss : t.alertHandStillNear}
            </span>
          </div>
        </div>

        <div className={`alert-hint ${showHint ? 'hint-attention' : ''}`}>
          {showHint ? t.alertMoveHandAway : t.alertDismissHint}
        </div>
      </div>

      <style>{`
        .alert-overlay-fullscreen {
          position: fixed;
          inset: 0;
          background: #14131c;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .alert-content-fullscreen {
          width: min(760px, calc(100vw - 48px));
          text-align: center;
          color: white;
          padding: 56px 32px;
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
          margin-bottom: 34px;
        }

        .alert-icon-svg {
          width: 124px;
          height: 124px;
          color: #f59e0b;
        }

        .alert-title {
          font-size: clamp(34px, 6vw, 52px);
          font-weight: 750;
          margin: 0 0 18px 0;
          letter-spacing: 0;
        }

        .alert-subtitle {
          font-size: clamp(18px, 3vw, 22px);
          color: #fef3c7;
          margin: 0 0 46px 0;
          letter-spacing: 0;
        }

        .alert-status {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(245, 158, 11, 0.28);
          border-radius: 12px;
          padding: 24px 32px;
          margin: 0 auto 36px;
          width: min(440px, 100%);
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
          color: #94a3b8;
          letter-spacing: 0;
        }

        .status-value {
          font-weight: 700;
          letter-spacing: 0;
        }

        .status-value.attention,
        .status-value.pending {
          color: #fbbf24;
        }

        .status-value.clear {
          color: #86efac;
        }

        .alert-hint {
          display: inline-block;
          border-radius: 999px;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.72);
          font-size: 15px;
          letter-spacing: 0;
        }

        .alert-hint.hint-attention {
          background: rgba(245, 158, 11, 0.14);
          color: #fef3c7;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}
