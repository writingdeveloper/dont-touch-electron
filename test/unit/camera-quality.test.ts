import { describe, expect, it } from 'vitest'
import {
  buildCameraConstraints,
  coerceCameraQuality,
  formatCameraStreamInfo,
  getCameraStreamInfo,
} from '../../src/utils/cameraQuality'
import { DEFAULT_APP_SETTINGS } from '../../src/types/app-settings'

describe('camera quality helpers', () => {
  it('defaults invalid camera quality values to high accuracy', () => {
    expect(coerceCameraQuality('balanced')).toBe('balanced')
    expect(coerceCameraQuality('maximum')).toBe('maximum')
    expect(coerceCameraQuality('bad-value')).toBe('high')
    expect(DEFAULT_APP_SETTINGS.cameraQuality).toBe('high')
  })

  it('maps high quality to 720p camera constraints', () => {
    expect(buildCameraConstraints('high', 'camera-1')).toEqual({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30, max: 30 },
        facingMode: 'user',
        deviceId: { exact: 'camera-1' },
      },
      audio: false,
    })
  })

  it('reports actual negotiated stream settings', () => {
    const stream = {
      getVideoTracks: () => [
        {
          label: 'Integrated Camera',
          getSettings: () => ({
            width: 1280,
            height: 720,
            frameRate: 29.97,
            deviceId: 'device-1',
          }),
        },
      ],
    } as unknown as MediaStream

    const info = getCameraStreamInfo(stream)
    expect(info).toEqual({
      width: 1280,
      height: 720,
      frameRate: 29.97,
      deviceId: 'device-1',
      label: 'Integrated Camera',
    })
    expect(formatCameraStreamInfo(info)).toBe('1280x720 30fps')
    expect(formatCameraStreamInfo(null)).toBe('Detecting')
  })
})
