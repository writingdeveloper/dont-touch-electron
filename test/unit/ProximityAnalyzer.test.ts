import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProximityAnalyzer } from '../../src/detection/ProximityAnalyzer'
import { FaceLandmarks, HandKeypoints, HeadRegion, Point } from '../../src/detection/types'

function makePoint(x: number, y: number, confidence = 1.0): Point {
  return { x, y, confidence }
}

function makeHead(cx: number, cy: number, w: number, h: number): HeadRegion {
  return {
    nose: makePoint(cx, cy),
    leftEar: makePoint(cx - w * 0.55, cy - h * 0.08),
    rightEar: makePoint(cx + w * 0.55, cy - h * 0.08),
    center: makePoint(cx, cy),
    width: w,
    height: h,
  }
}

function makeFaceLandmarks(): FaceLandmarks {
  return {
    forehead: makePoint(200, 120),
    leftEyebrow: makePoint(140, 150),
    rightEyebrow: makePoint(260, 150),
    leftEye: makePoint(135, 180),
    rightEye: makePoint(265, 180),
    noseTip: makePoint(200, 215),
    noseBridge: makePoint(200, 175),
    leftCheek: makePoint(135, 235),
    rightCheek: makePoint(265, 235),
    upperLip: makePoint(200, 260),
    lowerLip: makePoint(200, 278),
    chin: makePoint(200, 330),
    all: Array.from({ length: 468 }, () => makePoint(200, 200)),
  }
}

function makeHand(tipX: number, tipY: number, confidence = 0.9): HandKeypoints {
  const far = makePoint(600, 600)
  const tip = makePoint(tipX, tipY)
  const landmarks = Array.from({ length: 21 }, () => far)

  for (const index of [3, 4, 7, 8, 11, 12, 15, 16, 19, 20]) {
    landmarks[index] = tip
  }

  return {
    landmarks,
    handedness: 'Right',
    confidence,
    fingertips: {
      thumb: landmarks[4],
      index: landmarks[8],
      middle: landmarks[12],
      ring: landmarks[16],
      pinky: landmarks[20],
    },
    wrist: landmarks[0],
  }
}

function makeHandWithLandmark(index: number, point: Point, confidence = 0.9): HandKeypoints {
  const far = makePoint(600, 600)
  const landmarks = Array.from({ length: 21 }, () => far)
  landmarks[index] = point

  return {
    landmarks,
    handedness: 'Right',
    confidence,
    fingertips: {
      thumb: far,
      index: far,
      middle: far,
      ring: far,
      pinky: far,
    },
    wrist: landmarks[0],
  }
}

function confirmNear(
  analyzer: ProximityAnalyzer,
  hands: HandKeypoints[],
  head: HeadRegion,
  faceLandmarks?: FaceLandmarks
) {
  analyzer.update(hands, head, faceLandmarks)
  return analyzer.update(hands, head, faceLandmarks)
}

describe('ProximityAnalyzer', () => {
  let analyzer: ProximityAnalyzer

  beforeEach(() => {
    vi.useFakeTimers()
    analyzer = new ProximityAnalyzer({
      triggerTime: 1.0,
      cooldownTime: 2.0,
      sensitivity: 0.5,
      enabledZones: ['fullFace'],
    })
  })

  it('starts in IDLE state', () => {
    expect(analyzer.getState()).toBe('IDLE')
    expect(analyzer.isHandNearHead()).toBe(false)
  })

  it('requires consecutive near frames before DETECTING', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    const first = analyzer.update([hand], head)
    expect(first.isNearHead).toBe(false)
    expect(first.state).toBe('IDLE')

    const second = analyzer.update([hand], head)
    expect(second.isNearHead).toBe(true)
    expect(second.state).toBe('DETECTING')
  })

  it('does not start from a one-frame spike or near/far/near sequence', () => {
    const head = makeHead(200, 200, 150, 200)
    const handNear = makeHand(200, 200)
    const handFar = makeHand(600, 600)

    expect(analyzer.update([handNear], head).state).toBe('IDLE')
    expect(analyzer.update([handFar], head).state).toBe('IDLE')
    expect(analyzer.update([handNear], head).state).toBe('IDLE')
  })

  it('does not start a new detection from stale face data', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    analyzer.update([], head)
    expect(analyzer.update([hand], null).state).toBe('IDLE')
    expect(analyzer.update([hand], null).state).toBe('IDLE')
  })

  it('returns to IDLE when hand is clearly removed during DETECTING', () => {
    const head = makeHead(200, 200, 150, 200)
    const handNear = makeHand(200, 200)
    const handFar = makeHand(600, 600)

    expect(confirmNear(analyzer, [handNear], head).state).toBe('DETECTING')

    const info = analyzer.update([handFar], head)
    expect(info.state).toBe('IDLE')
    expect(info.isNearHead).toBe(false)
  })

  it('triggers alert after triggerTime', () => {
    const alertCb = vi.fn()
    analyzer.setAlertCallback(alertCb)

    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    vi.setSystemTime(new Date(1000))
    expect(confirmNear(analyzer, [hand], head).state).toBe('DETECTING')

    vi.setSystemTime(new Date(2100))
    analyzer.update([hand], head)
    expect(alertCb).toHaveBeenCalledTimes(1)
    expect(analyzer.getState()).toBe('ALERT')

    analyzer.update([hand], head)
    expect(analyzer.getState()).toBe('COOLDOWN')
  })

  it('returns to IDLE after cooldown period', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)
    const handFar = makeHand(600, 600)

    vi.setSystemTime(new Date(1000))
    confirmNear(analyzer, [hand], head)

    vi.setSystemTime(new Date(2100))
    analyzer.update([hand], head)
    analyzer.update([hand], head)
    expect(analyzer.getState()).toBe('COOLDOWN')

    vi.setSystemTime(new Date(4200))
    analyzer.update([handFar], head)
    expect(analyzer.getState()).toBe('IDLE')
  })

  it('reports progress during DETECTING', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    vi.setSystemTime(new Date(1000))
    confirmNear(analyzer, [hand], head)

    vi.setSystemTime(new Date(1500))
    const info = analyzer.update([hand], head)
    expect(info.progress).toBeCloseTo(0.5, 1)
  })

  it('requires hand removal after alert before starting again', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)
    const handFar = makeHand(600, 600)

    vi.setSystemTime(new Date(1000))
    confirmNear(analyzer, [hand], head)
    vi.setSystemTime(new Date(2100))
    analyzer.update([hand], head)
    analyzer.update([hand], head)

    vi.setSystemTime(new Date(4200))
    analyzer.update([hand], head)

    vi.setSystemTime(new Date(4300))
    expect(analyzer.update([hand], head).state).toBe('IDLE')

    vi.setSystemTime(new Date(4400))
    analyzer.update([handFar], head)

    vi.setSystemTime(new Date(4500))
    expect(analyzer.update([hand], head).state).toBe('IDLE')
    expect(analyzer.update([hand], head).state).toBe('DETECTING')
  })

  it('does not detect when no hands or no head are present', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    expect(analyzer.update([], head).isNearHead).toBe(false)
    expect(analyzer.update([hand], null).isNearHead).toBe(false)
  })

  it('does not detect hand far from face', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(600, 600)
    expect(analyzer.update([hand], head).isNearHead).toBe(false)
  })

  it('calls state callback on confirmed transitions', () => {
    const stateCb = vi.fn()
    analyzer.setStateCallback(stateCb)

    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    confirmNear(analyzer, [hand], head)
    expect(stateCb).toHaveBeenCalledWith('DETECTING')
  })

  it('calls proximity callback each update', () => {
    const proxCb = vi.fn()
    analyzer.setProximityCallback(proxCb)

    const head = makeHead(200, 200, 150, 200)
    analyzer.update([], head)
    expect(proxCb).toHaveBeenCalledTimes(1)
    expect(proxCb).toHaveBeenCalledWith(expect.objectContaining({
      isNearHead: false,
      state: 'IDLE',
    }))
  })

  it('reset returns to IDLE', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    confirmNear(analyzer, [hand], head)
    expect(analyzer.getState()).toBe('DETECTING')

    analyzer.reset()
    expect(analyzer.getState()).toBe('IDLE')
    expect(analyzer.isHandNearHead()).toBe(false)
    expect(analyzer.getActiveZone()).toBeNull()
  })

  it('updateConfig changes trigger behavior', () => {
    const alertCb = vi.fn()
    analyzer.setAlertCallback(alertCb)
    analyzer.updateConfig({ triggerTime: 0.1 })

    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    vi.setSystemTime(new Date(1000))
    confirmNear(analyzer, [hand], head)

    vi.setSystemTime(new Date(1200))
    analyzer.update([hand], head)
    expect(alertCb).toHaveBeenCalled()
  })

  it('sensitivity affects detection radius', () => {
    const head = makeHead(200, 200, 100, 120)
    const handEdge = makeHand(245, 200)

    analyzer.updateConfig({ sensitivity: 0.0 })
    expect(analyzer.update([handEdge], head).isNearHead).toBe(false)

    analyzer.reset()
    analyzer.updateConfig({ sensitivity: 1.0 })
    expect(confirmNear(analyzer, [handEdge], head).isNearHead).toBe(true)
  })

  it('detects paired zones on either side instead of only the midpoint', () => {
    const head = makeHead(200, 220, 200, 240)
    const face = makeFaceLandmarks()

    analyzer.updateConfig({ enabledZones: ['eyes'] })
    expect(confirmNear(analyzer, [makeHand(face.leftEye.x, face.leftEye.y)], head, face)).toEqual(expect.objectContaining({
      isNearHead: true,
      activeZone: 'eyes',
    }))

    analyzer.reset()
    analyzer.updateConfig({ enabledZones: ['eyes'] })
    expect(confirmNear(analyzer, [makeHand(face.rightEye.x, face.rightEye.y)], head, face)).toEqual(expect.objectContaining({
      isNearHead: true,
      activeZone: 'eyes',
    }))

    analyzer.reset()
    analyzer.updateConfig({ enabledZones: ['cheeks'] })
    expect(confirmNear(analyzer, [makeHand(face.leftCheek.x, face.leftCheek.y)], head, face)).toEqual(expect.objectContaining({
      isNearHead: true,
      activeZone: 'cheeks',
    }))
  })

  it('detects non-fingertip hand landmarks for specific zones only', () => {
    const head = makeHead(200, 220, 200, 240)
    const face = makeFaceLandmarks()
    analyzer.updateConfig({ enabledZones: ['cheeks'] })

    const hand = makeHandWithLandmark(7, face.leftCheek)
    const info = confirmNear(analyzer, [hand], head, face)

    expect(info.isNearHead).toBe(true)
    expect(info.activeZone).toBe('cheeks')
  })

  it('ignores low-confidence contacts', () => {
    const head = makeHead(200, 220, 200, 240)
    const face = makeFaceLandmarks()
    const hand = makeHand(face.leftEye.x, face.leftEye.y, 0.1)
    analyzer.updateConfig({ enabledZones: ['eyes'] })

    expect(analyzer.update([hand], head, face).isNearHead).toBe(false)
  })

  it('keeps detecting through brief missing-frame jitter', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    expect(confirmNear(analyzer, [hand], head).state).toBe('DETECTING')

    expect(analyzer.update([], null).state).toBe('DETECTING')
    expect(analyzer.update([], null).state).toBe('DETECTING')
    expect(analyzer.update([], null).state).toBe('IDLE')
  })

  it('fullFace ignores wrist and palm-only phantom points', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHandWithLandmark(5, head.center)
    hand.landmarks[0] = head.center
    hand.wrist = head.center

    expect(analyzer.update([hand], head).isNearHead).toBe(false)
    expect(analyzer.update([hand], head).isNearHead).toBe(false)
  })

  it('real fingertip-to-face contact still triggers fullFace', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    expect(confirmNear(analyzer, [hand], head)).toEqual(expect.objectContaining({
      isNearHead: true,
      activeZone: 'fullFace',
    }))
  })
})
