import { DetectionState, HandKeypoints, HeadRegion, DetectionZone, FaceLandmarks, Point, DEFAULT_ENABLED_ZONES } from './types';

export interface ProximityInfo {
  isNearHead: boolean;
  progress: number;
  state: DetectionState;
  activeZone: DetectionZone | null;
}

interface Config {
  triggerTime: number;
  cooldownTime: number;
  sensitivity: number;
  enabledZones: DetectionZone[];
}

interface ContactPoint {
  point: Point;
  radiusScale: number;
  confidence: number;
}

interface ZoneTarget {
  point: Point;
  radiusScale: number;
}

type TouchSignal = 'near' | 'far' | 'missing';

const ZONE_RADIUS: Record<DetectionZone, number> = {
  scalp: 0.4,
  forehead: 0.25,
  eyebrows: 0.15,
  eyes: 0.15,
  nose: 0.15,
  cheeks: 0.2,
  mouth: 0.15,
  chin: 0.2,
  ears: 0.15,
  fullFace: 1.0,
};

const MISSED_FRAME_GRACE_FRAMES = 2;
const CLEAR_FRAME_GRACE_FRAMES = 2;
const LAST_GOOD_FACE_FRAMES = 3;
const MIN_TOUCH_SCORE = 0.22;

const HAND_CONTACTS: Array<{ index: number; radiusScale: number }> = [
  { index: 4, radiusScale: 1.0 },
  { index: 8, radiusScale: 1.0 },
  { index: 12, radiusScale: 1.0 },
  { index: 16, radiusScale: 1.0 },
  { index: 20, radiusScale: 1.0 },
  { index: 3, radiusScale: 0.82 },
  { index: 7, radiusScale: 0.82 },
  { index: 11, radiusScale: 0.82 },
  { index: 15, radiusScale: 0.82 },
  { index: 19, radiusScale: 0.82 },
  { index: 2, radiusScale: 0.72 },
  { index: 6, radiusScale: 0.72 },
  { index: 10, radiusScale: 0.72 },
  { index: 14, radiusScale: 0.72 },
  { index: 18, radiusScale: 0.72 },
  { index: 0, radiusScale: 0.5 },
  { index: 5, radiusScale: 0.62 },
  { index: 9, radiusScale: 0.62 },
  { index: 13, radiusScale: 0.62 },
  { index: 17, radiusScale: 0.62 },
];

export class ProximityAnalyzer {
  private state: DetectionState = 'IDLE';
  private detectStartTime: number | null = null;
  private cooldownStartTime: number | null = null;
  private currentIsNearHead = false;
  private currentActiveZone: DetectionZone | null = null;
  private requireHandRemoval = false;
  private missedFrameCount = 0;
  private clearFrameCount = 0;
  private lastActiveZone: DetectionZone | null = null;
  private lastHead: HeadRegion | null = null;
  private lastFaceLandmarks: FaceLandmarks | null = null;
  private missingHeadFrames = 0;
  private missingFaceFrames = 0;

  private alertCallback: (() => void) | null = null;
  private stateCallback: ((state: DetectionState) => void) | null = null;
  private proximityCallback: ((info: ProximityInfo) => void) | null = null;

  private config: Config;

  constructor(config: Partial<Config> & { triggerTime: number; cooldownTime: number; sensitivity: number }) {
    this.config = {
      ...config,
      enabledZones: config.enabledZones || DEFAULT_ENABLED_ZONES,
    };
  }

  setAlertCallback(cb: () => void): void {
    this.alertCallback = cb;
  }

  setStateCallback(cb: (state: DetectionState) => void): void {
    this.stateCallback = cb;
  }

  setProximityCallback(cb: (info: ProximityInfo) => void): void {
    this.proximityCallback = cb;
  }

  updateConfig(config: Partial<Config>): void {
    this.config = { ...this.config, ...config };
  }

  update(hands: HandKeypoints[], head: HeadRegion | null, faceLandmarks?: FaceLandmarks | null): ProximityInfo {
    const now = Date.now();
    const stableHead = this.getStableHead(head);
    const stableFaceLandmarks = this.getStableFaceLandmarks(faceLandmarks ?? null);
    const rawTouch = this.checkZoneTouch(hands, stableHead, stableFaceLandmarks);
    const { isNearHead, activeZone } = this.applyMissedFrameGrace(rawTouch);

    this.currentIsNearHead = isNearHead;
    this.currentActiveZone = activeZone;

    let progress = 0;

    if (this.requireHandRemoval) {
      if (rawTouch.isNearHead) {
        this.clearFrameCount = 0;
      } else {
        this.clearFrameCount++;
      }

      if (rawTouch.signal === 'far' || this.clearFrameCount > CLEAR_FRAME_GRACE_FRAMES) {
        this.requireHandRemoval = false;
        this.clearFrameCount = 0;
      }
    }

    switch (this.state) {
      case 'IDLE':
        if (isNearHead && !this.requireHandRemoval) {
          this.setState('DETECTING');
          this.detectStartTime = now;
        }
        break;

      case 'DETECTING':
        if (!isNearHead) {
          this.setState('IDLE');
          this.detectStartTime = null;
        } else if (this.detectStartTime) {
          const elapsed = (now - this.detectStartTime) / 1000;
          progress = Math.min(elapsed / this.config.triggerTime, 1);

          if (progress >= 1) {
            this.setState('ALERT');
            this.alertCallback?.();
            this.cooldownStartTime = now;
          }
        }
        break;

      case 'ALERT':
        progress = 1;
        this.requireHandRemoval = true;
        this.setState('COOLDOWN');
        break;

      case 'COOLDOWN':
        if (this.cooldownStartTime) {
          const elapsed = (now - this.cooldownStartTime) / 1000;
          progress = 1 - Math.min(elapsed / this.config.cooldownTime, 1);

          if (elapsed >= this.config.cooldownTime) {
            this.setState('IDLE');
            this.cooldownStartTime = null;
            this.detectStartTime = null;
          }
        }
        break;
    }

    const info: ProximityInfo = {
      isNearHead,
      progress,
      state: this.state,
      activeZone,
    };

    this.proximityCallback?.(info);
    return info;
  }

  private checkZoneTouch(
    hands: HandKeypoints[],
    head: HeadRegion | null,
    faceLandmarks?: FaceLandmarks | null
  ): { isNearHead: boolean; activeZone: DetectionZone | null; signal: TouchSignal } {
    if (!head || hands.length === 0) {
      return { isNearHead: false, activeZone: null, signal: 'missing' };
    }

    const enabledZones = this.config.enabledZones;

    if (enabledZones.includes('fullFace')) {
      const isNear = this.checkContactInsideFace(hands, head);
      return { isNearHead: isNear, activeZone: isNear ? 'fullFace' : null, signal: isNear ? 'near' : 'far' };
    }

    if (!faceLandmarks) {
      return { isNearHead: false, activeZone: null, signal: 'missing' };
    }

    const zoneTargets = this.getZoneTargets(faceLandmarks, head);
    let bestScore = 0;
    let bestZone: DetectionZone | null = null;

    for (const hand of hands) {
      const contactPoints = this.getHandContactPoints(hand);

      for (const contact of contactPoints) {
        for (const zone of enabledZones) {
          if (zone === 'fullFace') continue;

          const targets = zoneTargets[zone];
          if (!targets?.length) continue;

          const baseRadius = Math.min(head.width, head.height) * ZONE_RADIUS[zone];
          const radius = baseRadius * (0.8 + this.config.sensitivity * 0.7);

          for (const target of targets) {
            const score = this.scoreContact(contact, target, radius);
            if (score > bestScore) {
              bestScore = score;
              bestZone = zone;
            }
          }
        }
      }
    }

    if (bestScore >= MIN_TOUCH_SCORE && bestZone) {
      return { isNearHead: true, activeZone: bestZone, signal: 'near' };
    }

    return { isNearHead: false, activeZone: null, signal: 'far' };
  }

  private getEarPositions(faceLandmarks: FaceLandmarks, head: HeadRegion): ZoneTarget[] {
    const positions: Point[] = [];

    if (head.leftEar) positions.push(head.leftEar);
    if (head.rightEar) positions.push(head.rightEar);

    if (positions.length === 0) {
      const eyeY = (faceLandmarks.leftEye.y + faceLandmarks.rightEye.y) / 2;
      const earOffsetX = head.width * 0.55;

      positions.push({
        x: head.center.x - earOffsetX,
        y: eyeY,
        confidence: 0.5,
      });

      positions.push({
        x: head.center.x + earOffsetX,
        y: eyeY,
        confidence: 0.5,
      });
    }

    return positions.map(point => ({ point, radiusScale: 1 }));
  }

  private getZoneTargets(faceLandmarks: FaceLandmarks, head: HeadRegion): Partial<Record<DetectionZone, ZoneTarget[]>> {
    const targets: Partial<Record<DetectionZone, ZoneTarget[]>> = {};
    const scalpY = faceLandmarks.forehead.y - head.height * 0.24;

    targets.scalp = [
      {
        point: {
          x: faceLandmarks.forehead.x,
          y: scalpY,
          confidence: faceLandmarks.forehead.confidence,
        },
        radiusScale: 0.95,
      },
      {
        point: {
          x: head.center.x - head.width * 0.28,
          y: scalpY + head.height * 0.04,
          confidence: faceLandmarks.forehead.confidence,
        },
        radiusScale: 0.82,
      },
      {
        point: {
          x: head.center.x + head.width * 0.28,
          y: scalpY + head.height * 0.04,
          confidence: faceLandmarks.forehead.confidence,
        },
        radiusScale: 0.82,
      },
    ];

    targets.forehead = [{ point: faceLandmarks.forehead, radiusScale: 1 }];
    targets.eyebrows = [
      { point: faceLandmarks.leftEyebrow, radiusScale: 1 },
      { point: faceLandmarks.rightEyebrow, radiusScale: 1 },
    ];
    targets.eyes = [
      { point: faceLandmarks.leftEye, radiusScale: 1 },
      { point: faceLandmarks.rightEye, radiusScale: 1 },
    ];
    targets.nose = [{ point: faceLandmarks.noseTip, radiusScale: 1 }];
    targets.cheeks = [
      { point: faceLandmarks.leftCheek, radiusScale: 1 },
      { point: faceLandmarks.rightCheek, radiusScale: 1 },
    ];
    targets.mouth = [
      { point: faceLandmarks.upperLip, radiusScale: 0.9 },
      { point: faceLandmarks.lowerLip, radiusScale: 0.9 },
      {
        point: {
          x: (faceLandmarks.upperLip.x + faceLandmarks.lowerLip.x) / 2,
          y: (faceLandmarks.upperLip.y + faceLandmarks.lowerLip.y) / 2,
          confidence: (faceLandmarks.upperLip.confidence + faceLandmarks.lowerLip.confidence) / 2,
        },
        radiusScale: 1,
      },
    ];
    targets.chin = [{ point: faceLandmarks.chin, radiusScale: 1 }];
    targets.ears = this.getEarPositions(faceLandmarks, head);

    return targets;
  }

  private checkContactInsideFace(hands: HandKeypoints[], head: HeadRegion): boolean {
    const radiusMultiplier = 0.8 + this.config.sensitivity * 0.7;
    const radiusX = (head.width / 2) * radiusMultiplier;
    const radiusY = (head.height / 2) * radiusMultiplier;

    for (const hand of hands) {
      const contactPoints = this.getHandContactPoints(hand);

      for (const contact of contactPoints) {
        const dx = contact.point.x - head.center.x;
        const dy = contact.point.y - head.center.y;
        const normalizedDist = (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY);

        if (normalizedDist <= contact.radiusScale * contact.radiusScale && contact.confidence >= MIN_TOUCH_SCORE) {
          return true;
        }
      }
    }

    return false;
  }

  private getStableHead(head: HeadRegion | null): HeadRegion | null {
    if (head) {
      this.lastHead = head;
      this.missingHeadFrames = 0;
      return head;
    }

    this.missingHeadFrames++;
    return this.missingHeadFrames <= LAST_GOOD_FACE_FRAMES ? this.lastHead : null;
  }

  private getStableFaceLandmarks(faceLandmarks: FaceLandmarks | null): FaceLandmarks | null {
    if (faceLandmarks) {
      this.lastFaceLandmarks = faceLandmarks;
      this.missingFaceFrames = 0;
      return faceLandmarks;
    }

    this.missingFaceFrames++;
    return this.missingFaceFrames <= LAST_GOOD_FACE_FRAMES ? this.lastFaceLandmarks : null;
  }

  private applyMissedFrameGrace(touch: { isNearHead: boolean; activeZone: DetectionZone | null; signal: TouchSignal }): { isNearHead: boolean; activeZone: DetectionZone | null } {
    if (touch.isNearHead) {
      this.missedFrameCount = 0;
      this.lastActiveZone = touch.activeZone;
      return { isNearHead: true, activeZone: touch.activeZone };
    }

    if (this.state === 'DETECTING' && touch.signal === 'missing' && this.missedFrameCount < MISSED_FRAME_GRACE_FRAMES) {
      this.missedFrameCount++;
      return { isNearHead: true, activeZone: this.lastActiveZone };
    }

    this.missedFrameCount = 0;
    this.lastActiveZone = null;
    return { isNearHead: false, activeZone: null };
  }

  private getHandContactPoints(hand: HandKeypoints): ContactPoint[] {
    const points: ContactPoint[] = [];

    const addPoint = (point: Point | undefined, radiusScale: number) => {
      if (!point) return;
      points.push({
        point,
        radiusScale,
        confidence: Math.min(hand.confidence || 0, point.confidence ?? 1),
      });
    };

    if (hand.fingertips) {
      addPoint(hand.fingertips.thumb, 1);
      addPoint(hand.fingertips.index, 1);
      addPoint(hand.fingertips.middle, 1);
      addPoint(hand.fingertips.ring, 1);
      addPoint(hand.fingertips.pinky, 1);
    }

    for (const contact of HAND_CONTACTS) {
      addPoint(hand.landmarks[contact.index], contact.radiusScale);
    }

    addPoint(hand.wrist, 0.5);
    return points.filter(contact => contact.confidence >= MIN_TOUCH_SCORE);
  }

  private scoreContact(contact: ContactPoint, target: ZoneTarget, radius: number): number {
    const adjustedRadius = radius * contact.radiusScale * target.radiusScale;
    const dx = contact.point.x - target.point.x;
    const dy = contact.point.y - target.point.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > adjustedRadius) return 0;

    const distanceScore = 1 - distance / adjustedRadius;
    const confidence = Math.min(contact.confidence, target.point.confidence ?? 1);
    return distanceScore * 0.8 + confidence * 0.2;
  }

  private setState(newState: DetectionState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.stateCallback?.(newState);
    }
  }

  isHandNearHead(): boolean {
    return this.currentIsNearHead;
  }

  getActiveZone(): DetectionZone | null {
    return this.currentActiveZone;
  }

  getState(): DetectionState {
    return this.state;
  }

  reset(): void {
    this.state = 'IDLE';
    this.detectStartTime = null;
    this.cooldownStartTime = null;
    this.currentIsNearHead = false;
    this.currentActiveZone = null;
    this.requireHandRemoval = false;
    this.missedFrameCount = 0;
    this.clearFrameCount = 0;
    this.lastActiveZone = null;
    this.lastHead = null;
    this.lastFaceLandmarks = null;
    this.missingHeadFrames = 0;
    this.missingFaceFrames = 0;
    this.stateCallback?.('IDLE');
  }
}
