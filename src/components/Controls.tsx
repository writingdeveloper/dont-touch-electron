import { useLanguage } from '../i18n/LanguageContext'

interface ControlsProps {
  isRunning: boolean
  isModelLoaded: boolean
  onToggle: () => void
}

export function Controls({ isRunning, isModelLoaded, onToggle }: ControlsProps) {
  const { t } = useLanguage()

  return (
    <div className="controls">
      <button
        className={`control-button ${isRunning ? 'stop' : 'start'}`}
        onClick={onToggle}
        disabled={!isModelLoaded}
      >
        <span className="button-icon">
          {isRunning ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="3" width="10" height="10" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 2.5v11l10-5.5z" />
            </svg>
          )}
        </span>
        {isRunning ? t.controlStop : t.controlStart}
      </button>

      {!isModelLoaded && (
        <div className="loading-indicator">
          <div className="loading-spinner" />
          <span className="loading-text">{t.controlLoading}</span>
        </div>
      )}

      <style>{`
        .controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .control-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 32px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          white-space: nowrap;
        }

        .button-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .control-button.start {
          background: #22c55e;
          color: #fff;
        }

        .control-button.start:hover {
          background: #16a34a;
        }

        .control-button.stop {
          background: #ef4444;
          color: #fff;
        }

        .control-button.stop:hover {
          background: #dc2626;
        }

        .control-button:disabled {
          background: #374151;
          color: #6b7280;
          cursor: not-allowed;
        }

        .loading-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.05);
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
          color: #888;
        }
      `}</style>
    </div>
  )
}
