import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProximityAnalyzer } from '../../src/detection/ProximityAnalyzer'
import { HandKeypoints, HeadRegion, Point } from '../../src/detection/types'

function makePoint(x: number, y: number): Point {
  return { x, y, confidence: 1.0 }
}

function makeHead(cx: number, cy: number, w: number, h: number): HeadRegion {
  return {
    nose: makePoint(cx, cy),
    center: makePoint(cx, cy),
    width: w,
    height: h,
  }
}

function makeHand(tipX: number, tipY: number): HandKeypoints {
  const tip = makePoint(tipX, tipY)
  return {
    landmarks: Array(21).fill(tip),
    handedness: 'Right',
    confidence: 0.9,
    fingertips: {
      thumb: tip,
      index: tip,
      middle: tip,
      ring: tip,
      pinky: tip,
    },
    wrist: makePoint(tipX, tipY + 100),
  }
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

  it('should start in IDLE state', () => {
    expect(analyzer.getState()).toBe('IDLE')
    expect(analyzer.isHandNearHead()).toBe(false)
  })

  it('should detect hand near head (IDLE → DETECTING)', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200) // directly on face

    const info = analyzer.update([hand], head)
    expect(info.isNearHead).toBe(true)
    expect(info.state).toBe('DETECTING')
  })

  it('should return to IDLE when hand removed during DETECTING', () => {
    const head = makeHead(200, 200, 150, 200)
    const handNear = makeHand(200, 200)
    const handFar = makeHand(600, 600) // far away

    analyzer.update([handNear], head)
    expect(analyzer.getState()).toBe('DETECTING')

    const info = analyzer.update([handFar], head)
    expect(info.state).toBe('IDLE')
    expect(info.isNearHead).toBe(false)
  })

  it('should trigger alert after triggerTime (DETECTING → ALERT → COOLDOWN)', () => {
    const alertCb = vi.fn()
    analyzer.setAlertCallback(alertCb)

    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    // Start detecting
    vi.setSystemTime(new Date(1000))
    analyzer.update([hand], head)
    expect(analyzer.getState()).toBe('DETECTING')

    // Advance time past triggerTime (1 second)
    vi.setSystemTime(new Date(2100))
    analyzer.update([hand], head)
    expect(alertCb).toHaveBeenCalledTimes(1)
    // After this update, state is ALERT (transition to COOLDOWN on next update)
    expect(analyzer.getState()).toBe('ALERT')

    // Next update transitions ALERT → COOLDOWN
    analyzer.update([hand], head)
    expect(analyzer.getState()).toBe('COOLDOWN')
  })

  it('should return to IDLE after cooldown period', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)
    const handFar = makeHand(600, 600)

    // Trigger alert
    vi.setSystemTime(new Date(1000))
    analyzer.update([hand], head) // IDLE → DETECTING

    vi.setSystemTime(new Date(2100))
    analyzer.update([hand], head) // DETECTING → ALERT
    analyzer.update([hand], head) // ALERT → COOLDOWN
    expect(analyzer.getState()).toBe('COOLDOWN')

    // Now in COOLDOWN, advance past cooldownTime (2 seconds from cooldownStartTime=2100)
    vi.setSystemTime(new Date(4200))
    analyzer.update([handFar], head)
    expect(analyzer.getState()).toBe('IDLE')
  })

  it('should report progress during DETECTING', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    vi.setSystemTime(new Date(1000))
    analyzer.update([hand], head)

    vi.setSystemTime(new Date(1500)) // 0.5 seconds = 50% progress
    const info = analyzer.update([hand], head)
    expect(info.progress).toBeCloseTo(0.5, 1)
  })

  it('should require hand removal after alert', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)
    const handFar = makeHand(600, 600)

    // Trigger alert
    vi.setSystemTime(new Date(1000))
    analyzer.update([hand], head) // IDLE → DETECTING
    vi.setSystemTime(new Date(2100))
    analyzer.update([hand], head) // DETECTING → ALERT
    analyzer.update([hand], head) // ALERT → COOLDOWN

    // Wait for cooldown to end
    vi.setSystemTime(new Date(4200))
    analyzer.update([hand], head) // COOLDOWN → IDLE (but requireHandRemoval = true)

    // Hand still there, should not trigger DETECTING due to requireHandRemoval
    vi.setSystemTime(new Date(4300))
    const info = analyzer.update([hand], head)
    expect(info.state).toBe('IDLE')

    // Remove hand, then bring it back
    vi.setSystemTime(new Date(4400))
    analyzer.update([handFar], head) // hand removed → clears requireHandRemoval

    vi.setSystemTime(new Date(4500))
    const info2 = analyzer.update([hand], head) // hand back — should start detecting
    expect(info2.state).toBe('DETECTING')
  })

  it('should not detect when no hands present', () => {
    const head = makeHead(200, 200, 150, 200)
    const info = analyzer.update([], head)
    expect(info.isNearHead).toBe(false)
    expect(info.state).toBe('IDLE')
  })

  it('should not detect when no head present', () => {
    const hand = makeHand(200, 200)
    const info = analyzer.update([hand], null)
    expect(info.isNearHead).toBe(false)
    expect(info.state).toBe('IDLE')
  })

  it('should not detect hand far from face', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(600, 600) // far away
    const info = analyzer.update([hand], head)
    expect(info.isNearHead).toBe(false)
  })

  it('should call state callback on transitions', () => {
    const stateCb = vi.fn()
    analyzer.setStateCallback(stateCb)

    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    vi.setSystemTime(new Date(1000))
    analyzer.update([hand], head)
    expect(stateCb).toHaveBeenCalledWith('DETECTING')
  })

  it('should call proximity callback each update', () => {
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

  it('reset should return to IDLE', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    vi.setSystemTime(new Date(1000))
    analyzer.update([hand], head)
    expect(analyzer.getState()).toBe('DETECTING')

    analyzer.reset()
    expect(analyzer.getState()).toBe('IDLE')
    expect(analyzer.isHandNearHead()).toBe(false)
    expect(analyzer.getActiveZone()).toBeNull()
  })

  it('updateConfig should change behavior', () => {
    const head = makeHead(200, 200, 150, 200)
    const hand = makeHand(200, 200)

    // Set very short trigger time
    analyzer.updateConfig({ triggerTime: 0.1 })

    vi.setSystemTime(new Date(1000))
    analyzer.update([hand], head)

    vi.setSystemTime(new Date(1200)) // 200ms > 100ms triggerTime
    const alertCb = vi.fn()
    analyzer.setAlertCallback(alertCb)
    analyzer.update([hand], head)
    expect(alertCb).toHaveBeenCalled()
  })

  it('sensitivity affects detection radius', () => {
    const head = makeHead(200, 200, 100, 120)
    // Place hand at a point between low and high sensitivity ranges
    // radiusX at sens=0: (50)*0.8 = 40, at sens=1: (50)*1.5 = 75
    // dx = 70: outside at sens=0 (70>40) but inside at sens=1 (70<75)
    const handEdge = makeHand(270, 200)

    // Low sensitivity — should NOT detect (dx=70 > radiusX=40)
    analyzer.updateConfig({ sensitivity: 0.0 })
    const info1 = analyzer.update([handEdge], head)
    expect(info1.isNearHead).toBe(false)

    // High sensitivity — should detect (dx=70 < radiusX=75)
    analyzer.reset()
    analyzer.updateConfig({ sensitivity: 1.0 })
    const info2 = analyzer.update([handEdge], head)
    expect(info2.isNearHead).toBe(true)
  })
})
