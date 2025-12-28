/**
 * Shared types for face detection functionality
 */

export interface FaceQualityMetrics {
  hasFace: boolean;
  faceCount: number;
  brightness: number;
  angle: number;
  distance: number;
  isForward: boolean;
  isTooClose: boolean;
  isTooFar: boolean;
  allChecksPass: boolean;
}

export interface FaceDetectionStatus {
  face: {
    status: 'checking' | 'perfect' | 'warning' | 'error';
    message: string;
  };
  lighting: {
    status: 'checking' | 'perfect' | 'warning' | 'error';
    message: string;
    brightness?: number;
  };
  angle: {
    status: 'checking' | 'perfect' | 'warning' | 'error';
    message: string;
  };
  distance: {
    status: 'checking' | 'perfect' | 'warning' | 'error';
    message: string;
  };
}

export const MEDIAPIPE_CONFIG = {
  modelUrl:
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  cdnUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
} as const;
