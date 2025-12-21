'use client';

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
import { RoutineImprovementStep } from './steps/routine-improvement-step';
import {
  SkinAnalysisWizardProvider,
  useSkinAnalysisWizard,
} from './wizard-context';

function SkinAnalysisWizardContent() {
  const {
    currentStep,
    steps,
    includesRoutineStep,
    uploadData,
    fillInfoData,
    routineData,
    nextStep,
    prevStep,
    setUploadData,
    setFillInfoData,
    setRoutineData,
    enableRoutineStep,
    skipRoutineStep,
    skipToAnalyze,
    getCompleteData,
  } = useSkinAnalysisWizard();

  const handleUploadNext = (data: typeof uploadData) => {
    if (data) {
      setUploadData(data);
      nextStep();
    }
  };

  const handleFillInfoNext = (data: typeof fillInfoData) => {
    if (data) {
      setFillInfoData(data);
      nextStep();
    }
  };

  const handleRoutineNext = (data: typeof routineData) => {
    if (data) {
      setRoutineData(data);
      nextStep();
    }
  };

  const handleRoutineSkip = () => {
    skipRoutineStep();
    nextStep();
  };

  const handleImproveRoutine = (data: typeof fillInfoData) => {
    if (data) {
      setFillInfoData(data);
      enableRoutineStep();
      nextStep();
    }
  };

  const handleSkipToAnalyze = (data: typeof fillInfoData) => {
    if (data) {
      setFillInfoData(data);
      enableRoutineStep();
      skipToAnalyze();
    }
  };

  const handleSubmit = () => {
    const completeData = getCompleteData();
    if (completeData) {
      console.log('Submitting', completeData);
      // Handle final submission
      nextStep(); // Go to Result
    }
  };

  const getCurrentStepTitle = () => {
    const stepTitles: Record<
      number,
      { default: string; withRoutine?: string }
    > = {
      1: { default: "Let's start analyzing your skin" },
      2: { default: 'Tell us about your condition' },
      3: {
        default: 'Ready for analysis',
        withRoutine: 'Improve your routine',
      },
      4: {
        default: 'Your Skin Analysis Result',
        withRoutine: 'Ready for analysis',
      },
      5: { default: 'Your Skin Analysis Result' },
    };

    const config = stepTitles[currentStep];
    if (!config) return '';

    if (includesRoutineStep && config.withRoutine) {
      return config.withRoutine;
    }
    return config.default;
  };

  const getCurrentStepDescription = () => {
    const descriptions: Record<
      number,
      { default: string; withRoutine?: string }
    > = {
      1: {
        default:
          'Upload a clear portrait photo to receive a personalized skincare routine from AI.',
      },
      2: {
        default:
          'Provide more details to help our AI understand your skin better.',
      },
      3: {
        default: 'Review your information and start the AI analysis.',
        withRoutine:
          'Tell us about your current skincare routine to get personalized improvement suggestions.',
      },
      4: {
        default: '',
        withRoutine: 'Review your information and start the AI analysis.',
      },
      5: { default: '' },
    };

    const config = descriptions[currentStep];
    if (!config) return '';

    if (includesRoutineStep && config.withRoutine) {
      return config.withRoutine;
    }
    return config.default;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-4xl mb-12">
        <Stepper value={currentStep}>
          {steps.map(({ step, title }) => (
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
              {step < steps.length && (
                <StepperSeparator className="max-md:mt-3.5 md:mx-4 bg-border" />
              )}
            </StepperItem>
          ))}
        </Stepper>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
          {getCurrentStepTitle()}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {getCurrentStepDescription()}
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
            uploadedImage={uploadData?.images?.[0]}
            onNext={handleFillInfoNext}
            onPrev={prevStep}
            onImproveRoutine={handleImproveRoutine}
            onSkipToAnalyze={handleSkipToAnalyze}
          />
        )}

        {currentStep === 3 && includesRoutineStep && (
          <RoutineImprovementStep
            initialData={routineData || undefined}
            uploadedImage={uploadData?.images?.[0]}
            onNext={handleRoutineNext}
            onPrev={prevStep}
            onSkip={handleRoutineSkip}
          />
        )}

        {currentStep === 3 &&
          !includesRoutineStep &&
          uploadData &&
          fillInfoData && (
            <AnalyzeStep
              data={{
                upload: uploadData,
                fillInfo: fillInfoData,
                routineImprovement: routineData || undefined,
              }}
              onPrev={prevStep}
              onSubmit={handleSubmit}
            />
          )}

        {currentStep === 4 &&
          includesRoutineStep &&
          uploadData &&
          fillInfoData && (
            <AnalyzeStep
              data={{
                upload: uploadData,
                fillInfo: fillInfoData,
                routineImprovement: routineData || undefined,
              }}
              onPrev={prevStep}
              onSubmit={handleSubmit}
            />
          )}

        {currentStep === 4 && !includesRoutineStep && (
          <div className="w-full max-w-3xl">
            <div className="bg-card text-card-foreground rounded-xl p-8 text-center border">
              <h2 className="text-2xl font-bold mb-4">Analysis Complete!</h2>
              <p className="text-muted-foreground">
                Your skin analysis results will appear here.
              </p>
            </div>
          </div>
        )}

        {currentStep === 5 && (
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

export function SkinAnalysisWizard() {
  return (
    <SkinAnalysisWizardProvider>
      <SkinAnalysisWizardContent />
    </SkinAnalysisWizardProvider>
  );
}
