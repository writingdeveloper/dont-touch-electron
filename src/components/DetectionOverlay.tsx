import { DetectionState, DetectionZone } from '../detection/types'
import { CameraStreamInfo, formatCameraStreamInfo } from '../utils/cameraQuality'

interface DetectionOverlayProps {
  faceLandmarksCount: number | null
  handsCount: number
  isRunning: boolean
  cameraStreamInfo?: CameraStreamInfo | null
  activeZone?: DetectionZone | null
  detectionState?: DetectionState
  detectionProgress?: number
  showDebugDetails?: boolean
}

export function DetectionOverlay({
  faceLandmarksCount,
  handsCount,
  isRunning,
  cameraStreamInfo = null,
  activeZone = null,
  detectionState = 'IDLE',
  detectionProgress = 0,
  showDebugDetails = false,
}: DetectionOverlayProps) {
  if (!isRunning) return null

  return (
    <div className="detection-info-panel">
      <div className="detection-info-box">
        <div className="info-title">Camera check</div>
        <div className="info-row">
          <span className="info-label">Face</span>
          <span className={`info-value ${faceLandmarksCount ? 'ready' : 'waiting'}`}>
            {faceLandmarksCount ? 'Ready' : 'Waiting'}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Hands</span>
          <span className={`info-value ${handsCount > 0 ? 'ready' : 'waiting'}`}>
            {handsCount > 0 ? handsCount : 'None'}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Video</span>
          <span className="info-value ready">
            {formatCameraStreamInfo(cameraStreamInfo)}
          </span>
        </div>
        {showDebugDetails && (
          <>
            <div className="info-divider" />
            <div className="info-row">
              <span className="info-label">Zone</span>
              <span className="info-value">{activeZone || 'None'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">State</span>
              <span className="info-value">{detectionState}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Progress</span>
              <span className="info-value">{Math.round(detectionProgress * 100)}%</span>
            </div>
          </>
        )}
      </div>

      <style>{`
        .detection-info-panel {
          position: absolute;
          bottom: 20px;
          right: 20px;
          z-index: var(--z-video-hud);
          pointer-events: none;
        }

        .detection-info-box {
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(125, 211, 252, 0.24);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 12px;
          min-width: 132px;
        }

        .info-title {
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .info-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          line-height: 1.5;
        }

        .info-divider {
          height: 1px;
          margin: 6px 0;
          background: rgba(148, 163, 184, 0.2);
        }

        .info-label {
          color: #94a3b8;
        }

        .info-value {
          font-variant-numeric: tabular-nums;
          font-weight: 500;
        }

        .info-value.ready {
          color: #86efac;
        }

        .info-value.waiting {
          color: #fbbf24;
        }
      `}</style>
    </div>
  )
}
