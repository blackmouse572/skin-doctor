import { eq } from '@repo/db';
import { skinAnalysis } from '@repo/db/schema';
import { protectedProcedure } from '../orpc';

const skinAnalysisRouter = {
  create: protectedProcedure.skinAnalysis.create.handler(
    async ({ context, input }) => {
      console.log('create-skin-analysis');
      // TODO: Upload images to cloud storage and get URLs
      // For now, we'll use placeholder URLs
      const imageUrls = input.images.map(
        (_, index) => `https://placeholder.com/image-${index}.jpg`,
      );

      console.log('image urls', imageUrls);

      // Insert the analysis record into the database
      const [analysis] = await context.db
        .insert(skinAnalysis)
        .values({
          userId: context.session.user.id,
          imageUrls,
          symptoms: input.symptoms,
          description: input.description,
          duration: input.duration,
          currentRoutine: input.currentRoutine,
          morningRoutine: input.morningRoutine,
          eveningRoutine: input.eveningRoutine,
          status: 'pending',
        })
        .returning()
        .catch((error) => {
          console.error('Error inserting skin analysis:', error);
          throw error;
        });
      console.log('Analyusis', analysis);

      if (!analysis) {
        throw new Error('Failed to create skin analysis');
      }

      // TODO: Trigger AI analysis job asynchronously
      // For now, we'll return mock data
      const mockAnalysisResult = {
        skin: {
          healthPoint: 75,
          moistureLevel: 65,
          skinAge: 28,
          skinType: 'Combination',
        },
        concerns: [
          {
            type: 'Acne',
            severity: 'medium' as const,
            description: 'Some acne spots detected on the T-zone area.',
            recommendations: [
              'Use a gentle cleanser twice daily',
              'Apply salicylic acid treatment',
              'Avoid touching your face',
            ],
            points: 70,
          },
          {
            type: 'Dryness',
            severity: 'low' as const,
            description: 'Minor dry patches detected on cheek areas.',
            recommendations: [
              'Use a hydrating moisturizer',
              'Drink more water',
              'Use a humidifier',
            ],
            points: 85,
          },
        ],
      };

      // Update the analysis with mock results
      await context.db
        .update(skinAnalysis)
        .set({
          analysisResult: mockAnalysisResult,
          status: 'completed',
        })
        .where(eq(skinAnalysis.id, analysis.id));

      console.log('Updated analysis with mock results');

      return {
        message: 'Skin analysis created successfully',
        data: {
          analysisId: analysis.id,
          summary: {
            images: imageUrls,
            ...mockAnalysisResult,
          },
        },
      };
    },
  ),

  get: protectedProcedure.skinAnalysis.get.handler(
    async ({ context, input, errors }) => {
      const [analysis] = await context.db
        .select()
        .from(skinAnalysis)
        .where(eq(skinAnalysis.id, input.id));

      if (!analysis || analysis.userId !== context.session.user.id) {
        throw errors.NOT_FOUND({
          message: `No such skin analysis with ID ${input.id}`,
          data: {
            analysisId: input.id,
          },
        });
      }

      return {
        id: analysis.id,
        imageUrls: analysis.imageUrls,
        description: analysis.description,
        symptoms: analysis.symptoms,
        duration: analysis.duration,
        currentRoutine: analysis.currentRoutine,
        morningRoutine: analysis.morningRoutine,
        eveningRoutine: analysis.eveningRoutine,
        status: analysis.status,
        analysisResult: analysis.analysisResult,
        createdAt: analysis.createdAt.toISOString(),
        updatedAt: analysis.updatedAt.toISOString(),
      };
    },
  ),

  list: protectedProcedure.skinAnalysis.list.handler(async ({ context }) => {
    const analyses = await context.db
      .select({
        id: skinAnalysis.id,
        imageUrls: skinAnalysis.imageUrls,
        description: skinAnalysis.description,
        status: skinAnalysis.status,
        createdAt: skinAnalysis.createdAt,
      })
      .from(skinAnalysis)
      .where(eq(skinAnalysis.userId, context.session.user.id));

    return analyses.map((analysis) => ({
      id: analysis.id,
      imageUrls: analysis.imageUrls,
      description: analysis.description,
      status: analysis.status,
      createdAt: analysis.createdAt.toISOString(),
    }));
  }),
};

export default skinAnalysisRouter;
