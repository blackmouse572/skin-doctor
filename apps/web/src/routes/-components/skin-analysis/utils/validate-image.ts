import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision';

export interface ImageValidationResult {
  isValid: boolean;
  hasFace: boolean;
  faceCount: number;
  brightness: number;
  issues: string[];
  warnings: string[];
}

const QUALITY_THRESHOLDS = {
  lighting: {
    min: 60,
    max: 200,
    warningMin: 40,
    warningMax: 220,
  },
  minFaces: 1,
  maxFaces: 1,
} as const;

const MEDIAPIPE_CONFIG = {
  modelUrl:
    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  cdnUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
} as const;

let faceLandmarkerInstance: FaceLandmarker | null = null;

/**
 * Initialize MediaPipe Face Landmarker for image validation
 */
async function initializeFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarkerInstance) {
    return faceLandmarkerInstance;
  }

  const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_CONFIG.cdnUrl);

  const landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MEDIAPIPE_CONFIG.modelUrl,
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
    numFaces: 2, // Detect up to 2 to warn about multiple people
    minFaceDetectionConfidence: 0.6,
  });

  faceLandmarkerInstance = landmarker;
  return landmarker;
}

/**
 * Calculate average brightness of the face region in an image
 */
function calculateBrightness(image: HTMLImageElement, landmarks: any): number {
  try {
    // Get face bounding box
    const xs = landmarks.map((l: any) => l.x);
    const ys = landmarks.map((l: any) => l.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Convert normalized coordinates to pixel coordinates
    const x = minX * image.width;
    const y = minY * image.height;
    const width = (maxX - minX) * image.width;
    const height = (maxY - minY) * image.height;

    // Create canvas and draw face region
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

    // Calculate average brightness
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let sum = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i] || 0;
      const g = pixels[i + 1] || 0;
      const b = pixels[i + 2] || 0;
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
 * Validate an uploaded image file for skin analysis
 * Returns validation result with issues and warnings
 */
export async function validateUploadedImage(
  file: File | Blob,
): Promise<ImageValidationResult> {
  const result: ImageValidationResult = {
    isValid: true,
    hasFace: false,
    faceCount: 0,
    brightness: 0,
    issues: [],
    warnings: [],
  };

  try {
    // Validate file type
    if (!file) {
      throw new Error('No file provided');
    }

    // Load image
    const image = await loadImage(file);

    // Initialize MediaPipe if needed
    const faceLandmarker = await initializeFaceLandmarker();

    // Detect faces
    const detectionResult: FaceLandmarkerResult = faceLandmarker.detect(image);

    // Check face presence
    result.faceCount = detectionResult.faceLandmarks?.length || 0;
    result.hasFace = result.faceCount > 0;

    if (result.faceCount === 0) {
      result.issues.push('No face detected in the image');
      result.isValid = false;
    } else if (result.faceCount > QUALITY_THRESHOLDS.maxFaces) {
      result.warnings.push(
        `${result.faceCount} faces detected - only one person should be in the photo`,
      );
      result.isValid = false;
    }

    // If face detected, check lighting quality
    if (
      result.hasFace &&
      detectionResult.faceLandmarks &&
      detectionResult.faceLandmarks.length > 0
    ) {
      const landmarks = detectionResult.faceLandmarks[0];
      const brightness = calculateBrightness(image, landmarks);
      result.brightness = brightness;

      if (brightness < QUALITY_THRESHOLDS.lighting.warningMin) {
        result.issues.push(
          'Image is too dark - lighting quality may affect analysis accuracy',
        );
      } else if (brightness < QUALITY_THRESHOLDS.lighting.min) {
        result.warnings.push(
          'Image is slightly dark - consider retaking in better lighting',
        );
      } else if (brightness > QUALITY_THRESHOLDS.lighting.warningMax) {
        result.issues.push(
          'Image is too bright or has glare - may affect analysis accuracy',
        );
      } else if (brightness > QUALITY_THRESHOLDS.lighting.max) {
        result.warnings.push(
          'Image is slightly bright - consider reducing direct light',
        );
      }
    }
  } catch (error) {
    console.error('Image validation error:', error);
    result.warnings.push('Unable to validate image quality automatically');
    // Don't mark as invalid if validation fails - allow user to proceed
  }

  return result;
}

/**
 * Load an image file into an HTMLImageElement
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!file || !(file instanceof Blob)) {
      reject(new Error('Invalid file: must be a File or Blob object'));
      return;
    }

    // Check if it's an image
    if (file.type && !file.type.startsWith('image/')) {
      reject(new Error('Invalid file type: must be an image'));
      return;
    }

    const img = new Image();
    let url: string | null = null;

    try {
      url = URL.createObjectURL(file);
    } catch (error) {
      reject(new Error('Failed to create object URL from file'));
      return;
    }

    img.onload = () => {
      if (url) URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      if (url) URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Validate multiple images
 */
export async function validateUploadedImages(
  files: (File | Blob)[],
): Promise<ImageValidationResult[]> {
  const validationPromises = files.map((file) => validateUploadedImage(file));
  return Promise.all(validationPromises);
}

/**
 * Clean up MediaPipe resources
 */
export function cleanupValidator(): void {
  if (faceLandmarkerInstance) {
    faceLandmarkerInstance.close();
    faceLandmarkerInstance = null;
  }
}
