import { describe, expect, it } from 'vitest'
import packageLock from '../../package-lock.json'
import { MEDIAPIPE_URLS } from '../../src/constants/mediapipe'

describe('MediaPipe URLs', () => {
  it('pins the WASM runtime to the bundled tasks-vision version', () => {
    const tasksVisionPackage =
      packageLock.packages['node_modules/@mediapipe/tasks-vision']

    expect(tasksVisionPackage.version).toBeTypeOf('string')
    expect(MEDIAPIPE_URLS.WASM_RUNTIME).toBe(
      `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${tasksVisionPackage.version}/wasm`
    )
    expect(MEDIAPIPE_URLS.WASM_RUNTIME).not.toContain('@latest')
  })
})
