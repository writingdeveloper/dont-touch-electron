import { useState, useEffect, useRef, useCallback, RefObject } from 'react'
import { YoloDetector } from '../detection/YoloDetector'
import { ProximityAnalyzer } from '../detection/ProximityAnalyzer'
import { DetectionState } from '../detection/types'

interface UseDetectionOptions {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  onAlert: () => void
}

interface UseDetectionReturn {
  isModelLoaded: boolean
  detectionState: DetectionState
  startDetection: () => void
  stopDetection: () => void
}

export function useDetection({
  videoRef,
  canvasRef,
  onAlert,
}: UseDetectionOptions): UseDetectionReturn {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [detectionState, setDetectionState] = useState<DetectionState>('IDLE')

  const detectorRef = useRef<YoloDetector | null>(null)
  const analyzerRef = useRef<ProximityAnalyzer | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isRunningRef = useRef(false)

  // Initialize detector and analyzer
  useEffect(() => {
    async function init() {
      try {
        detectorRef.current = new YoloDetector()
        await detectorRef.current.loadModel()

        analyzerRef.current = new ProximityAnalyzer({
          triggerTime: 1.0,
          cooldownTime: 3.0,
          sensitivity: 0.5,
        })

        analyzerRef.current.setAlertCallback(() => {
          onAlert()
        })

        analyzerRef.current.setStateCallback((state) => {
          setDetectionState(state)
        })

        setIsModelLoaded(true)
      } catch (err) {
        console.error('Failed to load detection model:', err)
      }
    }

    init()

    return () => {
      detectorRef.current?.dispose()
    }
  }, [onAlert])

  const runDetection = useCallback(async () => {
    if (!isRunningRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const detector = detectorRef.current
    const analyzer = analyzerRef.current

    if (!video || !canvas || !detector || !analyzer) {
      animationFrameRef.current = requestAnimationFrame(runDetection)
      return
    }

    if (video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(runDetection)
      return
    }

    try {
      const results = await detector.detect(video)

      // Draw results on canvas
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        detector.drawResults(ctx, results)
      }

      // Analyze proximity
      analyzer.update(results.hands, results.head)
    } catch (err) {
      console.error('Detection error:', err)
    }

    animationFrameRef.current = requestAnimationFrame(runDetection)
  }, [videoRef, canvasRef])

  const startDetection = useCallback(() => {
    isRunningRef.current = true
    runDetection()
  }, [runDetection])

  const stopDetection = useCallback(() => {
    isRunningRef.current = false
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setDetectionState('IDLE')
  }, [])

  return {
    isModelLoaded,
    detectionState,
    startDetection,
    stopDetection,
  }
}
