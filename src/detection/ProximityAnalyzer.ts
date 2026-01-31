import { DetectionState, HandKeypoints, HeadRegion, DetectionZone, FaceLandmarks, Point, DEFAULT_ENABLED_ZONES } from './types';

export interface ProximityInfo {
  isNearHead: boolean;
  progress: number;
  state: DetectionState;
  activeZone: DetectionZone | null;
}

interface Config {
  triggerTime: number;      // Seconds to hold before alert
  cooldownTime: number;     // Seconds after alert before can trigger again
  sensitivity: number;      // 0-1, affects detection radius
  enabledZones: DetectionZone[];  // Which zones to monitor
}

// Zone radius multipliers (relative to face size)
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

export class ProximityAnalyzer {
  private state: DetectionState = 'IDLE';
  private detectStartTime: number | null = null;
  private cooldownStartTime: number | null = null;
  private currentIsNearHead = false;
  private currentActiveZone: DetectionZone | null = null;
  private requireHandRemoval = false;

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

  /**
   * Main update function - call this every frame with detection results
   */
  update(hands: HandKeypoints[], head: HeadRegion | null, faceLandmarks?: FaceLandmarks | null): ProximityInfo {
    const now = Date.now();

    // Check which zone (if any) a fingertip is touching
    const { isNearHead, activeZone } = this.checkZoneTouch(hands, head, faceLandmarks);

    this.currentIsNearHead = isNearHead;
    this.currentActiveZone = activeZone;

    let progress = 0;

    // After alert, wait until hand is fully removed before allowing re-detection
    if (this.requireHandRemoval) {
      if (!isNearHead) {
        this.requireHandRemoval = false;
      }
    }

    // Simple state machine
    switch (this.state) {
      case 'IDLE':
        if (isNearHead && !this.requireHandRemoval) {
          this.setState('DETECTING');
          this.detectStartTime = now;
        }
        break;

      case 'DETECTING':
        if (!isNearHead) {
          // Hand removed - go back to IDLE
          this.setState('IDLE');
          this.detectStartTime = null;
        } else if (this.detectStartTime) {
          // Hand still near - check progress
          const elapsed = (now - this.detectStartTime) / 1000;
          progress = Math.min(elapsed / this.config.triggerTime, 1);

          if (progress >= 1) {
            // Trigger alert!
            this.setState('ALERT');
            this.alertCallback?.();
            this.cooldownStartTime = now;
          }
        }
        break;

      case 'ALERT':
        progress = 1;
        // Immediately transition to cooldown
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

  /**
   * Check if any fingertip is touching an enabled zone
   */
  private checkZoneTouch(
    hands: HandKeypoints[],
    head: HeadRegion | null,
    faceLandmarks?: FaceLandmarks | null
  ): { isNearHead: boolean; activeZone: DetectionZone | null } {
    if (!head || hands.length === 0) {
      return { isNearHead: false, activeZone: null };
    }

    const enabledZones = this.config.enabledZones;

    // If fullFace is enabled, use simple ellipse detection
    if (enabledZones.includes('fullFace')) {
      const isNear = this.checkFingertipInsideFace(hands, head);
      return { isNearHead: isNear, activeZone: isNear ? 'fullFace' : null };
    }

    // Otherwise, check specific zones
    if (!faceLandmarks) {
      // Cannot detect specific zones without face landmarks
      // Return false instead of falling back to full face
      return { isNearHead: false, activeZone: null };
    }

    // Get zone center points
    const zoneCenters = this.getZoneCenters(faceLandmarks, head);

    // Check each fingertip against each enabled zone
    for (const hand of hands) {
      if (!hand.fingertips) continue;

      const tips = [
        hand.fingertips.thumb,
        hand.fingertips.index,
        hand.fingertips.middle,
        hand.fingertips.ring,
        hand.fingertips.pinky,
      ];

      for (const tip of tips) {
        if (!tip) continue;

        for (const zone of enabledZones) {
          if (zone === 'fullFace') continue;

          // Special handling for ears - check both left and right ear positions
          if (zone === 'ears') {
            const earPositions = this.getEarPositions(faceLandmarks, head);
            const baseRadius = Math.min(head.width, head.height) * ZONE_RADIUS[zone];
            const radius = baseRadius * (0.8 + this.config.sensitivity * 0.7);

            for (const earPos of earPositions) {
              const dx = tip.x - earPos.x;
              const dy = tip.y - earPos.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance <= radius) {
                return { isNearHead: true, activeZone: zone };
              }
            }
            continue;
          }

          const zoneCenter = zoneCenters[zone];
          if (!zoneCenter) continue;

          // Calculate zone radius based on face size and sensitivity
          const baseRadius = Math.min(head.width, head.height) * ZONE_RADIUS[zone];
          const radius = baseRadius * (0.8 + this.config.sensitivity * 0.7);

          // Distance check
          const dx = tip.x - zoneCenter.x;
          const dy = tip.y - zoneCenter.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= radius) {
            return { isNearHead: true, activeZone: zone };
          }
        }
      }
    }

    return { isNearHead: false, activeZone: null };
  }

  /**
   * Get left and right ear positions for ears zone detection
   */
  private getEarPositions(faceLandmarks: FaceLandmarks, head: HeadRegion): Point[] {
    const positions: Point[] = [];

    if (head.leftEar) {
      positions.push(head.leftEar);
    }
    if (head.rightEar) {
      positions.push(head.rightEar);
    }

    // If no ear data from MediaPipe, estimate positions based on face dimensions
    if (positions.length === 0) {
      const eyeY = (faceLandmarks.leftEye.y + faceLandmarks.rightEye.y) / 2;
      // Ears are on the sides of the face, approximately at eye level
      const earOffsetX = head.width * 0.55;

      // Left ear (estimated)
      positions.push({
        x: head.center.x - earOffsetX,
        y: eyeY,
        confidence: 0.5,
      });

      // Right ear (estimated)
      positions.push({
        x: head.center.x + earOffsetX,
        y: eyeY,
        confidence: 0.5,
      });
    }

    return positions;
  }

  /**
   * Get center points for each detection zone based on face landmarks
   */
  private getZoneCenters(faceLandmarks: FaceLandmarks, head: HeadRegion): Partial<Record<DetectionZone, Point>> {
    const centers: Partial<Record<DetectionZone, Point>> = {};

    // Scalp - above forehead
    centers.scalp = {
      x: faceLandmarks.forehead.x,
      y: faceLandmarks.forehead.y - head.height * 0.2,
      confidence: faceLandmarks.forehead.confidence,
    };

    // Forehead
    centers.forehead = faceLandmarks.forehead;

    // Eyebrows - between forehead and eyes
    centers.eyebrows = {
      x: (faceLandmarks.leftEyebrow.x + faceLandmarks.rightEyebrow.x) / 2,
      y: (faceLandmarks.leftEyebrow.y + faceLandmarks.rightEyebrow.y) / 2,
      confidence: (faceLandmarks.leftEyebrow.confidence + faceLandmarks.rightEyebrow.confidence) / 2,
    };

    // Eyes
    centers.eyes = {
      x: (faceLandmarks.leftEye.x + faceLandmarks.rightEye.x) / 2,
      y: (faceLandmarks.leftEye.y + faceLandmarks.rightEye.y) / 2,
      confidence: (faceLandmarks.leftEye.confidence + faceLandmarks.rightEye.confidence) / 2,
    };

    // Nose
    centers.nose = faceLandmarks.noseTip;

    // Cheeks
    centers.cheeks = {
      x: (faceLandmarks.leftCheek.x + faceLandmarks.rightCheek.x) / 2,
      y: (faceLandmarks.leftCheek.y + faceLandmarks.rightCheek.y) / 2,
      confidence: (faceLandmarks.leftCheek.confidence + faceLandmarks.rightCheek.confidence) / 2,
    };

    // Mouth
    centers.mouth = {
      x: (faceLandmarks.upperLip.x + faceLandmarks.lowerLip.x) / 2,
      y: (faceLandmarks.upperLip.y + faceLandmarks.lowerLip.y) / 2,
      confidence: (faceLandmarks.upperLip.confidence + faceLandmarks.lowerLip.confidence) / 2,
    };

    // Chin
    centers.chin = faceLandmarks.chin;

    // Note: ears zone is handled separately in getEarPositions() for better accuracy

    return centers;
  }

  /**
   * Check if any fingertip is inside the face ellipse (for fullFace mode)
   */
  private checkFingertipInsideFace(hands: HandKeypoints[], head: HeadRegion): boolean {
    // Sensitivity affects the detection radius
    const radiusMultiplier = 0.8 + this.config.sensitivity * 0.7;
    const radiusX = (head.width / 2) * radiusMultiplier;
    const radiusY = (head.height / 2) * radiusMultiplier;

    for (const hand of hands) {
      if (!hand.fingertips) continue;

      const tips = [
        hand.fingertips.thumb,
        hand.fingertips.index,
        hand.fingertips.middle,
        hand.fingertips.ring,
        hand.fingertips.pinky,
      ];

      for (const tip of tips) {
        if (!tip) continue;

        // Ellipse equation: (x-h)²/a² + (y-k)²/b² <= 1 means inside
        const dx = tip.x - head.center.x;
        const dy = tip.y - head.center.y;
        const normalizedDist = (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY);

        if (normalizedDist <= 1) {
          return true;
        }
      }
    }

    return false;
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
    this.stateCallback?.('IDLE');
  }
}
