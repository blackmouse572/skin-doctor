import { oc } from '@orpc/contract';
import * as v from 'valibot';

const imagesContract = oc
  .prefix('/images')
  .tag('images')
  .router({
    getSignedUrl: oc
      .route({
        method: 'GET',
        path: '/{publicId}',
        summary: 'Get a signed URL for a private image',
        description: 'Generate a temporary signed URL to access a private image. URL expires after 1 hour.',
      })
      .errors({
        NOT_FOUND: {
          status: 404,
          message: 'Image not found or access denied',
          data: v.object({
            publicId: v.string(),
          }),
        },
        FORBIDDEN: {
          status: 403,
          message: 'You do not have permission to access this image',
        },
      })
      .input(
        v.object({
          publicId: v.string(),
        }),
      )
      .output(
        v.object({
          url: v.string(),
          expiresAt: v.number(),
        }),
      ),
  });

export default imagesContract;
