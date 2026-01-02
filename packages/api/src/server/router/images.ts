import { eq } from '@repo/db';
import { skinAnalysis } from '@repo/db/schema';
import { protectedProcedure } from '../orpc';

const imagesRouter = {
  getSignedUrl: protectedProcedure.images.getSignedUrl.handler(
    async ({ context, input, errors }) => {
      // Verify the image belongs to the user by checking if it's in their skin analysis
      const analyses = await context.db
        .select()
        .from(skinAnalysis)
        .where(eq(skinAnalysis.userId, context.session.user.id));

      // Check if the publicId exists in any of the user's analyses
      const userOwnsImage = analyses.some((a) =>
        a.imageUrls.includes(input.publicId),
      );

      if (!userOwnsImage) {
        throw errors.FORBIDDEN({
          message: 'You do not have permission to access this image',
        });
      }

      try {
        // Generate a signed URL with 1 hour expiration
        const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

        const signedUrl = context.cloud.url(input.publicId, {
          secure: true,
          sign_url: true,
        });

        return {
          url: signedUrl,
          expiresAt,
        };
      } catch (error) {
        console.error('Error generating signed URL:', {
          publicId: input.publicId,
          message: error instanceof Error ? error.message : String(error),
        });

        throw errors.NOT_FOUND({
          message: 'Failed to generate signed URL for image',
          data: {
            publicId: input.publicId,
          },
        });
      }
    },
  ),
};

export default imagesRouter;
