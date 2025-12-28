/**
 * Utility functions for face detection analysis
 */

export interface FaceLandmark {
  x: number;
  y: number;
  z: number;
}

export const QUALITY_THRESHOLDS = {
  lighting: {
    min: 60,
    max: 200,
    warningMin: 40,
    warningMax: 220,
  },
  angle: {
    perfect: 0.05,
    acceptable: 0.1,
  },
  distance: {
    tooClose: 0.4,
    tooFar: 0.15,
  },
} as const;

/**
 * Calculate brightness of face region in video
 */
export function calculateBrightness(
  video: HTMLVideoElement,
  landmarks: FaceLandmark[],
): number {
  try {
    // Get face bounding box
    const xs = landmarks.map((l) => l.x);
    const ys = landmarks.map((l) => l.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Convert normalized coordinates to pixel coordinates
    const x = minX * video.videoWidth;
    const y = minY * video.videoHeight;
    const width = (maxX - minX) * video.videoWidth;
    const height = (maxY - minY) * video.videoHeight;

    // Create canvas and draw face region
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    ctx.drawImage(video, x, y, width, height, 0, 0, width, height);

    // Calculate average brightness
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let sum = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i] ?? 0;
      const g = pixels[i + 1] ?? 0;
      const b = pixels[i + 2] ?? 0;
      // Calculate perceived brightness (weighted grayscale)
      sum += 0.299 * r + 0.587 * g + 0.114 * b;
    }

    return sum / (pixels.length / 4);
  } catch (err) {
    console.error('Error calculating brightness:', err);
    return 0;
  }
}

/**
 * Check if face is looking straight at camera
 */
export function checkFaceAngle(
  landmarks: FaceLandmark[],
): { isForward: boolean; angle: number } {
  try {
    // MediaPipe Face Mesh indices: Left ear: 234, Right ear: 454
    const leftEar = landmarks[234];
    const rightEar = landmarks[454];

    if (!leftEar || !rightEar) {
      return { isForward: false, angle: 0 };
    }

    const zDiff = Math.abs(leftEar.z - rightEar.z);
    const isForward = zDiff < QUALITY_THRESHOLDS.angle.perfect;

    return { isForward, angle: zDiff };
  } catch (err) {
    console.error('Error checking face angle:', err);
    return { isForward: false, angle: 0 };
  }
}

/**
 * Check if face is at appropriate distance from camera
 */
export function checkFaceDistance(landmarks: FaceLandmark[]): {
  isTooFar: boolean;
  isTooClose: boolean;
  size: number;
} {
  try {
    // MediaPipe indices: Left eye outer: 33, Right eye outer: 263
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];

    if (!leftEye || !rightEye) {
      return { isTooFar: true, isTooClose: false, size: 0 };
    }

    const eyeDistance = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) +
        Math.pow(rightEye.y - leftEye.y, 2),
    );

    const isTooFar = eyeDistance < QUALITY_THRESHOLDS.distance.tooFar;
    const isTooClose = eyeDistance > QUALITY_THRESHOLDS.distance.tooClose;

    return { isTooFar, isTooClose, size: eyeDistance };
  } catch (err) {
    console.error('Error checking face distance:', err);
    return { isTooFar: true, isTooClose: false, size: 0 };
  }
}
