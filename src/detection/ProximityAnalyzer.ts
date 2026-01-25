import { DetectionState, HandKeypoints, HeadRegion } from './types';

interface ProximityAnalyzerConfig {
  triggerTime: number;
  cooldownTime: number;
  sensitivity: number;
}

export class ProximityAnalyzer {
  private state: DetectionState = 'IDLE';
  private detectingStartTime: number | null = null;
  private cooldownStartTime: number | null = null;

  private alertCallback: (() => void) | null = null;
  private stateCallback: ((state: DetectionState) => void) | null = null;

  private config: ProximityAnalyzerConfig;

  constructor(config: ProximityAnalyzerConfig) {
    this.config = config;
  }

  setAlertCallback(callback: () => void): void {
    this.alertCallback = callback;
  }

  setStateCallback(callback: (state: DetectionState) => void): void {
    this.stateCallback = callback;
  }

  update(hands: HandKeypoints[], head: HeadRegion | null): void {
    const now = Date.now();
    const isNearHead = this.checkProximity(hands, head);

    switch (this.state) {
      case 'IDLE':
        if (isNearHead) {
          this.setState('DETECTING');
          this.detectingStartTime = now;
        }
        break;

      case 'DETECTING':
        if (!isNearHead) {
          this.setState('IDLE');
          this.detectingStartTime = null;
        } else if (this.detectingStartTime) {
          const elapsed = (now - this.detectingStartTime) / 1000;
          if (elapsed >= this.config.triggerTime) {
            this.setState('ALERT');
            this.alertCallback?.();
            this.cooldownStartTime = now;
          }
        }
        break;

      case 'ALERT':
        this.setState('COOLDOWN');
        break;

      case 'COOLDOWN':
        if (this.cooldownStartTime) {
          const elapsed = (now - this.cooldownStartTime) / 1000;
          if (elapsed >= this.config.cooldownTime) {
            this.setState('IDLE');
            this.cooldownStartTime = null;
            this.detectingStartTime = null;
          }
        }
        break;
    }
  }

  private setState(state: DetectionState): void {
    if (this.state !== state) {
      this.state = state;
      this.stateCallback?.(state);
    }
  }

  private checkProximity(hands: HandKeypoints[], head: HeadRegion | null): boolean {
    if (!head || hands.length === 0) {
      return false;
    }

    // Sensitivity affects the detection radius
    // Lower sensitivity = larger detection radius
    const radiusMultiplier = 1.5 - this.config.sensitivity * 0.5;
    const headRadius = Math.max(head.width, head.height) * radiusMultiplier;

    for (const hand of hands) {
      // Check key hand landmarks (fingertips and palm center)
      const keyLandmarks = [0, 4, 8, 12, 16, 20]; // Wrist and fingertips

      for (const idx of keyLandmarks) {
        const landmark = hand.landmarks[idx];
        if (!landmark) continue;

        const distance = this.calculateDistance(
          landmark.x,
          landmark.y,
          head.center.x,
          head.center.y
        );

        if (distance < headRadius) {
          return true;
        }
      }
    }

    return false;
  }

  private calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  reset(): void {
    this.state = 'IDLE';
    this.detectingStartTime = null;
    this.cooldownStartTime = null;
    this.stateCallback?.('IDLE');
  }

  getState(): DetectionState {
    return this.state;
  }
}
