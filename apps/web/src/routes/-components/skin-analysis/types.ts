export interface SkinAnalysisFormData {
  images: File[];
  symptoms: string;
  description: string;
  duration: string;
  currentRoutine: string;
}

export const STEPS = [
  {
    step: 1,
    title: 'Upload',
  },
  {
    step: 2,
    title: 'Fill Info',
  },
  {
    step: 3,
    title: 'Analyze',
  },
  {
    step: 4,
    title: 'Result',
  },
];
