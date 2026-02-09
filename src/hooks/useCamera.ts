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

import { STORAGE_KEYS } from '../constants/storage-keys'
import { logger } from '../utils/logger'

const STORAGE_KEY = STORAGE_KEYS.CAMERA_DEVICE

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

  // Enumerate video devices without requesting permission
  // Labels will only be available after permission is granted
  const enumerateDevicesWithoutPermission = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = allDevices
        .filter(device => device.kind === 'videoinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`,
        }))
      setDevices(videoDevices)
    } catch (err) {
      logger.error('Failed to enumerate devices:', err)
    }
  }, [])

  // Enumerate video devices (call after permission is already granted)
  // Does NOT request new camera permission - just lists available devices
  const refreshDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = allDevices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}...`,
        }))
      setDevices(videoDevices)
    } catch (err) {
      logger.error('Failed to enumerate devices:', err)
    }
  }, [])

  // Only enumerate devices without permission on mount (no camera access popup)
  useEffect(() => {
    enumerateDevicesWithoutPermission()
  }, [enumerateDevicesWithoutPermission])

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

      // Stop existing stream before starting new one to prevent leaks
      setStream(prev => {
        if (prev) {
          prev.getTracks().forEach(track => track.stop())
        }
        return null
      })

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
      logger.error('Camera error:', err)
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
