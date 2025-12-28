/**
 * Face detection hook using MediaPipe
 * Refactored for better maintainability and separation of concerns
 */

import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  analyzeFaceQuality,
  createEmptyAnalysis,
  MEDIAPIPE_CONFIG,
  type FaceQualityMetrics,
  type FaceDetectionStatus,
} from './face-detection';

// Export types for consumers
export type { FaceQualityMetrics, FaceDetectionStatus };

interface UseFaceDetectionOptions {
  /** Number of faces to detect (default: 1) */
  numFaces?: number;
  /** Minimum face detection confidence (default: 0.5) */
  minFaceDetectionConfidence?: number;
  /** Minimum tracking confidence (default: 0.5) */
  minTrackingConfidence?: number;
}

interface UseFaceDetectionReturn {
  /** Whether MediaPipe is initialized and ready */
  isInitialized: boolean;
  /** Any initialization or runtime error */
  error: Error | null;
  /** Current face quality metrics */
  metrics: FaceQualityMetrics;
  /** Current detection status for each check */
  status: FaceDetectionStatus;
}

const DEFAULT_OPTIONS: Required<UseFaceDetectionOptions> = {
  numFaces: 1,
  minFaceDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
};

/**
 * Hook for real-time face detection and quality analysis
 *
 * @param videoElement - The video element to analyze
 * @param options - Configuration options
 * @returns Face detection state and metrics
 *
 * @example
 * ```tsx
 * const videoRef = useRef<HTMLVideoElement>(null);
 * const { metrics, status, isInitialized } = useFaceDetection(videoRef.current);
 *
 * if (metrics.allChecksPass) {
 *   // Ready to capture
 * }
 * ```
 */
export function useFaceDetection(
  videoElement: HTMLVideoElement | null,
  options: UseFaceDetectionOptions = {},
): UseFaceDetectionReturn {
  const config = { ...DEFAULT_OPTIONS, ...options };

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [metrics, setMetrics] = useState<FaceQualityMetrics>(
    createEmptyAnalysis().metrics,
  );
  const [status, setStatus] = useState<FaceDetectionStatus>({
    face: { status: 'checking', message: 'Waiting for camera...' },
    lighting: { status: 'checking', message: 'Waiting for camera...' },
    angle: { status: 'checking', message: 'Waiting for camera...' },
    distance: { status: 'checking', message: 'Waiting for camera...' },
  });

  // Refs
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  const isInitializingRef = useRef(false);

  /**
   * Initialize MediaPipe Face Landmarker
   */
  const initialize = useCallback(async () => {
    console.log('[FaceDetection] Initialize called', {
      isInitialized: isInitializedRef.current,
      isInitializing: isInitializingRef.current,
    });
    if (isInitializedRef.current || isInitializingRef.current) {
      console.log(
        '[FaceDetection] Skipping initialization - already initialized or initializing',
      );
      return;
    }

    try {
      console.log('[FaceDetection] Starting MediaPipe initialization...');
      isInitializingRef.current = true;
      setError(null);

      // Update status to show loading
      setStatus({
        face: {
          status: 'checking',
          message: 'Loading face detection model...',
        },
        lighting: {
          status: 'checking',
          message: 'Loading face detection model...',
        },
        angle: {
          status: 'checking',
          message: 'Loading face detection model...',
        },
        distance: {
          status: 'checking',
          message: 'Loading face detection model...',
        },
      });

      console.log('[FaceDetection] Loading vision fileset from CDN...');
      const vision = await FilesetResolver.forVisionTasks(
        MEDIAPIPE_CONFIG.cdnUrl,
      );
      console.log('[FaceDetection] Vision fileset loaded');

      console.log('[FaceDetection] Creating FaceLandmarker with options:', {
        numFaces: config.numFaces,
        minFaceDetectionConfidence: config.minFaceDetectionConfidence,
        minTrackingConfidence: config.minTrackingConfidence,
      });
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MEDIAPIPE_CONFIG.modelUrl,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: config.numFaces,
        minFaceDetectionConfidence: config.minFaceDetectionConfidence,
        minTrackingConfidence: config.minTrackingConfidence,
      });

      faceLandmarkerRef.current = landmarker;
      isInitializedRef.current = true;
      isInitializingRef.current = false;
      setIsInitialized(true);
      console.log('[FaceDetection] MediaPipe initialized successfully!');
    } catch (err) {
      console.error('Failed to initialize MediaPipe:', err);
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to initialize face detection'),
      );
      isInitializingRef.current = false;
    }
  }, [
    config.numFaces,
    config.minFaceDetectionConfidence,
    config.minTrackingConfidence,
  ]);

  /**
   * Process face detection results
   */
  const processDetection = useCallback(
    (results: FaceLandmarkerResult, video: HTMLVideoElement) => {
      const analysis = analyzeFaceQuality(results, video);
      // Skip update if video not ready (null return)
      if (analysis) {
        setMetrics(analysis.metrics);
        setStatus(analysis.status);
      }
    },
    [],
  );

  /**
   * Main detection loop - runs at full frame rate for real-time detection
   */
  const detectFace = useCallback(() => {
    // Check prerequisites
    if (
      !faceLandmarkerRef.current ||
      !videoElement ||
      videoElement.readyState < 2
    ) {
      return;
    }

    // Ensure video has valid dimensions
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      animationFrameRef.current = requestAnimationFrame(detectFace);
      return;
    }

    const now = performance.now();

    try {
      const results = faceLandmarkerRef.current.detectForVideo(
        videoElement,
        now,
      );
      processDetection(results, videoElement);
    } catch (err) {
      // Don't spam errors for expected cases (e.g., video still loading)
      if (err instanceof Error && !err.message.includes('ROI')) {
        console.error('Face detection error:', err);
      }
    }

    animationFrameRef.current = requestAnimationFrame(detectFace);
  }, [videoElement, processDetection]);

  /**
   * Initialize MediaPipe when video element is ready
   */
  useEffect(() => {
    if (!videoElement) return;

    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const handleVideoReady = () => {
      if (mounted && !isInitializedRef.current && !isInitializingRef.current) {
        console.log('[FaceDetection] Video ready, waiting to initialize...');
        // Wait a bit for video to stabilize before loading model
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.log('[FaceDetection] Calling initialize from video ready');
            initialize();
          }
        }, 100);
      }
    };

    console.log(
      '[FaceDetection] Video element detected, readyState:',
      videoElement.readyState,
    );

    // Check if video is already ready
    if (videoElement.readyState >= 2) {
      console.log('[FaceDetection] Video already ready, initializing...');
      handleVideoReady();
    } else {
      // Listen for when video becomes ready
      console.log('[FaceDetection] Waiting for video to be ready...');
      videoElement.addEventListener('loadeddata', handleVideoReady);
      videoElement.addEventListener('canplay', handleVideoReady);
    }

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      videoElement.removeEventListener('loadeddata', handleVideoReady);
      videoElement.removeEventListener('canplay', handleVideoReady);
    };
  }, [videoElement]);

  /**
   * Start/stop detection loop when video element changes
   */
  useEffect(() => {
    if (isInitialized && videoElement) {
      detectFace();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isInitialized, videoElement, detectFace]);

  /**
   * Cleanup MediaPipe on unmount only
   */
  useEffect(() => {
    return () => {
      if (faceLandmarkerRef.current) {
        console.log('[FaceDetection] Closing MediaPipe on unmount');
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
    };
  }, []);

  return {
    isInitialized,
    error,
    metrics,
    status,
  };
}
