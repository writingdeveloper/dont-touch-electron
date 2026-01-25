interface ControlsProps {
  isRunning: boolean
  isModelLoaded: boolean
  onToggle: () => void
}

export function Controls({ isRunning, isModelLoaded, onToggle }: ControlsProps) {
  return (
    <div className="controls">
      <button
        className={`control-button ${isRunning ? 'stop' : 'start'}`}
        onClick={onToggle}
        disabled={!isModelLoaded}
      >
        {isRunning ? '■ Stop Detection' : '▶ Start Detection'}
      </button>

      {!isModelLoaded && (
        <p className="loading-text">Loading detection model...</p>
      )}
    </div>
  )
}
