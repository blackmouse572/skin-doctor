import * as v from 'valibot';

export const uploadStepSchema = v.object({
  images: v.pipe(
    v.array(v.any()),
    v.minLength(1, 'Please upload at least one image'),
  ),
});

export const fillInfoStepSchema = v.object({
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
});

export const routineImprovementStepSchema = v.object({
  morningRoutine: v.pipe(
    v.string(),
    v.minLength(10, 'Morning routine must be at least 10 characters'),
    v.maxLength(2000, 'Morning routine must not exceed 2000 characters'),
  ),
  eveningRoutine: v.pipe(
    v.string(),
    v.minLength(10, 'Evening routine must be at least 10 characters'),
    v.maxLength(2000, 'Evening routine must not exceed 2000 characters'),
  ),
});

// Custom validation: at least one routine must have 30+ chars if not skipped

export type UploadStepData = v.InferOutput<typeof uploadStepSchema>;
export type FillInfoStepData = v.InferOutput<typeof fillInfoStepSchema>;
export type RoutineImprovementStepData = v.InferOutput<
  typeof routineImprovementStepSchema
>;

export interface SkinAnalysisData {
  upload: UploadStepData;
  fillInfo: FillInfoStepData;
  routineImprovement?: RoutineImprovementStepData;
}
