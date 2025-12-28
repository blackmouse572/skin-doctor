/**
 * Status evaluation logic for face detection metrics
 */

import type { FaceDetectionStatus } from './types';
import { QUALITY_THRESHOLDS } from './analysis-utils';

interface StatusEvaluatorInput {
  faceCount: number;
  brightness: number;
  angle: number;
  isTooClose: boolean;
  isTooFar: boolean;
}

/**
 * Evaluate lighting status based on brightness value
 */
function evaluateLightingStatus(
  brightness: number,
): FaceDetectionStatus['lighting'] {
  if (brightness < QUALITY_THRESHOLDS.lighting.warningMin) {
    return {
      status: 'error',
      message: 'Too dark - move to brighter area',
      brightness,
    };
  }

  if (brightness < QUALITY_THRESHOLDS.lighting.min) {
    return {
      status: 'warning',
      message: 'Slightly dark - increase lighting',
      brightness,
    };
  }

  if (brightness > QUALITY_THRESHOLDS.lighting.warningMax) {
    return {
      status: 'error',
      message: 'Too bright - reduce glare',
      brightness,
    };
  }

  if (brightness > QUALITY_THRESHOLDS.lighting.max) {
    return {
      status: 'warning',
      message: 'Slightly bright - reduce light',
      brightness,
    };
  }

  return {
    status: 'perfect',
    message: 'Lighting is perfect',
    brightness,
  };
}

/**
 * Evaluate angle status based on angle value
 */
function evaluateAngleStatus(angle: number): FaceDetectionStatus['angle'] {
  if (angle < QUALITY_THRESHOLDS.angle.perfect) {
    return {
      status: 'perfect',
      message: 'Face straight ahead',
    };
  }

  if (angle < QUALITY_THRESHOLDS.angle.acceptable) {
    return {
      status: 'warning',
      message: 'Slight angle - look straight',
    };
  }

  return {
    status: 'error',
    message: 'Face turned - look straight at camera',
  };
}

/**
 * Evaluate distance status based on distance flags
 */
function evaluateDistanceStatus(
  isTooClose: boolean,
  isTooFar: boolean,
): FaceDetectionStatus['distance'] {
  if (isTooClose) {
    return {
      status: 'error',
      message: 'Too close - move back',
    };
  }

  if (isTooFar) {
    return {
      status: 'error',
      message: 'Too far - move closer',
    };
  }

  return {
    status: 'perfect',
    message: 'Distance is good',
  };
}

/**
 * Evaluate face detection status based on face count
 */
function evaluateFaceStatus(faceCount: number): FaceDetectionStatus['face'] {
  if (faceCount === 0) {
    return {
      status: 'error',
      message: 'No face detected',
    };
  }

  if (faceCount === 1) {
    return {
      status: 'perfect',
      message: 'Face detected',
    };
  }

  return {
    status: 'warning',
    message: `${faceCount} faces detected - show only one`,
  };
}

/**
 * Evaluate all face detection metrics and return comprehensive status
 */
export function evaluateDetectionStatus(
  input: StatusEvaluatorInput,
): FaceDetectionStatus {
  const { faceCount, brightness, angle, isTooClose, isTooFar } = input;

  // If no face detected, return checking status for other metrics
  if (faceCount === 0) {
    return {
      face: evaluateFaceStatus(faceCount),
      lighting: { status: 'checking', message: 'Detecting face first...' },
      angle: { status: 'checking', message: 'Detecting face first...' },
      distance: { status: 'checking', message: 'Detecting face first...' },
    };
  }

  // Face detected, evaluate all metrics
  return {
    face: evaluateFaceStatus(faceCount),
    lighting: evaluateLightingStatus(brightness),
    angle: evaluateAngleStatus(angle),
    distance: evaluateDistanceStatus(isTooClose, isTooFar),
  };
}

/**
 * Determine if all quality checks pass
 */
export function allChecksPass(
  status: FaceDetectionStatus,
  faceCount: number,
): boolean {
  return (
    faceCount === 1 &&
    status.lighting.status === 'perfect' &&
    status.angle.status !== 'error' &&
    status.distance.status === 'perfect'
  );
}
