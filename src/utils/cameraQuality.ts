export const CAMERA_QUALITY_PROFILES = {
  balanced: {
    label: 'Balanced',
    description: 'Lower CPU use, standard webcam quality',
    width: 640,
    height: 480,
    frameRate: 30,
  },
  high: {
    label: 'High accuracy',
    description: 'Recommended. Sharper hand and face landmarks',
    width: 1280,
    height: 720,
    frameRate: 30,
  },
  maximum: {
    label: 'Maximum',
    description: 'Best effort 1080p, heavier on slower devices',
    width: 1920,
    height: 1080,
    frameRate: 30,
  },
} as const

export type CameraQuality = keyof typeof CAMERA_QUALITY_PROFILES

export interface CameraStreamInfo {
  width: number | null
  height: number | null
  frameRate: number | null
  deviceId: string | null
  label: string | null
}

export function coerceCameraQuality(value: unknown): CameraQuality {
  return value === 'balanced' || value === 'high' || value === 'maximum'
    ? value
    : 'high'
}

export function buildCameraConstraints(
  quality: CameraQuality,
  deviceId?: string | null
): MediaStreamConstraints {
  const profile = CAMERA_QUALITY_PROFILES[quality]

  return {
    video: {
      width: { ideal: profile.width },
      height: { ideal: profile.height },
      frameRate: { ideal: profile.frameRate, max: profile.frameRate },
      facingMode: 'user',
      ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
    },
    audio: false,
  }
}

export function getCameraStreamInfo(stream: MediaStream): CameraStreamInfo {
  const track = stream.getVideoTracks()[0]
  const settings = track?.getSettings?.()

  return {
    width: settings?.width ?? null,
    height: settings?.height ?? null,
    frameRate: settings?.frameRate ?? null,
    deviceId: settings?.deviceId ?? null,
    label: track?.label || null,
  }
}

export function formatCameraStreamInfo(info: CameraStreamInfo | null): string {
  if (!info?.width || !info?.height) return 'Detecting'

  const resolution = `${info.width}x${info.height}`
  const frameRate = info.frameRate ? ` ${Math.round(info.frameRate)}fps` : ''
  return `${resolution}${frameRate}`
}
