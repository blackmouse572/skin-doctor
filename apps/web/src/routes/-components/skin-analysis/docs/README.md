# Skin Analysis Wizard Documentation

Welcome to the Skin Analysis Wizard documentation. This directory contains comprehensive guides and examples for understanding and working with the multi-step skin analysis wizard.

## 📚 Documentation Files

### [WIZARD_CONTEXT.md](./WIZARD_CONTEXT.md)
Complete documentation for the `SkinAnalysisWizardProvider` context API.

**Contents:**
- Overview of the context provider architecture
- Detailed explanation of step flow scenarios
- API reference for all functions and properties
- Benefits of using the context approach
- Migration guide from local state to context
- Troubleshooting common issues

**When to read:** Start here if you're new to the wizard or need to understand how the state management works.

### [FLOW_DIAGRAM.md](./FLOW_DIAGRAM.md)
Visual diagrams and flowcharts showing wizard navigation paths.

**Contents:**
- ASCII art flow diagrams for all navigation scenarios
- State transition diagrams
- Button action effects visualization
- Data flow architecture
- Component render logic
- Step indicator display patterns

**When to read:** Perfect for visual learners who want to understand the navigation flow at a glance.

### [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
Practical, copy-paste ready code examples.

**Contents:**
- Basic setup examples
- Step component implementations
- Custom navigation components
- Advanced use cases (save/load drafts, validation, analytics)
- Testing examples
- Best practices

**When to read:** When you need to implement a feature or component that interacts with the wizard.

## 🚀 Quick Start

### 1. Understanding the Wizard
The skin analysis wizard is a multi-step form that guides users through:
1. **Upload** - Upload skin photos
2. **Fill Info** - Describe skin concerns
3. **Routine** (Optional) - Share current skincare routine
4. **Analyze** - Review and start AI analysis
5. **Result** - View analysis results

### 2. Key Concept: Dynamic Steps
The wizard has **two step configurations**:

```
BASE_STEPS (4 steps)
Upload → Fill Info → Analyze → Result

STEPS_WITH_ROUTINE (5 steps)
Upload → Fill Info → Routine → Analyze → Result
```

The configuration switches dynamically based on user choices at the Fill Info step.

### 3. Context Provider
All state and navigation logic is managed by `SkinAnalysisWizardProvider`:

```tsx
import { useSkinAnalysisWizard } from './wizard-context';

function MyComponent() {
  const {
    currentStep,
    nextStep,
    prevStep,
    uploadData,
    setUploadData,
    // ... more properties
  } = useSkinAnalysisWizard();
  
  // Use the context
}
```

## 📖 Common Use Cases

### Implementing a New Step Component
1. Read: [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - "Step Component Examples"
2. Use the `useSkinAnalysisWizard` hook
3. Handle navigation with `nextStep()` and `prevStep()`
4. Save data with `setUploadData()`, `setFillInfoData()`, etc.

### Understanding Navigation Flow
1. Read: [FLOW_DIAGRAM.md](./FLOW_DIAGRAM.md) - "Navigation Flow Scenarios"
2. Understand the three main scenarios:
   - Skip routine (direct path)
   - Include routine step
   - Skip to analyze (jump path)

### Adding Validation
1. Read: [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - "Example 11: Custom Hook for Validation"
2. Create a custom validation hook
3. Use `getCompleteData()` to validate before submission

### Debugging Navigation Issues
1. Read: [WIZARD_CONTEXT.md](./WIZARD_CONTEXT.md) - "Troubleshooting"
2. Use the Debug Panel component from [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - "Example 7"
3. Check the `includesRoutineStep` flag
4. Verify `currentStep` matches expected step in the current steps array

## 🔑 Key Features

### 1. Smart Back Navigation
The `prevStep()` function automatically navigates to the correct previous step without needing to check if the routine step is included.

```tsx
// Just call prevStep() - it handles everything
<Button onClick={prevStep}>Back</Button>
```

### 2. Data Persistence
All form data is preserved in the context and accessible from any step.

```tsx
const { uploadData, fillInfoData, routineData } = useSkinAnalysisWizard();
```

### 3. Flexible Flow Control
Users can:
- Go back to previous steps
- Skip the routine step
- Jump directly to analysis
- Change their mind and fill in skipped steps

### 4. Type Safety
All data structures are typed with TypeScript for compile-time safety.

```tsx
import type { 
  UploadStepData, 
  FillInfoStepData, 
  RoutineImprovementStepData 
} from '../schemas';
```

## 🎯 Navigation Rules

### Rule 1: Back Button Behavior
- **With Routine**: Analyze (Step 4) → Routine (Step 3) → Fill Info (Step 2)
- **Without Routine**: Analyze (Step 3) → Fill Info (Step 2)
- **After Skip**: Analyze (Step 4) → Fill Info (Step 2) *(skips Step 3)*

### Rule 2: Step Array Selection
```tsx
if (includesRoutineStep) {
  steps = STEPS_WITH_ROUTINE; // 5 steps
} else {
  steps = BASE_STEPS; // 4 steps
}
```

### Rule 3: Data Requirements
- **Step 2 (Fill Info)**: Requires `uploadData`
- **Step 3 (Routine)**: Requires `uploadData` and `fillInfoData`
- **Step 4 (Analyze)**: Requires `uploadData` and `fillInfoData`, optionally `routineData`

## 🛠️ Development Workflow

### Adding a New Feature
1. **Read** relevant documentation section
2. **Plan** how it integrates with the wizard flow
3. **Implement** using context hooks
4. **Test** navigation and data persistence
5. **Document** any new patterns in USAGE_EXAMPLES.md

### Modifying Navigation Logic
1. **Understand** current flow from FLOW_DIAGRAM.md
2. **Update** wizard-context.tsx
3. **Test** all navigation scenarios:
   - Skip routine
   - Include routine
   - Back navigation
   - Jump to analyze
4. **Update** documentation if flow changes

### Debugging Steps
1. Add the Debug Panel component (Example 7 in USAGE_EXAMPLES.md)
2. Check console for current state
3. Verify step numbers match expected flow
4. Check `includesRoutineStep` flag
5. Ensure data is being saved correctly

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│         SkinAnalysisWizardProvider                  │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │           State Management                   │ │
│  │  • currentStep                               │ │
│  │  • includesRoutineStep                       │ │
│  │  • uploadData                                │ │
│  │  • fillInfoData                              │ │
│  │  • routineData                               │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │         Navigation Functions                 │ │
│  │  • nextStep()                                │ │
│  │  • prevStep()                                │ │
│  │  • goToStep()                                │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │         Flow Control                         │ │
│  │  • enableRoutineStep()                       │ │
│  │  • skipRoutineStep()                         │ │
│  │  • skipToAnalyze()                           │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                         ▲
                         │ useSkinAnalysisWizard()
                         │
        ┌────────────────┴────────────────┐
        │                                 │
   ┌────▼────┐  ┌────────┐  ┌──────────┐ ┌────────┐
   │ Upload  │→ │FillInfo│→ │ Routine  │→│Analyze │
   │  Step   │  │  Step  │  │   Step   │ │  Step  │
   └─────────┘  └────────┘  └──────────┘ └────────┘
```

## 🤝 Contributing

When adding new features or fixing bugs:

1. **Update Documentation**: Add examples to USAGE_EXAMPLES.md
2. **Update Diagrams**: Add flow diagrams to FLOW_DIAGRAM.md if navigation changes
3. **Update API Docs**: Update WIZARD_CONTEXT.md if context API changes
4. **Test Thoroughly**: Test all navigation scenarios
5. **Add Tests**: Write unit tests for new functionality

## 📝 Additional Resources

- **Main Component**: `../skin-analysis-wizard.tsx`
- **Context Provider**: `../wizard-context.tsx`
- **Schema Definitions**: `../schemas.ts`
- **Step Components**: `../steps/`

## ❓ FAQ

**Q: Why use a context provider instead of props?**
A: The context provider centralizes state management, eliminates prop drilling, and makes navigation logic reusable across all step components.

**Q: How does the back button know which step to go to?**
A: The `prevStep()` function uses `currentStep - 1`, which automatically works because the step array is dynamically selected based on `includesRoutineStep`.

**Q: What happens if a user skips the routine step and then clicks back?**
A: The user will return to the Fill Info step (Step 2), not the Routine step (Step 3), because the navigation is linear based on the steps array.

**Q: Can I add more steps to the wizard?**
A: Yes! Add the step to the appropriate steps array (BASE_STEPS or STEPS_WITH_ROUTINE) and create the step component. Update documentation accordingly.

**Q: How do I preserve data across page refreshes?**
A: See Example 8 and 9 in USAGE_EXAMPLES.md for save/load draft functionality using localStorage.

## 🐛 Found a Bug?

1. Check [WIZARD_CONTEXT.md](./WIZARD_CONTEXT.md) - "Troubleshooting"
2. Use the Debug Panel to inspect state
3. Verify the navigation scenario matches expected behavior
4. Report issue with:
   - Current step
   - includesRoutineStep value
   - Expected vs actual behavior
   - Steps to reproduce

---

**Last Updated**: 2024
**Version**: 1.0.0
**Maintainer**: Development Team