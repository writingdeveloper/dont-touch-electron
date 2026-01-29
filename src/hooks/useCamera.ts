import { useState, useCallback, useEffect } from 'react'

interface VideoDevice {
  deviceId: string
  label: string
}

interface UseCameraReturn {
  stream: MediaStream | null
  error: string | null
  devices: VideoDevice[]
  selectedDeviceId: string | null
  startCamera: (deviceId?: string) => Promise<void>
  stopCamera: () => void
  setSelectedDeviceId: (deviceId: string | null) => void
  refreshDevices: () => Promise<void>
}

const STORAGE_KEY = 'dont-touch-camera-device'

export function useCamera(): UseCameraReturn {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<VideoDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  })

  // Enumerate video devices
  const refreshDevices = useCallback(async () => {
    try {
      // Need to request permission first to get device labels
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
      tempStream.getTracks().forEach(track => track.stop())

      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = allDevices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}...`,
        }))
      setDevices(videoDevices)
    } catch (err) {
      console.error('Failed to enumerate devices:', err)
    }
  }, [])

  // Refresh devices on mount
  useEffect(() => {
    refreshDevices()
  }, [refreshDevices])

  // Save selected device to localStorage
  const setSelectedDeviceId = useCallback((deviceId: string | null) => {
    setSelectedDeviceIdState(deviceId)
    try {
      if (deviceId) {
        localStorage.setItem(STORAGE_KEY, deviceId)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      // Ignore storage errors
    }
  }, [])

  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      setError(null)

      const targetDeviceId = deviceId || selectedDeviceId

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
          ...(targetDeviceId ? { deviceId: { exact: targetDeviceId } } : {}),
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      // Update device list after successful camera start
      refreshDevices()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to access camera'
      setError(message)
      console.error('Camera error:', err)
    }
  }, [selectedDeviceId, refreshDevices])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  return {
    stream,
    error,
    devices,
    selectedDeviceId,
    startCamera,
    stopCamera,
    setSelectedDeviceId,
    refreshDevices,
  }
}
