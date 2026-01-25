import { RefObject } from 'react'

interface VideoPreviewProps {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
  isRunning: boolean
}

export function VideoPreview({ videoRef, canvasRef, isRunning }: VideoPreviewProps) {
  return (
    <div className="video-container">
      <video
        ref={videoRef as React.RefObject<HTMLVideoElement>}
        autoPlay
        playsInline
        muted
        className={`video-preview ${isRunning ? 'active' : ''}`}
      />
      <canvas
        ref={canvasRef as React.RefObject<HTMLCanvasElement>}
        className="detection-overlay"
      />
      {!isRunning && (
        <div className="video-placeholder">
          <div className="placeholder-icon">📷</div>
          <span>Camera Off</span>
          <p className="placeholder-hint">Click "Start Detection" to begin</p>
        </div>
      )}
    </div>
  )
}
