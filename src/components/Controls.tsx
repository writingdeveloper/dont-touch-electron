import { useLanguage } from '../i18n/LanguageContext'

interface ControlsProps {
  isRunning: boolean
  isModelLoaded: boolean
  isStarting?: boolean
  onToggle: () => void
  isAlertTimeoutActive?: boolean
  alertTimeoutRemainingLabel?: string
  alertTimeoutDisabled?: boolean
  onStartAlertTimeout?: () => void
  onStopAlertTimeout?: () => void
}

export function Controls({
  isRunning,
  isModelLoaded,
  isStarting = false,
  onToggle,
  isAlertTimeoutActive = false,
  alertTimeoutRemainingLabel = '',
  alertTimeoutDisabled = false,
  onStartAlertTimeout,
  onStopAlertTimeout,
}: ControlsProps) {
  const { t } = useLanguage()
  const isDisabled = !isModelLoaded || isStarting
  const buttonLabel = isStarting ? t.controlStartingCamera : isRunning ? t.controlStop : t.controlStart
  const breakLabel = isAlertTimeoutActive
    ? `${t.alertTimeoutButton} - ${alertTimeoutRemainingLabel}`
    : t.alertTimeoutButton
  const isBreakDisabled = alertTimeoutDisabled && !isAlertTimeoutActive

  return (
    <div className="controls">
      <button
        className={`control-button ${isRunning ? 'stop' : 'start'}`}
        onClick={onToggle}
        disabled={isDisabled}
        aria-pressed={isRunning}
        aria-label={buttonLabel}
      >
        <span className="button-icon" aria-hidden="true">
          {isStarting ? (
            <span className="button-spinner" />
          ) : isRunning ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="3" width="10" height="10" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2.5v11l10-5.5z" />
            </svg>
          )}
        </span>
        {buttonLabel}
      </button>

      <button
        type="button"
        className={`break-button ${isAlertTimeoutActive ? 'active' : ''}`}
        onClick={isAlertTimeoutActive ? onStopAlertTimeout : onStartAlertTimeout}
        disabled={isBreakDisabled}
        aria-pressed={isAlertTimeoutActive}
        aria-label={breakLabel}
        title={isBreakDisabled ? t.alertTimeoutStartDetectionFirst : breakLabel}
      >
        <span className="button-icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </span>
        {breakLabel}
      </button>

      {(!isModelLoaded || isStarting) && (
        <div className="loading-indicator" role="status" aria-busy="true">
          <div className="loading-spinner" aria-hidden="true" />
          <span className="loading-text">{isStarting ? t.controlRequestingCamera : t.controlLoading}</span>
        </div>
      )}

      <style>{`
        .controls {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .control-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 210px;
          padding: 12px 28px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid transparent;
          border-radius: 6px;
          cursor: pointer;
          transition:
            background-color var(--motion-fast) var(--motion-ease),
            border-color var(--motion-fast) var(--motion-ease),
            color var(--motion-fast) var(--motion-ease),
            transform var(--motion-fast) var(--motion-ease);
          letter-spacing: 0;
          white-space: nowrap;
        }

        .control-button:active:not(:disabled) {
          transform: translateY(1px);
        }

        .button-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .button-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.34);
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.85s linear infinite;
        }

        .control-button.start {
          background: #2563eb;
          border-color: rgba(125, 211, 252, 0.35);
          color: #eff6ff;
        }

        .control-button.start:hover {
          background: #1d4ed8;
          border-color: rgba(191, 219, 254, 0.55);
        }

        .control-button.stop {
          background: rgba(245, 158, 11, 0.14);
          border-color: rgba(245, 158, 11, 0.42);
          color: #fef3c7;
        }

        .control-button.stop:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(251, 191, 36, 0.62);
        }

        .control-button:disabled {
          background: rgba(148, 163, 184, 0.1);
          border-color: rgba(148, 163, 184, 0.16);
          color: #94a3b8;
          cursor: not-allowed;
        }

        .break-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-width: 128px;
          min-height: 36px;
          padding: 8px 13px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 550;
          letter-spacing: 0;
          white-space: nowrap;
          transition:
            background-color var(--motion-fast) var(--motion-ease),
            border-color var(--motion-fast) var(--motion-ease),
            color var(--motion-fast) var(--motion-ease),
            transform var(--motion-fast) var(--motion-ease);
        }

        .break-button:hover:not(:disabled) {
          background: rgba(125, 211, 252, 0.08);
          border-color: rgba(125, 211, 252, 0.28);
          color: #e0f2fe;
        }

        .break-button.active {
          background: rgba(125, 211, 252, 0.13);
          border-color: rgba(125, 211, 252, 0.42);
          color: #bae6fd;
        }

        .break-button:active:not(:disabled) {
          transform: translateY(1px);
        }

        .break-button:disabled {
          color: #64748b;
          border-color: rgba(148, 163, 184, 0.12);
          background: rgba(148, 163, 184, 0.06);
          cursor: not-allowed;
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
        }

        .loading-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top-color: #22d3ee;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          font-size: 12px;
          color: #cbd5e1;
        }

        @media (max-width: 560px) {
          .controls {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

          .control-button,
          .break-button {
            width: 100%;
            min-width: 0;
          }

          .loading-indicator {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
