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
  ),
  duration: v.optional(v.string()),
  currentRoutine: v.optional(v.string()),
});

export type UploadStepData = v.InferOutput<typeof uploadStepSchema>;
export type FillInfoStepData = v.InferOutput<typeof fillInfoStepSchema>;

export interface SkinAnalysisData {
  upload: UploadStepData;
  fillInfo: FillInfoStepData;
}
