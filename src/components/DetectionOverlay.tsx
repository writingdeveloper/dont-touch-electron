interface DetectionOverlayProps {
  faceLandmarksCount: number | null
  handsCount: number
  isRunning: boolean
}

export function DetectionOverlay({ faceLandmarksCount, handsCount, isRunning }: DetectionOverlayProps) {
  if (!isRunning) return null

  return (
    <div className="detection-info-panel">
      <div className="detection-info-box">
        <div className="info-row">
          <span className="info-label">Face:</span>
          <span className="info-value">{faceLandmarksCount ? `${faceLandmarksCount} pts` : 'None'}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Hands:</span>
          <span className="info-value">{handsCount}</span>
        </div>
      </div>

      <style>{`
        .detection-info-panel {
          position: absolute;
          bottom: 20px;
          right: 20px;
          z-index: 20;
          pointer-events: none;
        }

        .detection-info-box {
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 8px;
          padding: 8px 12px;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 12px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          line-height: 1.5;
        }

        .info-label {
          color: #888;
        }

        .info-value {
          color: #00ff00;
          font-weight: 500;
        }
      `}</style>
    </div>
  )
}
