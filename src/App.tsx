import { useRef, useState, useEffect, useCallback } from 'react'
import { useCamera } from './hooks/useCamera'
import { useDetection } from './hooks/useDetection'
import { VideoPreview } from './components/VideoPreview'
import { StatusBar } from './components/StatusBar'
import { Controls } from './components/Controls'
import { AlertOverlay } from './components/AlertOverlay'
import './App.css'

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showAlert, setShowAlert] = useState(false)

  const { stream, error: cameraError, startCamera, stopCamera } = useCamera()
  const { isModelLoaded, detectionState, startDetection, stopDetection } = useDetection({
    videoRef,
    canvasRef,
    onAlert: handleAlert,
  })

  function handleAlert() {
    setShowAlert(true)

    // Send notification via Electron
    if (window.ipcRenderer) {
      new Notification("Don't Touch!", {
        body: 'Your hand is near your face!',
        icon: '/favicon.ico'
      })
    }

    setTimeout(() => setShowAlert(false), 2000)
  }

  const handleToggle = useCallback(async () => {
    if (isRunning) {
      stopDetection()
      stopCamera()
      setIsRunning(false)
    } else {
      await startCamera()
      setIsRunning(true)
    }
  }, [isRunning, startCamera, stopCamera, stopDetection])

  // Connect video stream to video element
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  // Start detection when camera is running
  useEffect(() => {
    if (isRunning && stream && isModelLoaded) {
      startDetection()
    }
  }, [isRunning, stream, isModelLoaded, startDetection])

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Don't Touch</h1>
        <StatusBar
          isModelLoaded={isModelLoaded}
          isRunning={isRunning}
          detectionState={detectionState}
        />
      </header>

      <main className="app-main">
        <VideoPreview
          videoRef={videoRef}
          canvasRef={canvasRef}
          isRunning={isRunning}
        />

        {cameraError && (
          <div className="error-message">
            Camera Error: {cameraError}
          </div>
        )}

        <Controls
          isRunning={isRunning}
          isModelLoaded={isModelLoaded}
          onToggle={handleToggle}
        />
      </main>

      {showAlert && <AlertOverlay />}
    </div>
  )
}

export default App
