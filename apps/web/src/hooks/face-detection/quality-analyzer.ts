/**
 * Quality analyzer for face detection results
 */

import type { FaceQualityMetrics, FaceDetectionStatus } from './types';
import type { FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import {
  calculateBrightness,
  checkFaceAngle,
  checkFaceDistance,
  type FaceLandmark,
} from './analysis-utils';
import { evaluateDetectionStatus, allChecksPass } from './status-evaluator';

interface AnalysisResult {
  metrics: FaceQualityMetrics;
  status: FaceDetectionStatus;
}

/**
 * Create initial/empty metrics and status
 */
export function createEmptyAnalysis(): AnalysisResult {
  return {
    metrics: {
      hasFace: false,
      faceCount: 0,
      brightness: 0,
      angle: 0,
      distance: 0,
      isForward: false,
      isTooClose: false,
      isTooFar: false,
      allChecksPass: false,
    },
    status: {
      face: { status: 'checking', message: 'Starting face detection...' },
      lighting: { status: 'checking', message: 'Starting face detection...' },
      angle: { status: 'checking', message: 'Starting face detection...' },
      distance: { status: 'checking', message: 'Starting face detection...' },
    },
  };
}

export function analyzeFaceQuality(
  results: FaceLandmarkerResult,
  video: HTMLVideoElement,
): AnalysisResult | null {
  // Validate video has dimensions - return null to skip state update
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    return null;
  }

  const faceCount = results.faceLandmarks?.length || 0;
  const hasFace = faceCount > 0;

  // No face detected
  if (
    !hasFace ||
    !results.faceLandmarks ||
    results.faceLandmarks.length === 0
  ) {
    const status = evaluateDetectionStatus({
      faceCount: 0,
      brightness: 0,
      angle: 0,
      isTooClose: false,
      isTooFar: false,
    });

    return {
      metrics: {
        hasFace: false,
        faceCount: 0,
        brightness: 0,
        angle: 0,
        distance: 0,
        isForward: false,
        isTooClose: false,
        isTooFar: false,
        allChecksPass: false,
      },
      status,
    };
  }

  // Analyze the first detected face
  const landmarks = results.faceLandmarks[0] as FaceLandmark[];

  if (!landmarks || landmarks.length === 0) {
    // Return no face status instead of initializing
    const status = evaluateDetectionStatus({
      faceCount: 0,
      brightness: 0,
      angle: 0,
      isTooClose: false,
      isTooFar: false,
    });

    return {
      metrics: {
        hasFace: false,
        faceCount: 0,
        brightness: 0,
        angle: 0,
        distance: 0,
        isForward: false,
        isTooClose: false,
        isTooFar: false,
        allChecksPass: false,
      },
      status,
    };
  }

  try {
    // Calculate all metrics
    const brightness = calculateBrightness(video, landmarks);
    const { isForward, angle } = checkFaceAngle(landmarks);
    const { isTooFar, isTooClose, size } = checkFaceDistance(landmarks);

    // Evaluate status based on metrics
    const status = evaluateDetectionStatus({
      faceCount,
      brightness,
      angle,
      isTooClose,
      isTooFar,
    });

    // Build final metrics
    const metrics: FaceQualityMetrics = {
      hasFace: true,
      faceCount,
      brightness,
      angle,
      distance: size,
      isForward,
      isTooClose,
      isTooFar,
      allChecksPass: allChecksPass(status, faceCount),
    };

    return { metrics, status };
  } catch (err) {
    console.error('Error analyzing face quality:', err);
    // Return no face status on error instead of initializing
    const status = evaluateDetectionStatus({
      faceCount: 0,
      brightness: 0,
      angle: 0,
      isTooClose: false,
      isTooFar: false,
    });

    return {
      metrics: {
        hasFace: false,
        faceCount: 0,
        brightness: 0,
        angle: 0,
        distance: 0,
        isForward: false,
        isTooClose: false,
        isTooFar: false,
        allChecksPass: false,
      },
      status,
    };
  }
}
