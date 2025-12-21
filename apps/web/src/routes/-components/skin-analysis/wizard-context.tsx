'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type {
  UploadStepData,
  FillInfoStepData,
  RoutineImprovementStepData,
  SkinAnalysisData,
} from './schemas';

interface WizardStep {
  step: number;
  title: string;
  id: 'upload' | 'fillInfo' | 'routine' | 'analyze' | 'result';
}

const BASE_STEPS: WizardStep[] = [
  { step: 1, title: 'Upload', id: 'upload' },
  { step: 2, title: 'Fill Info', id: 'fillInfo' },
  { step: 3, title: 'Analyze', id: 'analyze' },
  { step: 4, title: 'Result', id: 'result' },
];

const STEPS_WITH_ROUTINE: WizardStep[] = [
  { step: 1, title: 'Upload', id: 'upload' },
  { step: 2, title: 'Fill Info', id: 'fillInfo' },
  { step: 3, title: 'Routine', id: 'routine' },
  { step: 4, title: 'Analyze', id: 'analyze' },
  { step: 5, title: 'Result', id: 'result' },
];

interface SkinAnalysisWizardContextValue {
  // Current state
  currentStep: number;
  steps: WizardStep[];
  includesRoutineStep: boolean;
  maxStep: number;

  // Data
  uploadData: UploadStepData | null;
  fillInfoData: FillInfoStepData | null;
  routineData: RoutineImprovementStepData | null;

  // Navigation functions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;

  // Data update functions
  setUploadData: (data: UploadStepData) => void;
  setFillInfoData: (data: FillInfoStepData) => void;
  setRoutineData: (data: RoutineImprovementStepData) => void;

  // Flow control
  enableRoutineStep: () => void;
  skipRoutineStep: () => void;
  skipToAnalyze: () => void;

  // Complete data
  getCompleteData: () => SkinAnalysisData | null;
}

const SkinAnalysisWizardContext = createContext<
  SkinAnalysisWizardContextValue | undefined
>(undefined);

interface SkinAnalysisWizardProviderProps {
  children: React.ReactNode;
}

export function SkinAnalysisWizardProvider({
  children,
}: SkinAnalysisWizardProviderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [includesRoutineStep, setIncludesRoutineStep] = useState(false);
  const [uploadData, setUploadDataState] = useState<UploadStepData | null>(
    null,
  );
  const [fillInfoData, setFillInfoDataState] =
    useState<FillInfoStepData | null>(null);
  const [routineData, setRoutineDataState] =
    useState<RoutineImprovementStepData | null>(null);

  const steps = includesRoutineStep ? STEPS_WITH_ROUTINE : BASE_STEPS;
  const maxStep = steps.length;

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, maxStep));
  }, [maxStep]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= maxStep) {
        setCurrentStep(step);
      }
    },
    [maxStep],
  );

  const setUploadData = useCallback((data: UploadStepData) => {
    setUploadDataState(data);
  }, []);

  const setFillInfoData = useCallback((data: FillInfoStepData) => {
    setFillInfoDataState(data);
  }, []);

  const setRoutineData = useCallback((data: RoutineImprovementStepData) => {
    setRoutineDataState(data);
  }, []);

  const enableRoutineStep = useCallback(() => {
    setIncludesRoutineStep(true);
  }, []);

  const skipRoutineStep = useCallback(() => {
    setRoutineDataState({
      morningRoutine: '',
      eveningRoutine: '',
      routineSkipped: true,
    });
  }, []);

  const skipToAnalyze = useCallback(() => {
    skipRoutineStep();
    // If routine step is already enabled, go to step 4 (analyze), otherwise step 3
    const analyzeStep = includesRoutineStep ? 4 : 3;
    setCurrentStep(analyzeStep);
  }, [includesRoutineStep, skipRoutineStep]);

  const getCompleteData = useCallback((): SkinAnalysisData | null => {
    if (!uploadData || !fillInfoData) {
      return null;
    }
    return {
      upload: uploadData,
      fillInfo: fillInfoData,
      routineImprovement: routineData || undefined,
    };
  }, [uploadData, fillInfoData, routineData]);

  const value: SkinAnalysisWizardContextValue = useMemo(
    () => ({
      currentStep,
      steps,
      includesRoutineStep,
      maxStep,
      uploadData,
      fillInfoData,
      routineData,
      nextStep,
      prevStep,
      goToStep,
      setUploadData,
      setFillInfoData,
      setRoutineData,
      enableRoutineStep,
      skipRoutineStep,
      skipToAnalyze,
      getCompleteData,
    }),
    [
      currentStep,
      steps,
      includesRoutineStep,
      maxStep,
      uploadData,
      fillInfoData,
      routineData,
      nextStep,
      prevStep,
      goToStep,
      setUploadData,
      setFillInfoData,
      setRoutineData,
      enableRoutineStep,
      skipRoutineStep,
      skipToAnalyze,
      getCompleteData,
    ],
  );

  return (
    <SkinAnalysisWizardContext.Provider value={value}>
      {children}
    </SkinAnalysisWizardContext.Provider>
  );
}

export function useSkinAnalysisWizard() {
  const context = useContext(SkinAnalysisWizardContext);
  if (context === undefined) {
    throw new Error(
      'useSkinAnalysisWizard must be used within a SkinAnalysisWizardProvider',
    );
  }
  return context;
}
