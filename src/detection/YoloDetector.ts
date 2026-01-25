import * as ort from 'onnxruntime-web';
import { DetectionResult, HandKeypoints, HeadRegion, Point } from './types';

// Configure ONNX Runtime
ort.env.wasm.wasmPaths = '/';

export class YoloDetector {
  private handSession: ort.InferenceSession | null = null;
  private poseSession: ort.InferenceSession | null = null;
  private isLoaded = false;

  private readonly inputSize = 640;
  private readonly handKeypointCount = 21;
  private readonly poseKeypointCount = 17;

  // Pose keypoint indices
  private readonly NOSE = 0;
  private readonly LEFT_EYE = 1;
  private readonly RIGHT_EYE = 2;
  private readonly LEFT_EAR = 3;
  private readonly RIGHT_EAR = 4;

  async loadModel(): Promise<void> {
    try {
      // Try WebGPU first, fallback to WASM
      const executionProviders: ort.InferenceSession.ExecutionProviderConfig[] = [];

      if ('gpu' in navigator) {
        executionProviders.push('webgpu');
      }
      executionProviders.push('wasm');

      const sessionOptions: ort.InferenceSession.SessionOptions = {
        executionProviders,
        graphOptimizationLevel: 'all',
      };

      // Load models (paths will be configured based on environment)
      const modelBasePath = this.getModelBasePath();

      // For now, we'll use placeholder - actual models need to be added
      console.log('Loading models from:', modelBasePath);

      // TODO: Load actual YOLO models
      // this.handSession = await ort.InferenceSession.create(
      //   `${modelBasePath}/yolo-hand-pose.onnx`,
      //   sessionOptions
      // );
      // this.poseSession = await ort.InferenceSession.create(
      //   `${modelBasePath}/yolo-pose.onnx`,
      //   sessionOptions
      // );

      this.isLoaded = true;
      console.log('Detection models loaded (placeholder mode)');
    } catch (error) {
      console.error('Failed to load models:', error);
      throw error;
    }
  }

  private getModelBasePath(): string {
    // Models are served from public folder
    return '/models';
  }

  async detect(video: HTMLVideoElement): Promise<DetectionResult> {
    const startTime = performance.now();

    if (!this.isLoaded) {
      return { hands: [], head: null, inferenceTime: 0 };
    }

    // TODO: Implement actual YOLO inference
    // For now, return mock data for testing UI
    const mockResult = this.getMockDetectionResult(video);
    const inferenceTime = performance.now() - startTime;

    return {
      ...mockResult,
      inferenceTime,
    };
  }

  private getMockDetectionResult(video: HTMLVideoElement): Omit<DetectionResult, 'inferenceTime'> {
    // Mock detection for UI testing
    // This will be replaced with actual YOLO inference
    return {
      hands: [],
      head: null,
    };
  }

  private preprocessImage(video: HTMLVideoElement): Float32Array {
    const canvas = document.createElement('canvas');
    canvas.width = this.inputSize;
    canvas.height = this.inputSize;
    const ctx = canvas.getContext('2d')!;

    // Draw and resize video frame
    ctx.drawImage(video, 0, 0, this.inputSize, this.inputSize);
    const imageData = ctx.getImageData(0, 0, this.inputSize, this.inputSize);

    // Convert to float32 and normalize (RGB, CHW format)
    const float32Data = new Float32Array(3 * this.inputSize * this.inputSize);
    const pixels = imageData.data;

    for (let i = 0; i < this.inputSize * this.inputSize; i++) {
      const pixelIndex = i * 4;
      float32Data[i] = pixels[pixelIndex] / 255.0; // R
      float32Data[i + this.inputSize * this.inputSize] = pixels[pixelIndex + 1] / 255.0; // G
      float32Data[i + 2 * this.inputSize * this.inputSize] = pixels[pixelIndex + 2] / 255.0; // B
    }

    return float32Data;
  }

  drawResults(ctx: CanvasRenderingContext2D, results: DetectionResult): void {
    const { hands, head } = results;

    // Draw head region
    if (head) {
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        head.center.x - head.width / 2,
        head.center.y - head.height / 2,
        head.width,
        head.height
      );
    }

    // Draw hand landmarks
    for (const hand of hands) {
      ctx.fillStyle = hand.handedness === 'Left' ? '#FF6B6B' : '#4ECDC4';

      for (const point of hand.landmarks) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw connections
      this.drawHandConnections(ctx, hand.landmarks);
    }
  }

  private drawHandConnections(ctx: CanvasRenderingContext2D, landmarks: Point[]): void {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17], // Palm
    ];

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;

    for (const [start, end] of connections) {
      if (landmarks[start] && landmarks[end]) {
        ctx.beginPath();
        ctx.moveTo(landmarks[start].x, landmarks[start].y);
        ctx.lineTo(landmarks[end].x, landmarks[end].y);
        ctx.stroke();
      }
    }
  }

  dispose(): void {
    this.handSession?.release();
    this.poseSession?.release();
    this.handSession = null;
    this.poseSession = null;
    this.isLoaded = false;
  }
}
