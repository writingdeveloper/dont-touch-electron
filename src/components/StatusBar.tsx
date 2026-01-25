import { DetectionState } from '../detection/types'

interface StatusBarProps {
  isModelLoaded: boolean
  isRunning: boolean
  detectionState: DetectionState
}

export function StatusBar({ isModelLoaded, isRunning, detectionState }: StatusBarProps) {
  const getStateInfo = () => {
    switch (detectionState) {
      case 'ALERT':
        return { color: 'bg-red-500', text: 'ALERT!' }
      case 'DETECTING':
        return { color: 'bg-yellow-500', text: 'Hand Near Face' }
      case 'COOLDOWN':
        return { color: 'bg-blue-500', text: 'Cooldown' }
      default:
        return { color: 'bg-gray-500', text: 'Idle' }
    }
  }

  const stateInfo = getStateInfo()

  return (
    <div className="status-bar">
      <div className={`status-indicator ${isModelLoaded ? 'bg-green-500' : 'bg-yellow-500'}`}>
        {isModelLoaded ? '✓ Model Ready' : '⏳ Loading...'}
      </div>
      <div className={`status-indicator ${isRunning ? 'bg-green-500' : 'bg-gray-500'}`}>
        {isRunning ? '● Active' : '○ Inactive'}
      </div>
      <div className={`status-indicator ${stateInfo.color}`}>
        {stateInfo.text}
      </div>
    </div>
  )
}
