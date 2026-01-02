'use client';

import { LockIcon } from '@phosphor-icons/react/dist/ssr';
import { Card } from '@repo/ui/components/card';
import { useMemo, useEffect } from 'react';
import { apiClient } from '../../../../clients/apiClient';
import { useSuspenseQuery } from '@tanstack/react-query';

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
  const urlQuery = useSuspenseQuery(
    apiClient.images.getSignedUrl.queryOptions({
      input: {
        publicId:
          typeof uploadedImage === 'object' && 'preview' in uploadedImage
            ? uploadedImage.preview || ''
            : '',
      },
      enabled:
        !!uploadedImage &&
        !(typeof uploadedImage === 'object' && 'preview' in uploadedImage),
    }),
  );

  // Check if this is a public ID (from Cloudinary) or a local file
  const imageUrl = useMemo(() => {
    if (!uploadedImage) return null;

    if (typeof uploadedImage === 'object' && 'preview' in uploadedImage) {
      return urlQuery.data.url;
    }

    if (typeof uploadedImage === 'object' && uploadedImage instanceof File) {
      return URL.createObjectURL(uploadedImage);
    }

    return null;
  }, [uploadedImage, urlQuery.data]);

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="relative aspect-3/4 w-full overflow-hidden rounded-2xl border bg-muted shadow-sm space-y-0 py-0">
        <img
          src={imageUrl ?? ''}
          alt="Uploaded skin"
          className="h-full w-full object-cover"
        />

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
