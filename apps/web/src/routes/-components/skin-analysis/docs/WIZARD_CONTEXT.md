# Skin Analysis Wizard Context Documentation

## Overview

The `SkinAnalysisWizardProvider` is a React context provider that manages the state and navigation flow of the multi-step skin analysis wizard. It handles dynamic step navigation, especially when the routine improvement step is skipped or included.

## Architecture

### Context Provider Structure

```
SkinAnalysisWizardProvider
├── State Management
│   ├── currentStep
│   ├── includesRoutineStep
│   ├── uploadData
│   ├── fillInfoData
│   └── routineData
├── Navigation Functions
│   ├── nextStep()
│   ├── prevStep()
│   └── goToStep(step)
└── Flow Control Functions
    ├── enableRoutineStep()
    ├── skipRoutineStep()
    └── skipToAnalyze()
```

## Step Flow Scenarios

### Scenario 1: User Skips Routine Step

**Flow:**
1. Upload → Fill Info → **Skip to Analyze** → Analyze → Result

**Steps Array:**
```
BASE_STEPS = [
  { step: 1, title: 'Upload', id: 'upload' },
  { step: 2, title: 'Fill Info', id: 'fillInfo' },
  { step: 3, title: 'Analyze', id: 'analyze' },
  { step: 4, title: 'Result', id: 'result' },
]
```

**Navigation:**
- From Fill Info (step 2), clicking "Skip to Analyze" → goes to step 3 (Analyze)
- Clicking "Previous" on Analyze → goes back to step 2 (Fill Info)
- **The routine step is never shown**

### Scenario 2: User Includes Routine Step

**Flow:**
1. Upload → Fill Info → **Improve Routine** → Routine → Analyze → Result

**Steps Array:**
```
STEPS_WITH_ROUTINE = [
  { step: 1, title: 'Upload', id: 'upload' },
  { step: 2, title: 'Fill Info', id: 'fillInfo' },
  { step: 3, title: 'Routine', id: 'routine' },
  { step: 4, title: 'Analyze', id: 'analyze' },
  { step: 5, title: 'Result', id: 'result' },
]
```

**Navigation:**
- From Fill Info (step 2), clicking "Improve Routine" → goes to step 3 (Routine)
- Clicking "Previous" on Routine → goes back to step 2 (Fill Info)
- From Routine, clicking "Continue" → goes to step 4 (Analyze)
- Clicking "Previous" on Analyze → goes back to step 3 (Routine)

### Scenario 3: User Skips Routine from Fill Info (Alternative)

**Flow:**
1. Upload → Fill Info → **Skip to Analyze** → Analyze (skipped routine) → Result

**Key Difference:**
- `includesRoutineStep` is set to `true`
- `routineData` is set with `routineSkipped: true`
- User jumps directly from step 2 to step 4 (Analyze in STEPS_WITH_ROUTINE array)
- Clicking "Previous" on Analyze → goes back to step 2 (Fill Info), **not step 3**

## Usage Example

### Basic Setup

```tsx
import { SkinAnalysisWizardProvider, useSkinAnalysisWizard } from './wizard-context';

function App() {
  return (
    <SkinAnalysisWizardProvider>
      <YourWizardComponent />
    </SkinAnalysisWizardProvider>
  );
}
```

### Using the Hook

```tsx
function YourWizardComponent() {
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

  // Your component logic
}
```

### Handling "Improve Routine" Button

```tsx
const handleImproveRoutine = (data: FillInfoStepData) => {
  setFillInfoData(data);
  enableRoutineStep(); // Switches to STEPS_WITH_ROUTINE
  nextStep(); // Goes from step 2 to step 3 (Routine)
};
```

### Handling "Skip to Analyze" Button

```tsx
const handleSkipToAnalyze = (data: FillInfoStepData) => {
  setFillInfoData(data);
  enableRoutineStep(); // Enables routine step in steps array
  skipToAnalyze(); // Sets routineSkipped=true and jumps to analyze step
};
```

### Handling Back Button

```tsx
// The prevStep() function automatically handles the correct navigation
// No need to check if routine step is included
<Button onClick={prevStep}>
  Back
</Button>
```

## Key Features

### 1. Dynamic Step Array
The wizard automatically switches between `BASE_STEPS` and `STEPS_WITH_ROUTINE` based on `includesRoutineStep` state.

### 2. Smart Back Navigation
The `prevStep()` function automatically navigates to the correct previous step without needing to check if the routine step is included.

### 3. Data Persistence
All form data (upload, fillInfo, routine) is preserved in the context and can be accessed at any step.

### 4. Type Safety
All data types are inferred from the schemas:
- `UploadStepData`
- `FillInfoStepData`
- `RoutineImprovementStepData`
- `SkinAnalysisData`

## API Reference

### State Properties

| Property | Type | Description |
|----------|------|-------------|
| `currentStep` | `number` | Current active step number (1-based) |
| `steps` | `WizardStep[]` | Array of step configurations |
| `includesRoutineStep` | `boolean` | Whether routine step is included in flow |
| `maxStep` | `number` | Maximum number of steps |
| `uploadData` | `UploadStepData \| null` | Upload step data |
| `fillInfoData` | `FillInfoStepData \| null` | Fill info step data |
| `routineData` | `RoutineImprovementStepData \| null` | Routine step data |

### Navigation Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `nextStep()` | none | Advances to next step |
| `prevStep()` | none | Goes back to previous step |
| `goToStep(step)` | `step: number` | Jumps to specific step |

### Data Update Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `setUploadData(data)` | `data: UploadStepData` | Updates upload data |
| `setFillInfoData(data)` | `data: FillInfoStepData` | Updates fill info data |
| `setRoutineData(data)` | `data: RoutineImprovementStepData` | Updates routine data |

### Flow Control Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `enableRoutineStep()` | none | Switches to STEPS_WITH_ROUTINE array |
| `skipRoutineStep()` | none | Sets routineData with routineSkipped=true |
| `skipToAnalyze()` | none | Combines skipRoutineStep + jumps to analyze |
| `getCompleteData()` | none | Returns complete SkinAnalysisData or null |

## Benefits

### 1. Centralized State Management
All wizard state is managed in one place, making it easier to debug and maintain.

### 2. Automatic Navigation Handling
The back button automatically navigates correctly based on the flow, eliminating complex conditional logic in components.

### 3. Separation of Concerns
Components focus on presentation and user interaction, while the context handles state and navigation logic.

### 4. Easy Testing
The context can be easily mocked for testing individual components.

### 5. Reusability
The same context pattern can be used for other multi-step wizards in the application.

## Migration Guide

If you have existing wizard code without the context:

### Before (Local State)
```tsx
const [currentStep, setCurrentStep] = useState(1);
const [uploadData, setUploadData] = useState(null);
const [includesRoutineStep, setIncludesRoutineStep] = useState(false);

const prevStep = () => {
  if (currentStep === 4 && includesRoutineStep) {
    setCurrentStep(3);
  } else if (currentStep === 3 && !includesRoutineStep) {
    setCurrentStep(2);
  }
  // ... more conditions
};
```

### After (Context Provider)
```tsx
const { prevStep } = useSkinAnalysisWizard();

// Just call it - it handles everything
<Button onClick={prevStep}>Back</Button>
```

## Troubleshooting

### Issue: "useSkinAnalysisWizard must be used within a SkinAnalysisWizardProvider"

**Solution:** Make sure your component is wrapped with `SkinAnalysisWizardProvider`:
```tsx
<SkinAnalysisWizardProvider>
  <YourComponent />
</SkinAnalysisWizardProvider>
```

### Issue: Back button doesn't skip routine step when it was skipped

**Solution:** Make sure you're using `prevStep()` from the context, not a custom implementation.

### Issue: Step numbers are incorrect

**Solution:** The step numbers are automatically calculated based on `includesRoutineStep`. Don't manually set step numbers.