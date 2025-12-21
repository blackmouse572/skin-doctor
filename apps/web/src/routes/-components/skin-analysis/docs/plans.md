# Plan for Routine Improvement Feature

## Overview

Add a **conditional step** to the skin analysis wizard that allows users to input their current skincare routine for AI-powered improvement suggestions, or skip to receive a basic routine recommendation.

## Use Cases

1. **As a user**, I want to have a text area to fill in my current routine so that the AI can analyze and improve my routine.
2. **As a user**, I want to have quick action buttons to append products (Vitamin C, Toner, Moisturizer, etc.) so that I can quickly draft my current routine.
3. **As a user**, I want to have a skip button so that I can skip the routine improvement feature when I don't have any routine to improve.
4. **As a system**, I want to validate the input routine text area to ensure it meets minimum requirements before processing so that the AI can provide meaningful improvements.
5. **As a system**, if the user skips the routine improvement feature, I want to use current analyzed skin data to suggest a basic routine so that the user still receives value from the feature.

---

## User Flow

```
Step 1: Upload Photo
    ↓
Step 2: Fill Info (Describe Skin Concerns)
    ↓
Step 2.5: Choose Next Action
    ├─→ [Improve Routine] → Step 3: Routine Input → Step 4: Analyze → Step 5: Result
    ├─→ [Skip Routine] → Step 4: Analyze → Step 5: Result (with basic routine suggestion)
    └─→ [Check Condition] → Step 4: Analyze → Step 5: Result (no routine feature)
```

### Dynamic Step Behavior

- **Initial State**: Stepper shows 4 steps (Upload → Fill Info → Analyze → Result)
- **When "Improve Routine" clicked**: 
  - Stepper updates to 5 steps (Upload → Fill Info → **Routine Improvement** → Analyze → Result)
  - Navigate to new "Routine Improvement" step
- **When "Skip Routine" clicked**: 
  - Stepper updates to 5 steps with "Routine (Skipped)" indicator
  - Navigate to Analyze step
  - Flag `routineSkipped: true` in data
- **When "Check Condition" clicked**:
  - Keep original 4 steps
  - Navigate to Analyze step

---

## Requirements

### 1. Text Area for Routine Input

**Component**: `routine-improvement-step.tsx`

- **Multi-line textarea** with flexible height (min-height: 200px)
- **Placeholder text**: 
  ```
  Describe your current skincare routine in detail:
  
  Morning routine:
  • Cleanser: [product name/type]
  • Toner: [product name/type]
  • Serum: [product name/type]
  • Moisturizer: [product name/type]
  • Sunscreen: [product name/type]
  
  Evening routine:
  • Cleanser: [product name/type]
  • ...
  
  Special treatments (if any):
  • [product name/type, frequency]
  ```
- **Character counter**: Display current/max characters (e.g., "125/2000")
- **Auto-save**: Save to state on change (debounced)

### 2. Quick Action Buttons

**Product Suggestions**:
```typescript
const ROUTINE_PRODUCTS = [
  { label: 'Cleanser', emoji: '🧼' },
  { label: 'Toner', emoji: '💧' },
  { label: 'Vitamin C Serum', emoji: '🍊' },
  { label: 'Hyaluronic Acid', emoji: '💦' },
  { label: 'Niacinamide', emoji: '✨' },
  { label: 'Retinol', emoji: '🌙' },
  { label: 'Moisturizer', emoji: '🧴' },
  { label: 'Sunscreen SPF 50+', emoji: '☀️' },
  { label: 'Eye Cream', emoji: '👁️' },
  { label: 'Face Oil', emoji: '🌿' },
  { label: 'Clay Mask', emoji: '🎭' },
  { label: 'Sheet Mask', emoji: '📄' },
];
```

**Behavior**:
- Click to append: `", [Product Name]"` to textarea
- Format: Adds comma separator if textarea not empty
- Visual feedback: Brief highlight animation on click
- Badge style with hover effect

### 3. Skip Button

**Location**: Bottom of Routine Improvement step (alongside "Back" and "Continue")

**Label**: `"I don't have a routine yet"` or `"Skip this step"`

**Behavior**:
- Sets `routineSkipped: true` in form data
- Sets `currentRoutine: ""` (empty string)
- Navigates to Analyze step
- Shows info toast: "We'll suggest a basic routine based on your skin analysis"

### 4. Progress Bar Update

**Current Steps** (4 steps):
```typescript
const BASE_STEPS = [
  { step: 1, title: 'Upload' },
  { step: 2, title: 'Fill Info' },
  { step: 3, title: 'Analyze' },
  { step: 4, title: 'Result' },
];
```

**Updated Steps** (5 steps - conditional):
```typescript
const STEPS_WITH_ROUTINE = [
  { step: 1, title: 'Upload' },
  { step: 2, title: 'Fill Info' },
  { step: 3, title: 'Routine', optional: true }, // New step
  { step: 4, title: 'Analyze' },
  { step: 5, title: 'Result' },
];
```

**Implementation**:
- Use state to track which flow: `const [includesRoutineStep, setIncludesRoutineStep] = useState(false)`
- Dynamically render stepper based on flow
- Mark "Routine" step as optional/skipped with visual indicator

### 5. Input Validation

**Schema Update** (`schemas.ts`):
```typescript
export const routineImprovementStepSchema = v.object({
  currentRoutine: v.pipe(
    v.string(),
    v.minLength(50, 'Please provide at least 50 characters describing your routine'),
    v.maxLength(2000, 'Routine description must not exceed 2000 characters'),
  ),
  routineSkipped: v.optional(v.boolean(), false),
});

export type RoutineImprovementStepData = v.InferOutput<typeof routineImprovementStepSchema>;
```

**Validation Rules**:
- **Minimum**: 50 characters (not 5000 - that was a typo)
- **Maximum**: 2000 characters (reasonable for detailed routine)
- **If skipped**: Bypass validation, set `routineSkipped: true`
- **Empty check**: Show error if user tries to continue with empty field (unless skipped)

**Error Messages**:
- Too short: "Please provide more details about your routine (minimum 50 characters)"
- Too long: "Please shorten your routine description (maximum 2000 characters)"
- Empty: "Please describe your routine or click 'Skip' if you don't have one"

### 6. Step Navigation

**From Fill Info Step** (action card buttons):

```typescript
// Three action cards in FocusCardFooter
<ActionCard
  title="Improve my routine"
  icon={<ArrowsClockwise />}
  onAction={() => {
    // Update wizard to include routine step
    setIncludesRoutineStep(true);
    setCurrentStep(3); // Go to Routine step
  }}
/>

<ActionCard
  title="Skip to analysis"
  icon={<CheckCircle />}
  onAction={() => {
    // Mark as skipped, go to analyze
    setRoutineSkipped(true);
    setCurrentStep(4); // Go to Analyze step (step 4 in 5-step flow)
  }}
/>

<ActionCard
  title="Check my skin condition"
  variant="primary"
  icon={<FirstAid />}
  onAction={() => {
    // Default flow, no routine step
    setIncludesRoutineStep(false);
    setCurrentStep(3); // Go to Analyze step (step 3 in 4-step flow)
  }}
/>
```

**Navigation Logic**:
- Track user's choice in wizard state
- Update step numbers dynamically
- Preserve form data when navigating back/forward

---

## Technical Implementation

### File Structure

```
skin-analysis/
├── steps/
│   ├── upload-step.tsx
│   ├── fill-info-step.tsx
│   ├── routine-improvement-step.tsx     ← NEW
│   ├── analyze-step.tsx
│   └── result-step.tsx
├── schemas.ts                             ← UPDATE
├── types.ts                               ← UPDATE
├── skin-analysis-wizard.tsx               ← UPDATE
└── docs/
    └── plans.md
```

### New Component: `routine-improvement-step.tsx`

**Props**:
```typescript
interface RoutineImprovementStepProps {
  initialData?: RoutineImprovementStepData;
  onNext: (data: RoutineImprovementStepData) => void;
  onPrev: () => void;
  onSkip: () => void;
}
```

**Features**:
- Form with TanStack Form
- Textarea with character counter
- Quick action product badges
- Validation with Valibot
- Skip button with confirmation
- Back/Continue buttons

### Schema Updates

```typescript
// Add to schemas.ts
export interface SkinAnalysisData {
  upload: UploadStepData;
  fillInfo: FillInfoStepData;
  routineImprovement?: RoutineImprovementStepData; // Optional
}
```

### Wizard State Management

```typescript
// In skin-analysis-wizard.tsx
const [wizardFlow, setWizardFlow] = useState<'default' | 'with-routine' | 'routine-skipped'>('default');
const [routineData, setRoutineData] = useState<RoutineImprovementStepData | null>(null);

// Dynamic step calculation
const steps = wizardFlow === 'default' ? BASE_STEPS : STEPS_WITH_ROUTINE;
```

---

## UI/UX Specifications

### Visual Design

**Routine Improvement Step Layout**:
```
┌─────────────────────────────────────────────────┐
│  ✨ Improve Your Skincare Routine               │
│                                                  │
│  Tell us about your current routine so we can   │
│  suggest improvements based on your skin needs. │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Morning routine:                         │  │
│  │ • Cleanser: CeraVe Hydrating             │  │
│  │ • Moisturizer: Neutrogena Gel            │  │
│  │                                          │  │
│  │                                    125/2000  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  Quick Add: [🧼 Cleanser] [💧 Toner]           │
│            [🍊 Vitamin C] [✨ Niacinamide]      │
│            [🌙 Retinol] [☀️ Sunscreen] ...      │
│                                                  │
│  [← Back]  [Skip]           [Continue →]        │
└─────────────────────────────────────────────────┘
```

### Animations

- **Step entrance**: Fade in + slide from bottom (500ms)
- **Badge click**: Scale pulse effect (200ms)
- **Character counter**: Color change when approaching limit
  - Green: < 1800 chars
  - Yellow: 1800-1950 chars
  - Red: > 1950 chars

### Responsive Behavior

- **Desktop**: 2-column layout (form left, tips right)
- **Mobile**: Single column, stacked layout
- **Badges**: Wrap to multiple rows on small screens

---

## AI Integration Points

### When Routine Provided

**API Payload**:
```json
{
  "skinAnalysis": { /* skin data */ },
  "currentRoutine": "User's routine description...",
  "action": "improve"
}
```

**Expected Response**:
- Routine evaluation
- Product recommendations
- Order optimization
- Missing steps identification

### When Routine Skipped

**API Payload**:
```json
{
  "skinAnalysis": { /* skin data */ },
  "routineSkipped": true,
  "action": "suggest"
}
```

**Expected Response**:
- Basic routine template
- Essential products for skin type
- Step-by-step guide
- Budget-friendly alternatives

---

## Testing Checklist

- [ ] Text area accepts input and shows character count
- [ ] Quick action buttons append products correctly
- [ ] Validation prevents submission with < 50 characters
- [ ] Validation prevents submission with > 2000 characters
- [ ] Skip button navigates to Analyze step
- [ ] Skip sets `routineSkipped: true` in data
- [ ] Progress bar updates to 5 steps when routine included
- [ ] Progress bar shows skip indicator when skipped
- [ ] Back button returns to Fill Info step
- [ ] Form data persists when navigating back/forth
- [ ] Mobile responsive layout works correctly
- [ ] All three action cards in Fill Info work correctly

---

## Future Enhancements

1. **Product Database**: Autocomplete from common product names
2. **Routine Templates**: Pre-fill with common routine structures
3. **Morning/Evening Tabs**: Separate sections for AM/PM routines
4. **Product Images**: Visual representation of suggested products
5. **Routine Comparison**: Side-by-side before/after suggestions
6. **Save Routine**: Allow users to save for future reference

---

## Notes

- **Character limit corrected**: Changed from 5000 to 50-2000 (more reasonable)
- **Step numbering**: Dynamic based on user flow choice
- **Data structure**: Routine data is optional in final submission
- **Skip behavior**: Still progresses through wizard, just flags as skipped
- **Backward compatibility**: System works without routine data (optional feature)