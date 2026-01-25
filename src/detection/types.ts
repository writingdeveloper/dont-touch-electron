export type DetectionState = 'IDLE' | 'DETECTING' | 'ALERT' | 'COOLDOWN';

export interface Point {
  x: number;
  y: number;
  confidence: number;
}

export interface HandKeypoints {
  landmarks: Point[];
  handedness: 'Left' | 'Right';
  confidence: number;
}

export interface HeadRegion {
  nose: Point;
  leftEye?: Point;
  rightEye?: Point;
  leftEar?: Point;
  rightEar?: Point;
  center: Point;
  width: number;
  height: number;
}

export interface DetectionResult {
  hands: HandKeypoints[];
  head: HeadRegion | null;
  inferenceTime: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  classId: number;
  className: string;
}
