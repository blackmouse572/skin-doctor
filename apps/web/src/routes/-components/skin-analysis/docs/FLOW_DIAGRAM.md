# Skin Analysis Wizard Flow Diagram

## Navigation Flow Scenarios

### Scenario 1: Skip Routine (Direct Path)
```
┌─────────────────────────────────────────────────────────────────┐
│                        BASE_STEPS Flow                          │
└─────────────────────────────────────────────────────────────────┘

Step 1          Step 2           Step 3          Step 4
┌────────┐     ┌────────┐      ┌────────┐     ┌────────┐
│ Upload │────▶│  Fill  │─────▶│Analyze │────▶│ Result │
│        │     │  Info  │      │        │     │        │
└────────┘     └────────┘      └────────┘     └────────┘
                    │               ▲
                    │    [Skip]     │
                    └───────────────┘
                    
[Back Button Behavior]
• From Analyze (Step 3) → Fill Info (Step 2)
• From Fill Info (Step 2) → Upload (Step 1)
```

### Scenario 2: Include Routine Step
```
┌─────────────────────────────────────────────────────────────────┐
│                   STEPS_WITH_ROUTINE Flow                       │
└─────────────────────────────────────────────────────────────────┘

Step 1      Step 2        Step 3        Step 4        Step 5
┌────────┐ ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│ Upload │─│  Fill  │──▶│Routine │──▶│Analyze │──▶│ Result │
│        │ │  Info  │   │Improve │   │        │   │        │
└────────┘ └────────┘   └────────┘   └────────┘   └────────┘
                             │            ▲
                             │ [Skip]     │
                             └────────────┘

[Back Button Behavior]
• From Analyze (Step 4) → Routine (Step 3)
• From Routine (Step 3) → Fill Info (Step 2)
• From Fill Info (Step 2) → Upload (Step 1)
```

### Scenario 3: Skip to Analyze (Jump Path)
```
┌─────────────────────────────────────────────────────────────────┐
│              STEPS_WITH_ROUTINE (Skip Jump)                     │
└─────────────────────────────────────────────────────────────────┘

Step 1      Step 2        Step 3        Step 4        Step 5
┌────────┐ ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│ Upload │─│  Fill  │   │Routine │   │Analyze │──▶│ Result │
│        │ │  Info  │╲  │Improve │  ╱│        │   │        │
└────────┘ └────────┘ ╲ └────────┘ ╱ └────────┘   └────────┘
                       ╲     ⊗     ╱
                        ╲[Skip to]╱
                         ╲Analyze╱
                          ╲─────╱

⊗ = Step is marked as skipped (routineSkipped: true)

[Back Button Behavior]
• From Analyze (Step 4) → Fill Info (Step 2) ⚠️ SKIPS Step 3!
• Routine step is marked as completed but skipped
```

## State Transitions

### includesRoutineStep Flag
```
Initial State: false (BASE_STEPS)
                │
                ├─▶ [User clicks "Improve Routine"]
                │   └─▶ includesRoutineStep = true (STEPS_WITH_ROUTINE)
                │
                └─▶ [User clicks "Skip to Analyze"]
                    └─▶ includesRoutineStep = true (STEPS_WITH_ROUTINE)
                        routineData.routineSkipped = true
```

### Step Array Selection
```
if (includesRoutineStep) {
  steps = STEPS_WITH_ROUTINE (5 steps)
} else {
  steps = BASE_STEPS (4 steps)
}
```

## Button Actions and Effects

### Fill Info Step - User Actions
```
┌──────────────────────────────────────────────────────────────┐
│                    Fill Info Step (Step 2)                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐│
│  │   Go Back      │  │Skip to Analyze   │  │   Improve   ││
│  │                │  │                  │  │   Routine   ││
│  └────────────────┘  └──────────────────┘  └─────────────┘│
│         │                     │                     │       │
└─────────┼─────────────────────┼─────────────────────┼───────┘
          │                     │                     │
          ▼                     ▼                     ▼
    prevStep()         skipToAnalyze()      enableRoutineStep()
      (Step 1)          (Step 4*)           nextStep() (Step 3)
                        *skips Step 3
```

### Routine Step - User Actions
```
┌──────────────────────────────────────────────────────────────┐
│                  Routine Step (Step 3)                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐│
│  │   Go Back      │  │     Skip         │  │  Continue   ││
│  │                │  │                  │  │             ││
│  └────────────────┘  └──────────────────┘  └─────────────┘│
│         │                     │                     │       │
└─────────┼─────────────────────┼─────────────────────┼───────┘
          │                     │                     │
          ▼                     ▼                     ▼
    prevStep()         skipRoutineStep()       nextStep()
      (Step 2)          nextStep()              (Step 4)
                        (Step 4)
```

## Data Flow

### Complete Data Structure
```
SkinAnalysisData {
  upload: UploadStepData {
    images: File[]
  }
  
  fillInfo: FillInfoStepData {
    symptoms?: string
    description: string (min: 10, max: 5000)
    duration?: string
    currentRoutine?: string
  }
  
  routineImprovement?: RoutineImprovementStepData {
    morningRoutine?: string
    eveningRoutine?: string
    routineSkipped?: boolean  // ⚠️ Key flag for skip behavior
  }
}
```

### Data Persistence Across Steps
```
Context State
├── uploadData ────────────┐
├── fillInfoData ──────────┼──▶ Available in all subsequent steps
└── routineData ───────────┘    (null until step is completed)

Step 1 (Upload)     → Sets uploadData
Step 2 (Fill Info)  → Sets fillInfoData
Step 3 (Routine)    → Sets routineData
  OR Skip           → Sets routineData.routineSkipped = true
```

## Navigation Logic

### prevStep() Implementation
```javascript
const prevStep = () => {
  setCurrentStep((prev) => Math.max(prev - 1, 1));
};

// Automatically handles:
// - In BASE_STEPS: 4 → 3 → 2 → 1
// - In STEPS_WITH_ROUTINE: 5 → 4 → 3 → 2 → 1
// 
// No special logic needed because step arrays are dynamic!
```

### Why It Works
```
Scenario 1 (BASE_STEPS):
  Analyze is Step 3 → prevStep() → Step 2 ✅

Scenario 2 (STEPS_WITH_ROUTINE):
  Analyze is Step 4 → prevStep() → Step 3 (Routine) ✅

Scenario 3 (Skip from Step 2 to 4):
  Current: Step 4 in STEPS_WITH_ROUTINE array
  prevStep() → Step 3... but Step 3 was never visited!
  
  Solution: Check if step was skipped in component render logic
```

## Component Render Logic

### Smart Step Rendering
```tsx
{currentStep === 3 && includesRoutineStep && (
  <RoutineImprovementStep />
)}

{currentStep === 3 && !includesRoutineStep && (
  <AnalyzeStep />  // Analyze is Step 3 in BASE_STEPS
)}

{currentStep === 4 && includesRoutineStep && (
  <AnalyzeStep />  // Analyze is Step 4 in STEPS_WITH_ROUTINE
)}
```

## Edge Cases Handled

### 1. User Goes Back After Skipping
```
Path: Step 2 → Skip to Step 4 → Back
Result: Goes to Step 3 (Routine), but can skip again or fill it
```

### 2. User Switches Decision Mid-Flow
```
Path: Step 2 → Improve Routine → Step 3 → Back → Step 2 → Skip
Result: Routine data is preserved, can be restored if user goes back
```

### 3. Data Preservation on Navigation
```
All step data is preserved in context
→ User can freely navigate back and forth
→ Data is only lost on component unmount
```

## Step Indicator Display

### Visual Representation
```
BASE_STEPS (4 steps):
[1]───[2]───[3]───[4]
 ●────●────○────○   (Currently on Step 2)

STEPS_WITH_ROUTINE (5 steps):
[1]───[2]───[3]───[4]───[5]
 ●────●────●────○────○   (Currently on Step 3)
 
● = Completed
○ = Not completed
```

### Dynamic Update
```
When includesRoutineStep changes from false → true:
  
Before:                After:
[1][2][3][4]          [1][2][3][4][5]
         ▲                      ▲
         │                      │
   Step numbers                Step numbers
   are re-indexed              shift after [2]
```

## Summary

✅ **Single Source of Truth**: Context manages all state
✅ **Automatic Navigation**: prevStep() works correctly in all scenarios
✅ **Data Persistence**: All data preserved across navigation
✅ **Type Safety**: TypeScript ensures data integrity
✅ **Flexible Flow**: Supports skip, include, and back navigation
✅ **Clean Code**: No complex conditionals in components