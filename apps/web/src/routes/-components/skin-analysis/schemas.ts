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

export const routineImprovementStepSchema = v.pipe(
  v.object({
    morningRoutine: v.optional(v.string(), ''),
    eveningRoutine: v.optional(v.string(), ''),
    routineSkipped: v.optional(v.boolean(), false),
  }),
  v.check((data) => {
    if (data.routineSkipped) return true;
    const morningLength = data.morningRoutine?.length || 0;
    const eveningLength = data.eveningRoutine?.length || 0;
    return morningLength + eveningLength >= 30;
  }, 'Please provide at least 30 characters total across morning and evening routines, or skip this step.'),
);

// Custom validation: at least one routine must have 30+ chars if not skipped
export const validateRoutineImprovement = (
  data: v.InferOutput<typeof routineImprovementStepSchema>,
): boolean => {
  if (data.routineSkipped) return true;
  const morningLength = data.morningRoutine?.length || 0;
  const eveningLength = data.eveningRoutine?.length || 0;
  return morningLength + eveningLength >= 30;
};

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
