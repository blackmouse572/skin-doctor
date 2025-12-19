import { useState } from 'react';
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@repo/ui/components/stepper';
import { UploadStep } from './steps/upload-step';
import { FillInfoStep } from './steps/fill-info-step';
import { AnalyzeStep } from './steps/analyze-step';
import {
  type UploadStepData,
  type FillInfoStepData,
  type SkinAnalysisData,
} from './schemas';

const STEPS = [
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

export function SkinAnalysisWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadData, setUploadData] = useState<UploadStepData | null>(null);
  const [fillInfoData, setFillInfoData] = useState<FillInfoStepData | null>(
    null,
  );

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleUploadNext = (data: UploadStepData) => {
    setUploadData(data);
    nextStep();
  };

  const handleFillInfoNext = (data: FillInfoStepData) => {
    setFillInfoData(data);
    nextStep();
  };

  const handleSubmit = () => {
    if (uploadData && fillInfoData) {
      const completeData: SkinAnalysisData = {
        upload: uploadData,
        fillInfo: fillInfoData,
      };
      console.log('Submitting', completeData);
      // Handle final submission
      nextStep(); // Go to Result
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-4xl mb-12">
        <Stepper value={currentStep}>
          {STEPS.map(({ step, title }) => (
            <StepperItem
              className="not-last:flex-1 max-md:items-start"
              key={step}
              step={step}
            >
              <StepperTrigger className="rounded max-md:flex-col cursor-default">
                <StepperIndicator className="bg-background/75" />
                <div className="text-center md:text-left">
                  <StepperTitle>{title}</StepperTitle>
                </div>
              </StepperTrigger>
              {step < STEPS.length && (
                <StepperSeparator className="max-md:mt-3.5 md:mx-4 bg-border" />
              )}
            </StepperItem>
          ))}
        </Stepper>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
          {currentStep === 1 && "Let's start analyzing your skin"}
          {currentStep === 2 && 'Tell us about your condition'}
          {currentStep === 3 && 'Ready for analysis'}
          {currentStep === 4 && 'Your Skin Analysis Result'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {currentStep === 1 &&
            'Upload a clear portrait photo to receive a personalized skincare routine from AI.'}
          {currentStep === 2 &&
            'Provide more details to help our AI understand your skin better.'}
          {currentStep === 3 &&
            'Review your information and start the AI analysis.'}
        </p>
      </div>

      <div className="w-full flex justify-center">
        {currentStep === 1 && (
          <UploadStep
            initialData={uploadData || undefined}
            onNext={handleUploadNext}
          />
        )}
        {currentStep === 2 && (
          <FillInfoStep
            initialData={fillInfoData || undefined}
            onNext={handleFillInfoNext}
            onPrev={prevStep}
          />
        )}
        {currentStep === 3 && uploadData && fillInfoData && (
          <AnalyzeStep
            data={{ upload: uploadData, fillInfo: fillInfoData }}
            onPrev={prevStep}
            onSubmit={handleSubmit}
          />
        )}
        {currentStep === 4 && (
          <div className="w-full max-w-3xl">
            <div className="bg-card text-card-foreground rounded-xl p-8 text-center border">
              <h2 className="text-2xl font-bold mb-4">Analysis Complete!</h2>
              <p className="text-muted-foreground">
                Your skin analysis results will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
