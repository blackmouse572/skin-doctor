'use client';

import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from '@repo/ui/components/stepper';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../../../clients/apiClient';
import { AnalyzeStep } from './steps/analyze-step';
import { FillInfoStep } from './steps/fill-info-step';
import { RoutineImprovementStep } from './steps/routine-improvement-step';
import { UploadStep } from './steps/upload-step';
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

  const createSkinAnalysis = useMutation(
    apiClient.skinAnalysis.create.mutationOptions(),
  );

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

  const handleSubmit = async () => {
    const completeData = getCompleteData();
    if (!completeData) {
      toast.error('Please complete all required steps');
      return;
    }
    toast.promise(
      createSkinAnalysis
        .mutateAsync({
          description: completeData.fillInfo.description,
          images: completeData.upload.images,
          symptoms: completeData.fillInfo.symptoms,
          duration: completeData.fillInfo.duration,
          currentRoutine: completeData.fillInfo.currentRoutine,
          morningRoutine: completeData.routineImprovement?.morningRoutine,
          eveningRoutine: completeData.routineImprovement?.eveningRoutine,
        })
        .then((response) => {
          return response;
        }),
      {
        loading: 'Analyzing your skin...',
        success: 'Skin analysis complete!',
        error: (err) =>
          err?.message || 'Failed to analyze skin. Please try again.',
      },
    );
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
              isSubmitting={createSkinAnalysis.isPending}
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
              isSubmitting={createSkinAnalysis.isPending}
            />
          )}

        {currentStep === 4 &&
          !includesRoutineStep &&
          createSkinAnalysis.data && (
            <div className="w-full max-w-3xl">
              <div className="bg-card text-card-foreground rounded-xl p-8 border">
                <h2 className="text-2xl font-bold mb-4 text-center">
                  Analysis Complete!
                </h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Health Point
                      </p>
                      <p className="text-2xl font-bold">
                        {createSkinAnalysis.data.data.summary.skin.healthPoint}
                        /100
                      </p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Moisture Level
                      </p>
                      <p className="text-2xl font-bold">
                        {
                          createSkinAnalysis.data.data.summary.skin
                            .moistureLevel
                        }
                        /100
                      </p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Skin Age</p>
                      <p className="text-2xl font-bold">
                        {createSkinAnalysis.data.data.summary.skin.skinAge}{' '}
                        years
                      </p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Skin Type</p>
                      <p className="text-2xl font-bold">
                        {createSkinAnalysis.data.data.summary.skin.skinType}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Skin Concerns</h3>
                    {createSkinAnalysis.data.data.summary.concerns.map(
                      (concern: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{concern.type}</h4>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                concern.severity === 'high'
                                  ? 'bg-red-100 text-red-700'
                                  : concern.severity === 'medium'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {concern.severity}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {concern.description}
                          </p>
                          <div>
                            <p className="text-sm font-medium mb-2">
                              Recommendations:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                              {concern.recommendations.map(
                                (rec: string, i: number) => (
                                  <li
                                    key={i}
                                    className="text-sm text-muted-foreground"
                                  >
                                    {rec}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        {currentStep === 5 && createSkinAnalysis.data && (
          <div className="w-full max-w-3xl">
            <div className="bg-card text-card-foreground rounded-xl p-8 border">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Analysis Complete!
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Health Point
                    </p>
                    <p className="text-2xl font-bold">
                      {createSkinAnalysis.data.data.summary.skin.healthPoint}
                      /100
                    </p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Moisture Level
                    </p>
                    <p className="text-2xl font-bold">
                      {createSkinAnalysis.data.data.summary.skin.moistureLevel}
                      /100
                    </p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Skin Age</p>
                    <p className="text-2xl font-bold">
                      {createSkinAnalysis.data.data.summary.skin.skinAge} years
                    </p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Skin Type</p>
                    <p className="text-2xl font-bold">
                      {createSkinAnalysis.data.data.summary.skin.skinType}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Skin Concerns</h3>
                  {createSkinAnalysis.data.data.summary.concerns.map(
                    (concern: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{concern.type}</h4>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              concern.severity === 'high'
                                ? 'bg-red-100 text-red-700'
                                : concern.severity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {concern.severity}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {concern.description}
                        </p>
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Recommendations:
                          </p>
                          <ul className="list-disc list-inside space-y-1">
                            {concern.recommendations.map(
                              (rec: string, i: number) => (
                                <li
                                  key={i}
                                  className="text-sm text-muted-foreground"
                                >
                                  {rec}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
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
