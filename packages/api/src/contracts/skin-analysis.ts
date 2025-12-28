import { oc } from '@orpc/contract';
import {
  CreateSkinAnalysisSchema,
  SkinAnalysisResponseSchema,
} from '@repo/db/schema';
import * as v from 'valibot';

const skinAnalysisContract = oc
  .prefix('/skin-analysis')
  .tag('skin-analysis')
  .router({
    create: oc
      .route({
        method: 'POST',
        path: '/',
        summary: 'Create a new skin analysis',
        description: 'Upload skin images and information for AI analysis',
      })
      .input(CreateSkinAnalysisSchema)
      .output(SkinAnalysisResponseSchema),

    get: oc
      .route({
        method: 'GET',
        path: '/{id}',
        summary: 'Retrieve a skin analysis',
        description: 'Get the details and results of a skin analysis by ID',
      })
      .errors({
        NOT_FOUND: {
          status: 404,
          message: 'Skin analysis not found',
          data: v.object({
            analysisId: v.string(),
          }),
        },
      })
      .input(v.object({ id: v.pipe(v.string(), v.uuid()) }))
      .output(
        v.object({
          id: v.string(),
          imageUrls: v.array(v.string()),
          description: v.string(),
          symptoms: v.nullable(v.string()),
          duration: v.nullable(v.string()),
          currentRoutine: v.nullable(v.string()),
          morningRoutine: v.nullable(v.string()),
          eveningRoutine: v.nullable(v.string()),
          status: v.picklist(['pending', 'processing', 'completed', 'failed']),
          analysisResult: v.nullable(
            v.object({
              skin: v.object({
                healthPoint: v.number(),
                moistureLevel: v.number(),
                skinAge: v.number(),
                skinType: v.string(),
              }),
              concerns: v.array(
                v.object({
                  type: v.string(),
                  severity: v.picklist(['low', 'medium', 'high']),
                  description: v.string(),
                  recommendations: v.array(v.string()),
                  points: v.number(),
                }),
              ),
            }),
          ),
          createdAt: v.string(),
          updatedAt: v.string(),
        }),
      ),

    list: oc
      .route({
        method: 'GET',
        path: '/',
        summary: 'List all skin analyses',
        description: 'Retrieve all skin analyses for the authenticated user',
      })
      .output(
        v.array(
          v.object({
            id: v.string(),
            imageUrls: v.array(v.string()),
            description: v.string(),
            status: v.picklist([
              'pending',
              'processing',
              'completed',
              'failed',
            ]),
            createdAt: v.string(),
          }),
        ),
      ),
  });

export default skinAnalysisContract;
