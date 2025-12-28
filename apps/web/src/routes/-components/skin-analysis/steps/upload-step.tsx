import {
  CameraIcon as Camera,
  CheckCircleIcon as CheckCircle,
  LockIcon,
  ScanIcon as Scan,
  SmileyIcon as Smiley,
  SunIcon as Sun,
  UploadIcon as Upload,
  WarningIcon as Warning,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { Button } from '@repo/ui/components/button';
import {
  FocusCard,
  FocusCardContent,
  FocusCardFooter,
} from '@repo/ui/components/focus-card';
import { Form } from '@repo/ui/components/form';
import SingleUploader from '@repo/ui/components/single-uploader';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { toast } from 'sonner';
import { CameraCapture } from '../components';
import { uploadStepSchema, type UploadStepData } from '../schemas';
import {
  validateUploadedImage,
  type ImageValidationResult,
} from '../utils/validate-image';

interface UploadStepProps {
  initialData?: UploadStepData;
  onNext: (data: UploadStepData) => void;
}

/**
 * Helper function to extract File object from various input types
 * Handles: File, FileWithPreview, or any object with a .file property
 */
function extractFileFromInput(input: any): File | null {
  if (!input) return null;

  // Direct File object
  if (input instanceof File) {
    return input;
  }

  // FileWithPreview object with nested File
  if (input.file instanceof File) {
    return input.file;
  }

  // FileWithPreview with FileMetadata (shouldn't happen for new uploads)
  if (input.file && typeof input.file === 'object' && input.file.name) {
    console.warn(
      'FileMetadata detected, cannot validate. Skipping validation.',
    );
    return null;
  }

  return null;
}

export function UploadStep({ initialData, onNext }: UploadStepProps) {
  const [captureMode, setCaptureMode] = useState<'upload' | 'camera'>('camera');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ImageValidationResult | null>(null);

  const form = useForm({
    defaultValues: {
      images: initialData?.images || [],
    } as UploadStepData,
    validators: {
      onChange: uploadStepSchema,
    },
    onSubmit: async ({ value }) => {
      // For camera mode, validation already happened during capture
      // For upload mode, validate the uploaded image
      if (captureMode === 'upload') {
        const hasImages = value.images && value.images.length > 0;

        if (!hasImages) {
          toast.error('Please upload at least one image');
          return;
        }

        setIsValidating(true);

        try {
          // Extract File object from the uploaded image
          const fileToValidate = extractFileFromInput(value.images[0]);

          if (!fileToValidate) {
            // If we can't extract a file, skip validation and proceed
            console.warn(
              'Unable to extract File object for validation. Proceeding without validation.',
            );
            setIsValidating(false);
            onNext(value);
            return;
          }

          // Validate the uploaded image
          const result = await validateUploadedImage(fileToValidate);
          setValidationResult(result);

          // Show validation feedback
          if (result.issues.length > 0) {
            toast.error('Image Quality Issues', {
              description: result.issues[0],
              icon: (
                <WarningCircleIcon weight="fill" className="text-red-500" />
              ),
            });
          } else if (result.warnings.length > 0) {
            toast.warning('Image Quality Warning', {
              description: result.warnings[0],
              icon: <Warning weight="fill" className="text-yellow-500" />,
            });
          }

          // Allow proceeding even with warnings, but not with critical issues
          if (result.issues.length === 0) {
            setIsValidating(false);
            onNext(value);
          }
        } catch (error) {
          console.error('Validation error:', error);
          setIsValidating(false);
          // If validation fails, allow user to proceed
          toast.warning(
            'Unable to validate image quality automatically. Proceeding...',
          );
          setTimeout(() => onNext(value), 1000);
        }
      } else {
        // Camera mode: validation already passed
        onNext(value);
      }
    },
  });

  const handleCameraCapture = (file: File) => {
    // Camera mode: face detection already validated during capture
    form.setFieldValue('images', [file]);
    setValidationResult({
      isValid: true,
      hasFace: true,
      faceCount: 1,
      brightness: 128, // Placeholder
      issues: [],
      warnings: [],
    });
    toast.success('Photo captured successfully! All quality checks passed.');
  };

  const handleCameraError = (error: Error) => {
    console.error('Camera capture error:', error);
    // Don't auto-switch to upload mode - let user decide
    toast.error('Camera Error', {
      description:
        error.message +
        ' Try the retry button or manually switch to upload mode.',
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Mode Selection */}
      <div className="flex justify-center gap-2 mb-6">
        <Button
          type="button"
          variant={captureMode === 'camera' ? 'default' : 'outline'}
          onClick={() => {
            setCaptureMode('camera');
            // Clear images when switching to camera mode
            form.setFieldValue('images', []);
            setValidationResult(null);
          }}
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" weight="fill" />
          Use Camera
        </Button>
        <Button
          type="button"
          variant={captureMode === 'upload' ? 'default' : 'outline'}
          onClick={() => {
            setCaptureMode('upload');
            // Clear images when switching to upload mode
            form.setFieldValue('images', []);
            setValidationResult(null);
          }}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" weight="fill" />
          Upload Photo
        </Button>
      </div>

      {/* Camera Mode Banner */}
      {captureMode === 'camera' && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 flex items-start gap-3">
          <CheckCircle
            weight="fill"
            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
          />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Real-time Quality Validation
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              Your photo will be automatically checked for face detection,
              lighting, angle, and distance. The capture button will only enable
              when all quality checks pass.
            </p>
          </div>
        </div>
      )}

      <Form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FocusCard>
          <FocusCardContent className="flex flex-col items-center justify-center min-h-[300px] p-8">
            <div className="w-full">
              <form.Field name="images">
                {(field) => (
                  <>
                    {captureMode === 'camera' ? (
                      <CameraCapture
                        key={`camera-${captureMode}`}
                        onCapture={(file) => {
                          handleCameraCapture(file);
                          field.handleChange([file] as any);
                        }}
                        onError={handleCameraError}
                      />
                    ) : (
                      <div className="space-y-4">
                        <SingleUploader
                          onFilesChange={(file) =>
                            field.handleChange(file as any)
                          }
                          maxSize={10 * 1024 * 1024}
                          initialFiles={field.state.value as any}
                        />
                        {field.state.value && field.state.value.length > 0 && (
                          <>
                            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-2">
                              <WarningCircleIcon
                                weight="fill"
                                className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
                              />
                              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                <strong>Note:</strong> Uploaded photos will be
                                validated for face detection and lighting
                                quality before proceeding. For best real-time
                                feedback, use camera mode.
                              </p>
                            </div>
                            {validationResult && (
                              <ValidationFeedback result={validationResult} />
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </form.Field>
            </div>
          </FocusCardContent>
          <FocusCardFooter>
            <div className="flex justify-center">
              <form.Subscribe
                selector={(state) => state.isValid && !state.isPristine}
                children={(canSubmit) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit || isValidating}
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    {isValidating ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Validating...
                      </>
                    ) : (
                      'Next Step'
                    )}
                  </Button>
                )}
              />
            </div>
          </FocusCardFooter>
        </FocusCard>
      </Form>

      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
        <LockIcon weight="fill" className="w-4 h-4" />
        <p>
          Your photo is securely processed and automatically deleted after
          analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
        <InfoCard
          icon={<Sun className="w-8 h-8 text-primary" />}
          title="Good Lighting"
          description={
            captureMode === 'camera'
              ? 'Real-time lighting check ensures optimal brightness.'
              : 'Take photo in natural light, avoid backlight.'
          }
          badge={captureMode === 'camera' ? 'Auto-detected' : undefined}
        />
        <InfoCard
          icon={<Smiley className="w-8 h-8 text-primary" />}
          title="Bare Face"
          description="No makeup for most accurate AI analysis."
        />
        <InfoCard
          icon={<Scan className="w-8 h-8 text-primary" />}
          title="Front Angle"
          description={
            captureMode === 'camera'
              ? 'System verifies your face is straight and centered.'
              : 'Keep face straight, not obscured by hair.'
          }
          badge={captureMode === 'camera' ? 'Auto-detected' : undefined}
        />
      </div>
    </div>
  );
}

function ValidationFeedback({ result }: { result: ImageValidationResult }) {
  if (!result.hasFace && result.faceCount === 0) {
    return null; // Don't show until validation completes
  }

  const hasIssues = result.issues.length > 0;
  const hasWarnings = result.warnings.length > 0;

  if (!hasIssues && !hasWarnings && result.isValid) {
    return (
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-start gap-2">
        <CheckCircle
          weight="fill"
          className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
        />
        <div className="text-xs text-green-700 dark:text-green-300">
          <p className="font-medium mb-1">Image Quality: Good ✓</p>
          <ul className="space-y-0.5">
            <li>✓ Face detected</li>
            <li>✓ Lighting quality acceptable</li>
          </ul>
        </div>
      </div>
    );
  }

  if (hasIssues) {
    return (
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
        <WarningCircleIcon
          weight="fill"
          className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
        />
        <div className="text-xs text-red-700 dark:text-red-300">
          <p className="font-medium mb-1">Image Quality Issues:</p>
          <ul className="space-y-0.5 list-disc list-inside">
            {result.issues.map((issue, index) => (
              <li key={index}>{issue}</li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] opacity-80">
            You can still proceed, but analysis accuracy may be affected.
          </p>
        </div>
      </div>
    );
  }

  if (hasWarnings) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-2">
        <Warning
          weight="fill"
          className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
        />
        <div className="text-xs text-yellow-700 dark:text-yellow-300">
          <p className="font-medium mb-1">Image Quality Warnings:</p>
          <ul className="space-y-0.5 list-disc list-inside">
            {result.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return null;
}

function InfoCard({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 flex flex-col items-center text-center border relative">
      {badge && (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
            <CheckCircle weight="fill" className="w-3 h-3" />
            {badge}
          </span>
        </div>
      )}
      <div className="mb-4 p-3 bg-primary/10 rounded-full">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
