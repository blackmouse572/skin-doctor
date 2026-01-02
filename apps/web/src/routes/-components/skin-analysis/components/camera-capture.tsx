import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  CameraSlash,
  CheckCircle,
  WarningCircleIcon,
  ArrowClockwise,
  CircleNotchIcon as Loader2,
  CaretDown,
} from '@phosphor-icons/react';
import { Button } from '@repo/ui/components/button';
import { useFaceDetection } from '../../../../hooks/use-face-detection';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

interface MediaDeviceInfo {
  deviceId: string;
  label: string;
}

export function CameraCapture({
  onCapture,
  onError,
  disabled,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const [cameraError, setCameraError] = useState<{
    message: string;
    code?: string;
  } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);

  const {
    isInitialized,
    error: detectionError,
    metrics,
    status,
  } = useFaceDetection(videoRef.current);

  // Enumerate available camera devices
  const enumerateDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices
        .filter((device) => device.kind === 'videoinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
        }));
      setDevices(videoDevices);

      // Auto-select first device if none selected
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0]!.deviceId);
      }
    } catch (err) {
      console.error('Failed to enumerate devices:', err);
    }
  }, [selectedDeviceId]);

  // Start camera with selected device
  const startCamera = useCallback(
    async (deviceId?: string) => {
      try {
        setIsLoadingCamera(true);
        setCameraError(null);

        // Stop any existing stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? {
                deviceId: { exact: deviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }
            : {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user',
              },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setIsLoadingCamera(false);

        // Enumerate devices after successful access (labels will be available)
        await enumerateDevices();
      } catch (err: any) {
        console.error('Camera access error:', err);

        let errorMessage = 'Failed to access camera';
        let errorCode = err.name || 'Unknown';

        switch (err.name) {
          case 'NotFoundError':
            errorMessage =
              'No camera device found. Please connect a camera and try again.';
            break;
          case 'NotAllowedError':
            errorMessage =
              'Camera access denied. Please allow camera access in your browser settings.';
            break;
          case 'NotReadableError':
            errorMessage =
              'Camera is already in use by another application. Please close other apps using the camera.';
            break;
          case 'OverconstrainedError':
            errorMessage =
              'Selected camera device is not compatible. Try selecting a different camera.';
            break;
          case 'TypeError':
            errorMessage = 'Camera configuration error. Please try again.';
            break;
          default:
            errorMessage = err.message || 'Unable to access camera';
        }

        setCameraError({ message: errorMessage, code: errorCode });
        setIsLoadingCamera(false);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    },
    [onError, enumerateDevices],
  );

  // Initialize camera on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (mounted) {
        await startCamera();
      }
    };

    init();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - startCamera is stable enough

  // Handle device selection
  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setShowDeviceSelector(false);
    await startCamera(deviceId);
  };

  // Handle retry
  const handleRetry = async () => {
    await startCamera(selectedDeviceId || undefined);
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !metrics.allChecksPass)
      return;

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to capture image'));
            }
          },
          'image/jpeg',
          0.95,
        );
      });

      // Create file from blob
      const file = new File([blob], `skin-photo-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      onCapture(file);
    } catch (err) {
      console.error('Capture error:', err);
      onError?.(
        err instanceof Error ? err : new Error('Failed to capture photo'),
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const allChecksPass = metrics.allChecksPass;
  const hasWarnings =
    status.face.status === 'warning' ||
    status.lighting.status === 'warning' ||
    status.angle.status === 'warning' ||
    status.distance.status === 'warning';

  // Show loading state only if camera is still loading and no error
  if (isLoadingCamera && !cameraError && !videoRef.current?.srcObject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-muted/30 rounded-xl border">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Starting camera...</p>
      </div>
    );
  }

  // Show camera error with retry option
  if (cameraError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-muted/30 rounded-xl border">
        <CameraSlash
          className="w-16 h-16 text-muted-foreground mb-4"
          weight="fill"
        />
        <h3 className="font-semibold mb-2 text-center">Camera Access Error</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
          {cameraError.message}
        </p>

        {cameraError.code && (
          <p className="text-xs text-muted-foreground mb-4">
            Error Code: {cameraError.code}
          </p>
        )}

        <div className="flex flex-col gap-2 w-full max-w-xs">
          <Button onClick={handleRetry} className="w-full">
            <ArrowClockwise className="w-4 h-4 mr-2" />
            Retry Camera Access
          </Button>

          {devices.length > 1 && (
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowDeviceSelector(!showDeviceSelector)}
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                Select Different Camera
                <CaretDown className="w-4 h-4 ml-auto" />
              </Button>

              {showDeviceSelector && (
                <div className="absolute top-full mt-1 w-full bg-popover border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {devices.map((device) => (
                    <button
                      key={device.deviceId}
                      onClick={() => handleDeviceChange(device.deviceId)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                    >
                      {device.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg max-w-md">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Troubleshooting Tips:</strong>
          </p>
          <ul className="text-xs text-blue-600 dark:text-blue-400 mt-2 space-y-1 list-disc list-inside">
            <li>Check if your camera is connected</li>
            <li>Close other apps using the camera</li>
            <li>Allow camera access in browser settings</li>
            <li>Try refreshing the page</li>
          </ul>
        </div>
      </div>
    );
  }

  // Show detection initialization error
  if (detectionError && !isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-muted/30 rounded-xl border">
        <WarningCircleIcon
          className="w-16 h-16 text-yellow-500 mb-4"
          weight="fill"
        />
        <h3 className="font-semibold mb-2">Quality Check Unavailable</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
          Real-time quality checks couldn't load. You can still capture your
          photo, but quality validation won't be available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Camera Device Selector */}
      {devices.length > 1 && (
        <div className="flex justify-end">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeviceSelector(!showDeviceSelector)}
              className="text-xs"
            >
              <Camera className="w-3 h-3 mr-1" />
              Camera
              <CaretDown className="w-3 h-3 ml-1" />
            </Button>

            {showDeviceSelector && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-popover border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                {devices.map((device) => (
                  <button
                    key={device.deviceId}
                    onClick={() => handleDeviceChange(device.deviceId)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors ${
                      device.deviceId === selectedDeviceId
                        ? 'bg-accent font-medium'
                        : ''
                    }`}
                  >
                    {device.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Preview */}
      <div
        className="relative rounded-xl overflow-hidden border-2 transition-colors duration-300"
        style={{
          borderColor: allChecksPass
            ? 'rgb(34, 197, 94)'
            : hasWarnings
              ? 'rgb(234, 179, 8)'
              : 'rgb(239, 68, 68)',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto bg-black"
          style={{ transform: 'scaleX(-1)' }} // Mirror effect
        />

        {/* Status Overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 space-y-2">
            {!isInitialized ? (
              <div className="flex items-center gap-2 text-white text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {status.face.message === 'Waiting for camera...'
                    ? 'Camera ready - Loading AI model...'
                    : status.face.message}
                </span>
              </div>
            ) : (
              <>
                <StatusIndicator
                  status={status.face.status}
                  message={status.face.message}
                />
                <StatusIndicator
                  status={status.lighting.status}
                  message={status.lighting.message}
                />
                <StatusIndicator
                  status={status.angle.status}
                  message={status.angle.message}
                />
                <StatusIndicator
                  status={status.distance.status}
                  message={status.distance.message}
                />
              </>
            )}
          </div>
        </div>

        {/* Ready Indicator */}
        {allChecksPass && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
              <CheckCircle weight="fill" className="w-5 h-5" />
              <span className="font-medium">Ready to capture!</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Capture Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleCapture}
          disabled={disabled || !allChecksPass || isCapturing}
          size="lg"
          className="min-w-[200px]"
        >
          {isCapturing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Capturing...
            </>
          ) : allChecksPass ? (
            <>
              <Camera weight="fill" className="w-5 h-5" />
              Capture Photo
            </>
          ) : (
            <>
              <WarningCircleIcon weight="fill" className="w-5 h-5" />
              Adjust Position
            </>
          )}
        </Button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-center text-muted-foreground">
        {allChecksPass
          ? 'All quality checks passed. Click to capture your photo.'
          : 'Follow the guidance above to improve photo quality.'}
      </p>
    </div>
  );
}

interface StatusIndicatorProps {
  status: 'checking' | 'perfect' | 'warning' | 'error';
  message: string;
}

function StatusIndicator({ status, message }: StatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'perfect':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'perfect':
        return <CheckCircle weight="fill" className="w-4 h-4" />;
      case 'warning':
        return <WarningCircleIcon weight="fill" className="w-4 h-4" />;
      case 'error':
        return <WarningCircleIcon weight="fill" className="w-4 h-4" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  if (status === 'perfect' || status === 'checking') {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{message}</span>
    </div>
  );
}
