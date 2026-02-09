import {
  FaceLandmarker,
  HandLandmarker,
  FilesetResolver,
  FaceLandmarkerResult,
  HandLandmarkerResult,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import { DetectionResult, HandKeypoints, HeadRegion, Point, FaceLandmarks } from './types';
import { MEDIAPIPE_URLS } from '../constants/mediapipe';
import { logger } from '../utils/logger';

// Hand landmark indices
const HAND_LANDMARK = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_TIP: 8,
  MIDDLE_TIP: 12,
  RING_TIP: 16,
  PINKY_TIP: 20,
};

// Key face landmark indices
const FACE_LANDMARK = {
  FOREHEAD_TOP: 10,
  CHIN: 152,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_INNER: 362,
  NOSE_TIP: 4,
  NOSE_BRIDGE: 6,
  UPPER_LIP: 13,
  LOWER_LIP: 14,
  LEFT_CHEEK: 234,
  RIGHT_CHEEK: 454,
  LEFT_EYEBROW_INNER: 70,
  RIGHT_EYEBROW_INNER: 300,
};

// Colors for drawing
const HAND_COLORS = {
  Left: '#FF6B6B',
  Right: '#4ECDC4',
};

const FINGER_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [9, 10], [10, 11], [11, 12],
  [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];

export class MediaPipeDetector {
  private faceLandmarker: FaceLandmarker | null = null;
  private handLandmarker: HandLandmarker | null = null;
  private isLoaded = false;
  private isLoading = false;

  async loadModel(onProgress?: (progress: number, status: string) => void): Promise<void> {
    if (this.isLoading || this.isLoaded) return;
    this.isLoading = true;

    try {
      onProgress?.(10, 'Loading WASM runtime...');
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_URLS.WASM_RUNTIME);

      // Helper functions to create landmarkers with GPU/CPU fallback
      const createFaceLandmarker = async (delegate: 'GPU' | 'CPU') => {
        return FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MEDIAPIPE_URLS.FACE_LANDMARKER_MODEL,
            delegate,
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      };

      const createHandLandmarker = async (delegate: 'GPU' | 'CPU') => {
        return HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MEDIAPIPE_URLS.HAND_LANDMARKER_MODEL,
            delegate,
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      };

      // Load Face Landmarker with GPU fallback to CPU
      onProgress?.(30, 'Loading Face Landmarker...');
      try {
        this.faceLandmarker = await createFaceLandmarker('GPU');
      } catch (gpuError) {
        logger.warn('GPU acceleration failed for face detection, falling back to CPU');
        this.faceLandmarker = await createFaceLandmarker('CPU');
      }

      // Load Hand Landmarker with GPU fallback to CPU
      onProgress?.(60, 'Loading Hand Landmarker...');
      try {
        this.handLandmarker = await createHandLandmarker('GPU');
      } catch (gpuError) {
        logger.warn('GPU acceleration failed for hand detection, falling back to CPU');
        this.handLandmarker = await createHandLandmarker('CPU');
      }

      this.isLoaded = true;
      this.isLoading = false;
      onProgress?.(100, 'Ready!');
    } catch (error) {
      this.isLoading = false;
      logger.error('Failed to load MediaPipe models:', error);
      throw error;
    }
  }

  async detect(video: HTMLVideoElement): Promise<DetectionResult> {
    const startTime = performance.now();

    if (!this.isLoaded || !this.faceLandmarker || !this.handLandmarker) {
      return { hands: [], head: null, keypoints: [], faceLandmarks: null, inferenceTime: 0 };
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (width === 0 || height === 0) {
      return { hands: [], head: null, keypoints: [], faceLandmarks: null, inferenceTime: 0 };
    }

    try {
      const timestamp = performance.now();
      const faceResults = this.faceLandmarker.detectForVideo(video, timestamp);
      const handResults = this.handLandmarker.detectForVideo(video, timestamp);

      const result = this.processResults(faceResults, handResults, width, height);
      return { ...result, inferenceTime: performance.now() - startTime };
    } catch (error) {
      logger.error('Detection error:', error);
      return { hands: [], head: null, keypoints: [], faceLandmarks: null, inferenceTime: performance.now() - startTime };
    }
  }

  private processResults(
    faceResults: FaceLandmarkerResult,
    handResults: HandLandmarkerResult,
    width: number,
    height: number
  ): Omit<DetectionResult, 'inferenceTime'> {
    const hands: HandKeypoints[] = [];
    let head: HeadRegion | null = null;
    let faceLandmarks: FaceLandmarks | null = null;

    // Process face
    if (faceResults.faceLandmarks && faceResults.faceLandmarks.length > 0) {
      const landmarks = faceResults.faceLandmarks[0];
      const toPoint = (l: NormalizedLandmark): Point => ({
        x: l.x * width,
        y: l.y * height,
        confidence: 1.0,
      });

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const l of landmarks) {
        const px = l.x * width;
        const py = l.y * height;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }

      const headWidth = (maxX - minX) * 1.3;
      const headHeight = (maxY - minY) * 1.4;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      head = {
        nose: toPoint(landmarks[FACE_LANDMARK.NOSE_TIP]),
        leftEye: toPoint(landmarks[FACE_LANDMARK.LEFT_EYE_INNER]),
        rightEye: toPoint(landmarks[FACE_LANDMARK.RIGHT_EYE_INNER]),
        leftEar: toPoint(landmarks[FACE_LANDMARK.LEFT_CHEEK]),
        rightEar: toPoint(landmarks[FACE_LANDMARK.RIGHT_CHEEK]),
        center: { x: centerX, y: centerY, confidence: 1.0 },
        width: headWidth,
        height: headHeight,
      };

      faceLandmarks = {
        forehead: toPoint(landmarks[FACE_LANDMARK.FOREHEAD_TOP]),
        leftEyebrow: toPoint(landmarks[FACE_LANDMARK.LEFT_EYEBROW_INNER]),
        rightEyebrow: toPoint(landmarks[FACE_LANDMARK.RIGHT_EYEBROW_INNER]),
        leftEye: toPoint(landmarks[FACE_LANDMARK.LEFT_EYE_INNER]),
        rightEye: toPoint(landmarks[FACE_LANDMARK.RIGHT_EYE_INNER]),
        noseTip: toPoint(landmarks[FACE_LANDMARK.NOSE_TIP]),
        noseBridge: toPoint(landmarks[FACE_LANDMARK.NOSE_BRIDGE]),
        leftCheek: toPoint(landmarks[FACE_LANDMARK.LEFT_CHEEK]),
        rightCheek: toPoint(landmarks[FACE_LANDMARK.RIGHT_CHEEK]),
        upperLip: toPoint(landmarks[FACE_LANDMARK.UPPER_LIP]),
        lowerLip: toPoint(landmarks[FACE_LANDMARK.LOWER_LIP]),
        chin: toPoint(landmarks[FACE_LANDMARK.CHIN]),
        all: landmarks.map(l => toPoint(l)),
      };
    }

    // Process hands - simple and clean, no over-filtering
    if (handResults.landmarks && handResults.handednesses) {
      for (let i = 0; i < handResults.landmarks.length; i++) {
        const landmarks = handResults.landmarks[i];
        const handedness = handResults.handednesses[i];
        const confidence = handedness[0].score;

        // Basic confidence check only
        if (confidence < 0.5) continue;

        const points: Point[] = landmarks.map(l => ({
          x: l.x * width,
          y: l.y * height,
          confidence: 1.0,
        }));

        // Ensure we have enough landmarks for fingertip access
        if (points.length <= HAND_LANDMARK.PINKY_TIP) continue;

        hands.push({
          landmarks: points,
          handedness: handedness[0].categoryName as 'Left' | 'Right',
          confidence,
          fingertips: {
            thumb: points[HAND_LANDMARK.THUMB_TIP],
            index: points[HAND_LANDMARK.INDEX_TIP],
            middle: points[HAND_LANDMARK.MIDDLE_TIP],
            ring: points[HAND_LANDMARK.RING_TIP],
            pinky: points[HAND_LANDMARK.PINKY_TIP],
          },
          wrist: points[HAND_LANDMARK.WRIST],
        });
      }
    }

    return { hands, head, keypoints: [], faceLandmarks };
  }

  drawResults(ctx: CanvasRenderingContext2D, results: DetectionResult, isNearHead: boolean = false): void {
    const { hands, head, faceLandmarks } = results;

    // Draw face outline
    if (faceLandmarks && faceLandmarks.all.length > 0) {
      ctx.strokeStyle = isNearHead ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 255, 255, 0.2)';
      ctx.lineWidth = 1;

      const faceOvalIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];

      ctx.beginPath();
      for (let i = 0; i < faceOvalIndices.length; i++) {
        const point = faceLandmarks.all[faceOvalIndices[i]];
        if (!point) continue;
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      }
      ctx.closePath();
      ctx.stroke();

      // Draw key points
      const drawPoint = (point: Point, color: string, radius: number = 3) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      };

      drawPoint(faceLandmarks.leftEye, '#4ECDC4', 4);
      drawPoint(faceLandmarks.rightEye, '#4ECDC4', 4);
      drawPoint(faceLandmarks.noseTip, '#FF6B6B', 4);
      drawPoint(faceLandmarks.upperLip, '#FF85A2', 3);
      drawPoint(faceLandmarks.lowerLip, '#FF85A2', 3);
      drawPoint(faceLandmarks.leftCheek, '#98D8C8', 3);
      drawPoint(faceLandmarks.rightCheek, '#98D8C8', 3);
      drawPoint(faceLandmarks.forehead, '#BB8FCE', 3);
      drawPoint(faceLandmarks.chin, '#85C1E9', 3);
    }

    // Draw head ellipse
    if (head) {
      ctx.strokeStyle = isNearHead ? '#FF4444' : '#00FFFF';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);

      ctx.beginPath();
      ctx.ellipse(head.center.x, head.center.y, head.width / 2, head.height / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = isNearHead ? '#FF4444' : '#00FFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.save();
      ctx.translate(head.center.x + 25, head.center.y - head.height / 2 - 10);
      ctx.scale(-1, 1);
      ctx.fillText(isNearHead ? 'WARNING' : 'FACE', 0, 0);
      ctx.restore();
    }

    // Draw hands
    for (const hand of hands) {
      const color = HAND_COLORS[hand.handedness];

      // Draw connections
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      for (const [start, end] of FINGER_CONNECTIONS) {
        const s = hand.landmarks[start];
        const e = hand.landmarks[end];
        if (s && e) {
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(e.x, e.y);
          ctx.stroke();
        }
      }

      // Draw landmarks
      for (let i = 0; i < hand.landmarks.length; i++) {
        const point = hand.landmarks[i];
        const isTip = [4, 8, 12, 16, 20].includes(i);
        const radius = isTip ? 8 : 5;

        if (isTip) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, radius + 4, 0, Math.PI * 2);
          ctx.fillStyle = isNearHead ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 255, 255, 0.3)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isTip ? '#FFFFFF' : color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Info box removed - now handled by DetectionOverlay component
  }

  dispose(): void {
    this.faceLandmarker?.close();
    this.handLandmarker?.close();
    this.faceLandmarker = null;
    this.handLandmarker = null;
    this.isLoaded = false;
  }
}
