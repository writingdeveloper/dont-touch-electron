import { DetectionState } from '../detection/types'
import { useLanguage } from '../i18n/LanguageContext'

interface StatusBarProps {
  isModelLoaded: boolean
  isRunning: boolean
  detectionState: DetectionState
  progress: number
  isNearHead: boolean
}

export function StatusBar({
  isModelLoaded,
  isRunning,
  detectionState,
  progress,
  isNearHead,
}: StatusBarProps) {
  const { t } = useLanguage()

  const getStateInfo = () => {
    switch (detectionState) {
      case 'ALERT':
        return { color: '#ff4444', text: t.statusAlert, icon: 'WARN', bgColor: 'rgba(255, 68, 68, 0.15)' }
      case 'DETECTING':
        return { color: '#ffaa00', text: t.statusDetecting, icon: 'SCAN', bgColor: 'rgba(255, 170, 0, 0.15)' }
      case 'COOLDOWN':
        return { color: '#6c757d', text: t.statusCooldown, icon: 'WAIT', bgColor: 'rgba(108, 117, 125, 0.15)' }
      default:
        return { color: '#00ff88', text: t.statusMonitoring, icon: 'OK', bgColor: 'rgba(0, 255, 136, 0.1)' }
    }
  }

  const stateInfo = getStateInfo()

  return (
    <div className="status-bar-container">
      <div className="status-metrics">
        {/* System Status */}
        <div className="metric-card">
          <div className="metric-label">{t.statusSystem}</div>
          <div className="metric-value" style={{ color: isModelLoaded ? '#00ff88' : '#ffaa00' }}>
            {isModelLoaded ? t.statusReady : t.statusInit}
          </div>
          <div className={`status-led ${isModelLoaded ? 'led-green' : 'led-yellow'}`} />
        </div>

        {/* Detection Status */}
        <div className="metric-card">
          <div className="metric-label">{t.statusDetection}</div>
          <div className="metric-value" style={{ color: isRunning ? '#00ffff' : '#666' }}>
            {isRunning ? t.statusActive : t.statusStandby}
          </div>
          <div className={`status-led ${isRunning ? 'led-cyan pulse' : 'led-off'}`} />
        </div>

        {/* Current State */}
        <div className="metric-card state-card" style={{ borderColor: stateInfo.color }}>
          <div className="metric-label">{t.statusStatus}</div>
          <div className="metric-value" style={{ color: stateInfo.color }}>
            [{stateInfo.icon}] {stateInfo.text}
          </div>
          <div
            className={`status-led ${detectionState === 'ALERT' ? 'led-red pulse-fast' : detectionState === 'DETECTING' ? 'led-yellow pulse' : 'led-green'}`}
          />
        </div>

        {/* Proximity */}
        <div className="metric-card">
          <div className="metric-label">{t.statusProximity}</div>
          <div className="metric-value" style={{ color: isNearHead ? '#ff4444' : '#00ff88' }}>
            {isNearHead ? t.statusNear : t.statusSafe}
          </div>
          <div className={`status-led ${isNearHead ? 'led-red pulse' : 'led-green'}`} />
        </div>
      </div>

      {/* Progress Bar - shown during DETECTING state */}
      {(detectionState === 'DETECTING' || detectionState === 'COOLDOWN') && (
        <div className="detection-progress">
          <div className="progress-header">
            <span className="progress-title">
              {detectionState === 'DETECTING' ? t.progressAlertThreshold : t.progressCooldownTimer}
            </span>
            <span className="progress-value" style={{
              color: detectionState === 'DETECTING' ? '#ffaa00' : '#6c757d'
            }}>
              {(progress * 100).toFixed(0)}%
            </span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${detectionState === 'DETECTING' ? 'fill-warning' : 'fill-cooldown'}`}
              style={{ width: `${progress * 100}%` }}
            />
            <div className="progress-glow" style={{
              left: `${progress * 100}%`,
              opacity: detectionState === 'DETECTING' ? 1 : 0.5
            }} />
          </div>
          <div className="progress-time">
            {detectionState === 'DETECTING'
              ? `${t.progressAlertIn} ${((1 - progress) * 1).toFixed(1)}s`
              : `${t.progressResumeIn} ${((1 - progress) * 3).toFixed(1)}s`
            }
          </div>
        </div>
      )}

      <style>{`
        .status-bar-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .status-metrics {
          display: flex;
          gap: 8px;
          flex-wrap: nowrap;
          overflow-x: auto;
        }

        .metric-card {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 255, 255, 0.2);
          border-radius: 6px;
          padding: 6px 10px;
          min-width: 70px;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent);
        }

        .metric-card.state-card {
          border-width: 2px;
          min-width: 120px;
        }

        .metric-label {
          font-size: 8px;
          color: #666;
          letter-spacing: 1px;
          margin-bottom: 2px;
          font-family: monospace;
          text-transform: uppercase;
        }

        .metric-value {
          font-size: 11px;
          font-weight: 600;
          font-family: 'Consolas', 'Monaco', monospace;
          letter-spacing: 0.5px;
        }

        .status-led {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          box-shadow: 0 0 4px currentColor;
        }

        .led-green {
          background: #00ff88;
          box-shadow: 0 0 8px #00ff88;
        }

        .led-cyan {
          background: #00ffff;
          box-shadow: 0 0 8px #00ffff;
        }

        .led-yellow {
          background: #ffaa00;
          box-shadow: 0 0 8px #ffaa00;
        }

        .led-red {
          background: #ff4444;
          box-shadow: 0 0 8px #ff4444;
        }

        .led-off {
          background: #333;
          box-shadow: none;
        }

        .pulse {
          animation: led-pulse 1.5s ease-in-out infinite;
        }

        .pulse-fast {
          animation: led-pulse 0.5s ease-in-out infinite;
        }

        @keyframes led-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px currentColor; }
          50% { opacity: 0.5; box-shadow: 0 0 4px currentColor; }
        }

        .detection-progress {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(0, 255, 255, 0.15);
          border-radius: 6px;
          padding: 8px 12px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .progress-title {
          font-size: 9px;
          color: #888;
          letter-spacing: 0.5px;
          font-family: monospace;
        }

        .progress-value {
          font-size: 12px;
          font-weight: bold;
          font-family: 'Consolas', monospace;
        }

        .progress-track {
          position: relative;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: visible;
        }

        .progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.1s linear;
        }

        .fill-warning {
          background: linear-gradient(90deg, #ffaa00, #ff4444);
        }

        .fill-cooldown {
          background: linear-gradient(90deg, #6c757d, #4a5568);
        }

        .progress-glow {
          position: absolute;
          top: -3px;
          width: 3px;
          height: 10px;
          background: white;
          border-radius: 2px;
          transform: translateX(-50%);
          box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
          transition: left 0.1s linear;
        }

        .progress-time {
          font-size: 9px;
          color: #888;
          margin-top: 4px;
          text-align: center;
          font-family: monospace;
        }

        @media (max-width: 500px) {
          .metric-card {
            min-width: 60px;
            padding: 4px 8px;
          }

          .metric-card.state-card {
            min-width: 90px;
          }

          .metric-label {
            font-size: 7px;
          }

          .metric-value {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  )
}
