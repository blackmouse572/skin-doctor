import { relations } from 'drizzle-orm';
import { pgTable } from 'drizzle-orm/pg-core';
import * as v from 'valibot';
import { user } from './auth';

export const skinAnalysis = pgTable('skin_analysis', (t) => ({
  id: t
    .bigint('id', { mode: 'number' })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  userId: t
    .text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),

  // Image URLs stored in cloud storage
  imageUrls: t.jsonb('image_urls').$type<string[]>().notNull(),

  // User inputs from form
  symptoms: t.text('symptoms'),
  description: t.text('description').notNull(),
  morningRoutine: t.text('morning_routine'),
  eveningRoutine: t.text('evening_routine'),

  // AI Analysis Results
  analysisResult: t.jsonb('analysis_result').$type<{
    skin: {
      healthPoint: number;
      moistureLevel: number;
      skinAge: number;
      skinType: string;
    };
    concerns: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      recommendations: string[];
      points: number;
    }>;
  }>(),

  // Processing status
  status: t
    .text('status', {
      enum: ['pending', 'processing', 'completed', 'failed'],
    })
    .notNull()
    .default('pending'),

  // Error message if processing fails
  errorMessage: t.text('error_message'),

  // Timestamps
  createdAt: t
    .timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: t
    .timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}));

export const skinAnalysisRelations = relations(skinAnalysis, ({ one }) => ({
  user: one(user, {
    fields: [skinAnalysis.userId],
    references: [user.id],
  }),
}));

// Valibot schemas for validation
export const CreateSkinAnalysisSchema = v.object({
  images: v.pipe(
    v.array(v.any()),
    v.minLength(1, 'Please upload at least one image'),
  ),
  symptoms: v.optional(v.string()),
  description: v.pipe(
    v.string(),
    v.minLength(
      10,
      'Please provide a detailed description (at least 10 characters)',
    ),
    v.maxLength(5000, 'Description must not exceed 5000 characters'),
  ),
  duration: v.optional(v.string()),
  currentRoutine: v.optional(v.string()),
  morningRoutine: v.optional(v.string()),
  eveningRoutine: v.optional(v.string()),
});

export const SkinAnalysisResponseSchema = v.object({
  message: v.string(),
  data: v.object({
    analysisId: v.number(),
    summary: v.object({
      images: v.array(v.string()),
      skin: v.object({
        healthPoint: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
        moistureLevel: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
        skinAge: v.number(),
        skinType: v.string(),
      }),
      concerns: v.array(
        v.object({
          type: v.string(),
          severity: v.picklist(['low', 'medium', 'high']),
          description: v.string(),
          recommendations: v.array(v.string()),
          points: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
        }),
      ),
    }),
  }),
});

export type SkinAnalysis = typeof skinAnalysis.$inferSelect;
export type CreateSkinAnalysis = typeof skinAnalysis.$inferInsert;
