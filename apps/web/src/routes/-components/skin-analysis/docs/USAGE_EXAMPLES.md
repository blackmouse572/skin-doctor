# Wizard Context Usage Examples

This document provides practical examples of using the `SkinAnalysisWizardProvider` and `useSkinAnalysisWizard` hook in your components.

## Table of Contents
- [Basic Setup](#basic-setup)
- [Step Component Examples](#step-component-examples)
- [Custom Navigation Components](#custom-navigation-components)
- [Advanced Use Cases](#advanced-use-cases)

## Basic Setup

### Wrapping Your Application

```tsx
import { SkinAnalysisWizard } from './skin-analysis-wizard';

function App() {
  return (
    <div>
      <SkinAnalysisWizard />
    </div>
  );
}

// The SkinAnalysisWizard component already includes the provider:
// <SkinAnalysisWizardProvider>
//   <SkinAnalysisWizardContent />
// </SkinAnalysisWizardProvider>
```

## Step Component Examples

### Example 1: Upload Step with Context

```tsx
import { useSkinAnalysisWizard } from '../wizard-context';
import type { UploadStepData } from '../schemas';

export function UploadStep() {
  const { setUploadData, nextStep } = useSkinAnalysisWizard();
  
  const handleUpload = (files: File[]) => {
    const data: UploadStepData = {
      images: files
    };
    
    setUploadData(data);
    nextStep();
  };

  return (
    <div>
      <h2>Upload Your Photo</h2>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          handleUpload(files);
        }}
      />
    </div>
  );
}
```

### Example 2: Fill Info Step with Navigation

```tsx
import { useSkinAnalysisWizard } from '../wizard-context';
import type { FillInfoStepData } from '../schemas';

export function FillInfoStep() {
  const {
    fillInfoData,
    uploadData,
    setFillInfoData,
    nextStep,
    prevStep,
    enableRoutineStep,
    skipToAnalyze,
  } = useSkinAnalysisWizard();

  const [description, setDescription] = useState(
    fillInfoData?.description || ''
  );

  const handleNext = () => {
    const data: FillInfoStepData = {
      description,
      symptoms: '',
      duration: '',
      currentRoutine: '',
    };
    
    setFillInfoData(data);
    nextStep();
  };

  const handleImproveRoutine = () => {
    const data: FillInfoStepData = {
      description,
      symptoms: '',
      duration: '',
      currentRoutine: '',
    };
    
    setFillInfoData(data);
    enableRoutineStep(); // This switches to STEPS_WITH_ROUTINE
    nextStep(); // Goes to Routine step
  };

  const handleSkipToAnalyze = () => {
    const data: FillInfoStepData = {
      description,
      symptoms: '',
      duration: '',
      currentRoutine: '',
    };
    
    setFillInfoData(data);
    skipToAnalyze(); // Jumps directly to Analyze step
  };

  return (
    <div>
      <h2>Tell Us About Your Skin</h2>
      
      {/* Show uploaded image */}
      {uploadData?.images[0] && (
        <img src={URL.createObjectURL(uploadData.images[0])} alt="Preview" />
      )}

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your skin concerns..."
      />

      <div className="button-group">
        <button onClick={prevStep}>Back</button>
        <button onClick={handleSkipToAnalyze}>Skip to Analyze</button>
        <button onClick={handleImproveRoutine}>Improve My Routine</button>
      </div>
    </div>
  );
}
```

### Example 3: Routine Step with Skip Logic

```tsx
import { useSkinAnalysisWizard } from '../wizard-context';
import type { RoutineImprovementStepData } from '../schemas';

export function RoutineStep() {
  const {
    routineData,
    uploadData,
    setRoutineData,
    nextStep,
    prevStep,
    skipRoutineStep,
  } = useSkinAnalysisWizard();

  const [morning, setMorning] = useState(
    routineData?.morningRoutine || ''
  );
  const [evening, setEvening] = useState(
    routineData?.eveningRoutine || ''
  );

  const handleContinue = () => {
    const data: RoutineImprovementStepData = {
      morningRoutine: morning,
      eveningRoutine: evening,
      routineSkipped: false,
    };
    
    setRoutineData(data);
    nextStep();
  };

  const handleSkip = () => {
    skipRoutineStep(); // Sets routineSkipped: true
    nextStep();
  };

  return (
    <div>
      <h2>Your Current Routine</h2>

      <div>
        <label>Morning Routine</label>
        <textarea
          value={morning}
          onChange={(e) => setMorning(e.target.value)}
          placeholder="E.g., Cleanser, Vitamin C, Moisturizer, SPF..."
        />
      </div>

      <div>
        <label>Evening Routine</label>
        <textarea
          value={evening}
          onChange={(e) => setEvening(e.target.value)}
          placeholder="E.g., Cleanser, Toner, Retinol, Night Cream..."
        />
      </div>

      <div className="button-group">
        <button onClick={prevStep}>Back</button>
        <button onClick={handleSkip}>Skip</button>
        <button onClick={handleContinue}>Continue</button>
      </div>
    </div>
  );
}
```

### Example 4: Analyze Step with Complete Data

```tsx
import { useSkinAnalysisWizard } from '../wizard-context';

export function AnalyzeStep() {
  const {
    getCompleteData,
    prevStep,
    nextStep,
    includesRoutineStep,
    routineData,
  } = useSkinAnalysisWizard();

  const handleAnalyze = async () => {
    const data = getCompleteData();
    
    if (!data) {
      console.error('Missing required data');
      return;
    }

    console.log('Analyzing:', data);
    
    // Perform analysis
    // await analyzeAPI(data);
    
    nextStep(); // Go to results
  };

  return (
    <div>
      <h2>Ready to Analyze</h2>
      
      <div className="summary">
        <h3>Summary:</h3>
        <p>Images: {getCompleteData()?.upload.images.length}</p>
        <p>Description: {getCompleteData()?.fillInfo.description}</p>
        
        {includesRoutineStep && (
          <p>
            Routine: {routineData?.routineSkipped 
              ? 'Skipped' 
              : 'Provided'}
          </p>
        )}
      </div>

      <div className="button-group">
        <button onClick={prevStep}>Back</button>
        <button onClick={handleAnalyze}>Start Analysis</button>
      </div>
    </div>
  );
}
```

## Custom Navigation Components

### Example 5: Progress Bar Component

```tsx
import { useSkinAnalysisWizard } from '../wizard-context';

export function ProgressBar() {
  const { currentStep, maxStep, steps } = useSkinAnalysisWizard();
  
  const progress = (currentStep / maxStep) * 100;

  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${progress}%` }} />
      
      <div className="step-indicators">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`step ${currentStep >= step.step ? 'completed' : ''}`}
          >
            <div className="step-number">{step.step}</div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 6: Navigation Breadcrumb

```tsx
import { useSkinAnalysisWizard } from '../wizard-context';

export function Breadcrumb() {
  const { steps, currentStep, goToStep } = useSkinAnalysisWizard();

  return (
    <nav className="breadcrumb">
      {steps.map((step, index) => (
        <span key={step.id}>
          <button
            onClick={() => goToStep(step.step)}
            disabled={step.step > currentStep}
            className={step.step === currentStep ? 'active' : ''}
          >
            {step.title}
          </button>
          {index < steps.length - 1 && <span> / </span>}
        </span>
      ))}
    </nav>
  );
}
```

### Example 7: Debug Panel

```tsx
import { useSkinAnalysisWizard } from '../wizard-context';

export function DebugPanel() {
  const {
    currentStep,
    includesRoutineStep,
    uploadData,
    fillInfoData,
    routineData,
    steps,
  } = useSkinAnalysisWizard();

  return (
    <div className="debug-panel">
      <h3>Debug Info</h3>
      <pre>
        {JSON.stringify(
          {
            currentStep,
            includesRoutineStep,
            totalSteps: steps.length,
            hasUploadData: !!uploadData,
            hasFillInfoData: !!fillInfoData,
            hasRoutineData: !!routineData,
            routineSkipped: routineData?.routineSkipped,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}
```

## Advanced Use Cases

### Example 8: Save Draft Functionality

```tsx
import { useSkinAnalysisWizard } from '../wizard-context';

export function SaveDraftButton() {
  const { getCompleteData, currentStep } = useSkinAnalysisWizard();

  const saveDraft = () => {
    const data = getCompleteData();
    
    const draft = {
      ...data,
      savedAt: new Date().toISOString(),
      currentStep,
    };

    localStorage.setItem('skinAnalysisDraft', JSON.stringify(draft));
    alert('Draft saved!');
  };

  return (
    <button onClick={saveDraft}>
      Save Draft
    </button>
  );
}
```

### Example 9: Load Draft Functionality

```tsx
import { useSkinAnalysisWizard } from '../wizard-context';
import { useEffect } from 'react';

export function DraftLoader() {
  const {
    setUploadData,
    setFillInfoData,
    setRoutineData,
    goToStep,
    enableRoutineStep,
  } = useSkinAnalysisWizard();

  useEffect(() => {
    const loadDraft = () => {
      const draft = localStorage.getItem('skinAnalysisDraft');
      
      if (!draft) return;

      const data = JSON.parse(draft);

      if (data.upload) setUploadData(data.upload);
      if (data.fillInfo) setFillInfoData(data.fillInfo);
      if (data.routineImprovement) {
        enableRoutineStep();
        setRoutineData(data.routineImprovement);
      }
      if (data.currentStep) goToStep(data.currentStep);
    };

    loadDraft();
  }, []);

  return null; // This is a side-effect component
}
```

### Example 10: Conditional Routing Based on Data

```tsx
import { useSkinAnalysisWizard } from '../wizard-context';
import { useEffect } from 'react';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { currentStep, uploadData, fillInfoData, goToStep } = 
    useSkinAnalysisWizard();

  useEffect(() => {
    // Prevent accessing Fill Info without Upload data
    if (currentStep >= 2 && !uploadData) {
      goToStep(1);
      return;
    }

    // Prevent accessing Analyze without Fill Info data
    if (currentStep >= 3 && !fillInfoData) {
      goToStep(2);
      return;
    }
  }, [currentStep, uploadData, fillInfoData, goToStep]);

  return <>{children}</>;
}

// Usage:
// <RouteGuard>
//   <YourStepComponent />
// </RouteGuard>
```

### Example 11: Custom Hook for Validation

```tsx
import { useSkinAnalysisWizard } from '../wizard-context';
import { useMemo } from 'react';

export function useWizardValidation() {
  const { uploadData, fillInfoData, routineData, includesRoutineStep } = 
    useSkinAnalysisWizard();

  const canProceedToAnalysis = useMemo(() => {
    if (!uploadData || !fillInfoData) return false;
    
    if (includesRoutineStep && !routineData) return false;
    
    if (fillInfoData.description.length < 10) return false;

    return true;
  }, [uploadData, fillInfoData, routineData, includesRoutineStep]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];

    if (!uploadData) errors.push('Please upload an image');
    if (!fillInfoData?.description) errors.push('Please provide a description');
    if (fillInfoData?.description && fillInfoData.description.length < 10) {
      errors.push('Description must be at least 10 characters');
    }

    return errors;
  }, [uploadData, fillInfoData]);

  return {
    canProceedToAnalysis,
    validationErrors,
    isValid: validationErrors.length === 0,
  };
}

// Usage in component:
export function AnalyzeButton() {
  const { nextStep } = useSkinAnalysisWizard();
  const { canProceedToAnalysis, validationErrors } = useWizardValidation();

  return (
    <div>
      <button 
        onClick={nextStep}
        disabled={!canProceedToAnalysis}
      >
        Analyze
      </button>
      
      {validationErrors.length > 0 && (
        <ul className="errors">
          {validationErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Example 12: Analytics Tracking

```tsx
import { useSkinAnalysisWizard } from '../wizard-context';
import { useEffect } from 'react';

export function useStepTracking() {
  const { currentStep, steps } = useSkinAnalysisWizard();

  useEffect(() => {
    const currentStepInfo = steps.find((s) => s.step === currentStep);
    
    // Track step view
    analytics.track('Step Viewed', {
      step: currentStep,
      stepId: currentStepInfo?.id,
      stepTitle: currentStepInfo?.title,
    });
  }, [currentStep, steps]);
}

// Usage:
export function TrackedWizard() {
  useStepTracking(); // Automatically tracks step changes
  
  return <SkinAnalysisWizard />;
}
```

## Testing Examples

### Example 13: Testing with Context Mock

```tsx
import { render, screen } from '@testing-library/react';
import { SkinAnalysisWizardProvider } from '../wizard-context';
import { YourComponent } from './your-component';

describe('YourComponent', () => {
  it('should render with wizard context', () => {
    render(
      <SkinAnalysisWizardProvider>
        <YourComponent />
      </SkinAnalysisWizardProvider>
    );
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Example 14: Testing Navigation

```tsx
import { renderHook, act } from '@testing-library/react';
import { SkinAnalysisWizardProvider, useSkinAnalysisWizard } from '../wizard-context';

describe('useSkinAnalysisWizard', () => {
  it('should navigate to next step', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SkinAnalysisWizardProvider>{children}</SkinAnalysisWizardProvider>
    );

    const { result } = renderHook(() => useSkinAnalysisWizard(), { wrapper });

    expect(result.current.currentStep).toBe(1);

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(2);
  });

  it('should enable routine step', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SkinAnalysisWizardProvider>{children}</SkinAnalysisWizardProvider>
    );

    const { result } = renderHook(() => useSkinAnalysisWizard(), { wrapper });

    expect(result.current.includesRoutineStep).toBe(false);
    expect(result.current.steps.length).toBe(4);

    act(() => {
      result.current.enableRoutineStep();
    });

    expect(result.current.includesRoutineStep).toBe(true);
    expect(result.current.steps.length).toBe(5);
  });
});
```

## Best Practices

1. **Always check for data before proceeding**
   ```tsx
   const data = getCompleteData();
   if (!data) {
     // Handle missing data
     return;
   }
   ```

2. **Use validation before navigation**
   ```tsx
   const handleNext = () => {
     if (!isValid) {
       showError();
       return;
     }
     nextStep();
   };
   ```

3. **Preserve user input**
   ```tsx
   // Always save data before navigating
   setFillInfoData(formData);
   nextStep();
   ```

4. **Handle edge cases**
   ```tsx
   // Check if routine was skipped
   if (routineData?.routineSkipped) {
     // Handle skipped routine
   }
   ```

5. **Use TypeScript types**
   ```tsx
   import type { FillInfoStepData } from '../schemas';
   
   const data: FillInfoStepData = {
     // Type-safe data structure
   };
   ```
