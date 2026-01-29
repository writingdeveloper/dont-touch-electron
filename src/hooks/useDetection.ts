import { useState, useEffect, useRef, useCallback, RefObject } from 'react'
import { MediaPipeDetector } from '../detection/MediaPipeDetector'
import { ProximityAnalyzer, ProximityInfo } from '../detection/ProximityAnalyzer'
import { DetectionState, DetectionZone, DEFAULT_ENABLED_ZONES } from '../detection/types'

interface UseDetectionOptions {
  videoRef: RefObject<HTMLVideoElement | null>
  canvasRef: RefObject<HTMLCanvasElement | null>
  onAlert: () => void
}

export interface DetectionConfig {
  triggerTime: number
  cooldownTime: number
  sensitivity: number
  enabledZones: DetectionZone[]
}

interface UseDetectionReturn {
  isModelLoaded: boolean
  detectionState: DetectionState
  isNearHead: boolean
  progress: number
  activeZone: DetectionZone | null
  config: DetectionConfig
  faceLandmarksCount: number | null
  handsCount: number
  startDetection: () => void
  stopDetection: () => void
  isHandNearHead: () => boolean
  updateConfig: (config: Partial<DetectionConfig>) => void
}

const DEFAULT_CONFIG: DetectionConfig = {
  triggerTime: 1.0,      // 1 second to trigger
  cooldownTime: 2.0,     // 2 seconds cooldown
  sensitivity: 0.5,      // Medium sensitivity
  enabledZones: DEFAULT_ENABLED_ZONES,
}

export function useDetection({
  videoRef,
  canvasRef,
  onAlert,
}: UseDetectionOptions): UseDetectionReturn {
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [detectionState, setDetectionState] = useState<DetectionState>('IDLE')
  const [isNearHead, setIsNearHead] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeZone, setActiveZone] = useState<DetectionZone | null>(null)
  const [config, setConfig] = useState<DetectionConfig>(DEFAULT_CONFIG)
  const [faceLandmarksCount, setFaceLandmarksCount] = useState<number | null>(null)
  const [handsCount, setHandsCount] = useState(0)

  const detectorRef = useRef<MediaPipeDetector | null>(null)
  const analyzerRef = useRef<ProximityAnalyzer | null>(null)
  const detectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isRunningRef = useRef(false)
  const onAlertRef = useRef(onAlert)
  const isInitializedRef = useRef(false)

  // Keep onAlert ref updated
  useEffect(() => {
    onAlertRef.current = onAlert
  }, [onAlert])

  // Initialize detector and analyzer (only once)
  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    async function init() {
      try {
        detectorRef.current = new MediaPipeDetector()
        await detectorRef.current.loadModel()

        analyzerRef.current = new ProximityAnalyzer(DEFAULT_CONFIG)

        analyzerRef.current.setAlertCallback(() => {
          onAlertRef.current()
        })

        analyzerRef.current.setStateCallback((state) => {
          setDetectionState(state)
        })

        analyzerRef.current.setProximityCallback((info: ProximityInfo) => {
          setIsNearHead(info.isNearHead)
          setProgress(info.progress)
          setActiveZone(info.activeZone)
        })

        setIsModelLoaded(true)
      } catch (err) {
        console.error('Failed to load detection model:', err)
        isInitializedRef.current = false
      }
    }

    init()

    return () => {
      detectorRef.current?.dispose()
      isInitializedRef.current = false
    }
  }, [])

  const updateConfig = useCallback((newConfig: Partial<DetectionConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig }
      analyzerRef.current?.updateConfig(updated)
      return updated
    })
  }, [])

  const runDetection = useCallback(async () => {
    if (!isRunningRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const detector = detectorRef.current
    const analyzer = analyzerRef.current

    if (!video || !canvas || !detector || !analyzer) {
      detectionTimerRef.current = setTimeout(runDetection, 33)
      return
    }

    if (video.readyState < 2) {
      detectionTimerRef.current = setTimeout(runDetection, 33)
      return
    }

    try {
      const results = await detector.detect(video)

      // Update detection counts for overlay
      setFaceLandmarksCount(results.faceLandmarks?.all?.length ?? null)
      setHandsCount(results.hands.length)

      // Update proximity analyzer with faceLandmarks for zone-specific detection
      const proximityInfo = analyzer.update(results.hands, results.head, results.faceLandmarks)

      // Draw results on canvas
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        detector.drawResults(ctx, results, proximityInfo.isNearHead)
      }
    } catch (err) {
      console.error('Detection error:', err)
    }

    // Use setTimeout instead of requestAnimationFrame to keep running
    // even when alert window takes focus (rAF gets throttled)
    detectionTimerRef.current = setTimeout(runDetection, 33) // ~30fps
  }, [videoRef, canvasRef])

  const startDetection = useCallback(() => {
    isRunningRef.current = true
    runDetection()
  }, [runDetection])

  const stopDetection = useCallback(() => {
    isRunningRef.current = false
    if (detectionTimerRef.current) {
      clearTimeout(detectionTimerRef.current)
      detectionTimerRef.current = null
    }
    setDetectionState('IDLE')
    setIsNearHead(false)
    setProgress(0)
    setActiveZone(null)
    setFaceLandmarksCount(null)
    setHandsCount(0)
    analyzerRef.current?.reset()

    // Clear canvas
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [canvasRef])

  const isHandNearHead = useCallback(() => {
    return analyzerRef.current?.isHandNearHead() ?? false
  }, [])

  return {
    isModelLoaded,
    detectionState,
    isNearHead,
    progress,
    activeZone,
    config,
    faceLandmarksCount,
    handsCount,
    startDetection,
    stopDetection,
    isHandNearHead,
    updateConfig,
  }
}
