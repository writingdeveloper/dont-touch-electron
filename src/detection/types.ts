export type DetectionState = 'IDLE' | 'DETECTING' | 'ALERT' | 'COOLDOWN';

// Detection zones for different face/head areas
export type DetectionZone =
  | 'scalp'      // 두피/정수리 - most common for trichotillomania
  | 'forehead'   // 이마
  | 'eyebrows'   // 눈썹
  | 'eyes'       // 눈 주변
  | 'nose'       // 코
  | 'cheeks'     // 볼
  | 'mouth'      // 입 주변
  | 'chin'       // 턱
  | 'ears'       // 귀
  | 'fullFace';  // 전체 얼굴

export interface DetectionZoneConfig {
  zone: DetectionZone;
  label: string;
  labelKo: string;
  description: string;
}

// Default enabled zones
export const DEFAULT_ENABLED_ZONES: DetectionZone[] = ['fullFace'];

// Zone categories for UI grouping
export const HAIR_ZONES: DetectionZone[] = ['scalp', 'eyebrows'];
export const FACE_ZONES: DetectionZone[] = ['forehead', 'eyes', 'nose', 'cheeks', 'mouth', 'chin', 'ears'];

// All available zones (excluding fullFace which is a special option)
export const ALL_SPECIFIC_ZONES: DetectionZone[] = [...HAIR_ZONES, ...FACE_ZONES];

export interface Point {
  x: number;
  y: number;
  confidence: number;
}

export interface Fingertips {
  thumb: Point;
  index: Point;
  middle: Point;
  ring: Point;
  pinky: Point;
}

export interface HandKeypoints {
  landmarks: Point[];
  handedness: 'Left' | 'Right';
  confidence: number;
  // MediaPipe additional data
  fingertips?: Fingertips;
  wrist?: Point;
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

export interface PoseKeypoint {
  x: number;
  y: number;
  confidence: number;
  name?: string;
}

// MediaPipe Face Landmarks (468 points)
export interface FaceLandmarks {
  forehead: Point;
  leftEyebrow: Point;
  rightEyebrow: Point;
  leftEye: Point;
  rightEye: Point;
  noseTip: Point;
  noseBridge: Point;
  leftCheek: Point;
  rightCheek: Point;
  upperLip: Point;
  lowerLip: Point;
  chin: Point;
  // All 468 landmarks for advanced usage
  all: Point[];
}

export interface DetectionResult {
  hands: HandKeypoints[];
  head: HeadRegion | null;
  keypoints: PoseKeypoint[];
  faceLandmarks?: FaceLandmarks | null;
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
