'use client';

import { LockIcon } from '@phosphor-icons/react/dist/ssr';
import { Card } from '@repo/ui/components/card';
import { useMemo } from 'react';

interface UploadedImageProps {
  uploadedImage?: File | { preview?: string };
  showPrivacyMessage?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function UploadedImage({
  uploadedImage,
  showPrivacyMessage = true,
  className = '',
  children,
}: UploadedImageProps) {
  const imageUrl = useMemo(() => {
    if (!uploadedImage) return null;
    const fileWithPreview = uploadedImage as File & { preview?: string };
    if (
      fileWithPreview.preview &&
      typeof fileWithPreview.preview === 'string'
    ) {
      return fileWithPreview.preview;
    }
    if (uploadedImage instanceof File) {
      return URL.createObjectURL(uploadedImage);
    }
    return null;
  }, [uploadedImage]);

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="relative aspect-3/4 w-full overflow-hidden rounded-2xl border bg-muted shadow-sm space-y-0 py-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Uploaded skin"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <p className="text-muted-foreground">No image uploaded</p>
          </div>
        )}

        {children && (
          <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white/80 font-medium pointer-events-auto items-center">
            {children}
          </div>
        )}
      </Card>

      {showPrivacyMessage && (
        <Card className="rounded-2xl lg:px-8 border border-ui-tag-green-border bg-ui-tag-green-bg gap-0 border-squircle-lg">
          <div className="inline-flex items-center gap-2 self-start">
            <LockIcon
              weight="duotone"
              className="text-ui-tag-green-icon"
              size="24"
            />
            <h3 className="text-lg font-semibold text-emerald-600">
              We secure your privacy
            </h3>
          </div>
          <p className="text-sm text-ui-tag-green-text">
            Your photo and data are encrypted and stored securely. We use them
            solely for analysis and do not share with third parties.
          </p>
        </Card>
      )}
    </div>
  );
}
