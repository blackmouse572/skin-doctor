# Morning/Evening Routine Separation Feature

## 🌅🌙 Overview

The Routine Improvement step now features **separate sections** for Morning and Evening routines, providing a more organized and intuitive user experience.

---

## ✨ Key Features

### 1. **Dual Routine Sections**

```
┌─────────────────────────────────────────────────┐
│  ☀️ Morning Routine                             │
│  ┌───────────────────────────────────────────┐  │
│  │ Cleanser, Vitamin C, Moisturizer, SPF... │  │
│  │                                    120/1000  │
│  └───────────────────────────────────────────┘  │
│  [Quick Add Badges: 🧼 💧 🍊 ✨ 🌙 🧴 ☀️ ...]  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  🌙 Evening Routine                             │
│  ┌───────────────────────────────────────────┐  │
│  │ Oil cleanser, Retinol, Night cream...    │  │
│  │                                     95/1000  │
│  └───────────────────────────────────────────┘  │
│  [Quick Add Badges: 🧼 💧 🍊 ✨ 🌙 🧴 ☀️ ...]  │
└─────────────────────────────────────────────────┘

Total: 215/2000 characters (minimum 30 required)
```

### 2. **Independent Character Counters**
- Each section has its own 1000 character limit
- Color-coded feedback per section:
  - **Gray**: Empty (0 chars)
  - **Green**: Good (1-800 chars)
  - **Yellow**: Approaching limit (800-950 chars)
  - **Red**: Near maximum (>950 chars)

### 3. **Time-Specific Icons**
- ☀️ **Sun icon** for Morning Routine (amber color)
- 🌙 **Moon icon** for Evening Routine (indigo color)

### 4. **Individual Quick-Add Badges**
- Each section has its own set of product badges
- Click to append products to the respective routine
- Same 12 products available for both sections

---

## 📊 Data Structure

### Schema Definition

```typescript
export const routineImprovementStepSchema = v.object({
  morningRoutine: v.optional(v.string(), ''),
  eveningRoutine: v.optional(v.string(), ''),
  routineSkipped: v.optional(v.boolean(), false),
});
```

### Custom Validation

```typescript
export const validateRoutineImprovement = (
  data: RoutineImprovementStepData
): boolean => {
  if (data.routineSkipped) return true;
  
  const morningLength = data.morningRoutine?.length || 0;
  const eveningLength = data.eveningRoutine?.length || 0;
  
  // Require at least 30 characters total
  return morningLength + eveningLength >= 30;
};
```

### Example Data

**Complete Routine:**
```json
{
  "morningRoutine": "🧼 CeraVe Cleanser, 🍊 Vitamin C Serum, 🧴 Moisturizer, ☀️ Sunscreen SPF 50+",
  "eveningRoutine": "🧼 Oil Cleanser, 💧 Toner, 🌙 Retinol (3x/week), 🧴 Night Cream",
  "routineSkipped": false
}
```

**Morning Only:**
```json
{
  "morningRoutine": "🧼 Cleanser, ☀️ Sunscreen SPF 50+",
  "eveningRoutine": "",
  "routineSkipped": false
}
```

**Evening Only:**
```json
{
  "morningRoutine": "",
  "eveningRoutine": "🧼 Double cleanse, 🌙 Retinol, 🧴 Night cream",
  "routineSkipped": false
}
```

**Skipped:**
```json
{
  "morningRoutine": "",
  "eveningRoutine": "",
  "routineSkipped": true
}
```

---

## 🎨 UI Layout

### Full Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│                   Improve your routine                       │
│  Tell us about your current skincare routine to get...      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────────────────────────────┐
│ LEFT COLUMN      │ RIGHT COLUMN                             │
│                  │                                          │
│ [Photo Preview]  │ ┌──────────────────────────────────────┐ │
│                  │ │ ☀️ Morning Routine                   │ │
│ ┌──────────────┐ │ │ [Textarea with counter]              │ │
│ │ 💡 Tips      │ │ │ [Quick Add Badges...]                │ │
│ │ - Product    │ │ └──────────────────────────────────────┘ │
│ │   names      │ │                                          │
│ │ - Separate   │ │ ┌──────────────────────────────────────┐ │
│ │   AM/PM      │ │ │ 🌙 Evening Routine                   │ │
│ │ - Frequency  │ │ │ [Textarea with counter]              │ │
│ │ - Reactions  │ │ │ [Quick Add Badges...]                │ │
│ │              │ │ └──────────────────────────────────────┘ │
│ │ Example:     │ │                                          │
│ │ Morning:...  │ │ Total: 215/2000 characters              │
│ │ Evening:...  │ │                                          │
│ └──────────────┘ │                                          │
└──────────────────┴──────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Choose next step                                            │
│ ┌──────────┬──────────┬────────────────────────────────┐   │
│ │ Go Back  │ Skip     │ Continue with my routine       │   │
│ │          │          │ [PRIMARY - AI POWERED]         │   │
│ └──────────┴──────────┴────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Component State

```typescript
const [morningCount, setMorningCount] = useState(
  initialData?.morningRoutine?.length || 0
);
const [eveningCount, setEveningCount] = useState(
  initialData?.eveningRoutine?.length || 0
);

const totalChars = morningCount + eveningCount;
```

### Quick-Add Handler

```typescript
const handleProductClick = (
  product: { label: string; emoji: string },
  fieldName: 'morningRoutine' | 'eveningRoutine'
) => {
  form.setFieldValue(fieldName, (prev) => {
    const productText = `${product.emoji} ${product.label}`;
    const newRoutine = prev ? `${prev}, ${productText}` : productText;
    
    if (fieldName === 'morningRoutine') {
      setMorningCount(newRoutine.length);
    } else {
      setEveningCount(newRoutine.length);
    }
    
    return newRoutine;
  });
};
```

### Validation on Submit

```typescript
onSubmit: async ({ value }) => {
  if (!validateRoutineImprovement(value)) {
    toast.error(
      'Please provide at least 30 characters total describing your routine'
    );
    return;
  }
  onNext(value);
}
```

---

## 📝 Validation Rules

| Rule | Value | Description |
|------|-------|-------------|
| **Morning Min** | 0 chars | Optional field |
| **Morning Max** | 1000 chars | Per-section limit |
| **Evening Min** | 0 chars | Optional field |
| **Evening Max** | 1000 chars | Per-section limit |
| **Total Min** | 30 chars | Combined requirement (if not skipped) |
| **Total Max** | 2000 chars | Combined maximum |

### Validation Logic

```typescript
if (routineSkipped) {
  return true; // Skip validation
}

const total = morningRoutine.length + eveningRoutine.length;

if (total < 30) {
  return false; // Show error: "At least 30 characters required"
}

if (morningRoutine.length > 1000) {
  return false; // Show error: "Morning routine too long"
}

if (eveningRoutine.length > 1000) {
  return false; // Show error: "Evening routine too long"
}

return true;
```

---

## 🎯 User Experience Benefits

### Before (Single Field)
❌ Long, unstructured text blob  
❌ Difficult to parse AM vs PM routines  
❌ Hard to maintain organization  
❌ Confusing for users with different routines  

### After (Separate Sections)
✅ Clear separation of AM/PM routines  
✅ Each section has its own character counter  
✅ Visual distinction with time-specific icons  
✅ Easier for AI to parse and provide targeted suggestions  
✅ Users can fill only one section if needed  
✅ Better mobile experience with separate cards  

---

## 🧪 Testing Scenarios

### Test Case 1: Both Routines Provided
1. Fill morning routine (50 chars)
2. Fill evening routine (50 chars)
3. ✅ Total: 100 chars (passes validation)
4. Click "Continue"
5. ✅ Should proceed to Analyze step

### Test Case 2: Morning Only
1. Fill morning routine (50 chars)
2. Leave evening empty
3. ✅ Total: 50 chars (passes validation)
4. Click "Continue"
5. ✅ Should proceed to Analyze step

### Test Case 3: Evening Only
1. Leave morning empty
2. Fill evening routine (50 chars)
3. ✅ Total: 50 chars (passes validation)
4. Click "Continue"
5. ✅ Should proceed to Analyze step

### Test Case 4: Insufficient Total
1. Fill morning routine (15 chars)
2. Fill evening routine (10 chars)
3. ❌ Total: 25 chars (fails validation)
4. Click "Continue"
5. ✅ Should show error toast
6. ✅ Should NOT proceed

### Test Case 5: Quick-Add Products
1. Click "🧼 Cleanser" in morning section
2. ✅ Should append to morning textarea only
3. Click "🌙 Retinol" in evening section
4. ✅ Should append to evening textarea only
5. ✅ Character counters update independently

### Test Case 6: Character Limit Per Section
1. Fill morning routine with 1001 chars
2. ✅ Should be truncated at 1000 chars
3. ✅ Counter should show 1000/1000 in red

### Test Case 7: Skip Functionality
1. Click "Skip this step"
2. ✅ Should show toast message
3. ✅ Should navigate to Analyze step
4. ✅ Both routines empty, routineSkipped: true

---

## 🚀 API Integration

### Request Format

```typescript
POST /api/skin-analysis/improve-routine

{
  "skinAnalysis": {
    "skinType": "combination",
    "concerns": ["acne", "dryness"]
  },
  "morningRoutine": "🧼 CeraVe Cleanser, 🍊 Vitamin C Serum, ☀️ SPF 50",
  "eveningRoutine": "🧼 Oil Cleanser, 🌙 Retinol, 🧴 Night Cream",
  "action": "improve"
}
```

### Expected Response

```typescript
{
  "morningImprovements": [
    {
      "step": "add_after",
      "after": "Cleanser",
      "product": "Toner",
      "reason": "Balance pH after cleansing"
    },
    {
      "step": "reorder",
      "product": "Vitamin C Serum",
      "newPosition": 2,
      "reason": "Apply on damp skin after toner"
    }
  ],
  "eveningImprovements": [
    {
      "step": "add",
      "product": "Hydrating Serum",
      "reason": "Buffer before retinol to reduce irritation"
    }
  ],
  "morningScore": 7.5,
  "eveningScore": 8.0,
  "overallScore": 7.75
}
```

---

## 📚 Documentation Updates

Files updated to reflect Morning/Evening separation:
- ✅ `implementation-summary.md` - Schema and validation
- ✅ `QUICKSTART.md` - Usage examples
- ✅ `MORNING-EVENING-FEATURE.md` - This file
- ⏳ `plans.md` - To be updated

---

## 🎨 Design Tokens

### Colors

```typescript
// Morning Section
const MORNING_ICON_COLOR = 'text-amber-500';
const MORNING_LABEL = 'Morning Routine';

// Evening Section
const EVENING_ICON_COLOR = 'text-indigo-500';
const EVENING_LABEL = 'Evening Routine';

// Character Counter
const COUNTER_COLORS = {
  empty: 'text-muted-foreground',      // Gray
  good: 'text-emerald-600',            // Green
  warning: 'text-yellow-600',          // Yellow
  danger: 'text-destructive',          // Red
};
```

### Thresholds

```typescript
const CHAR_LIMITS = {
  perSection: 1000,
  totalMin: 30,
  totalMax: 2000,
  warningThreshold: 800,
  dangerThreshold: 950,
};
```

---

## 💡 Future Enhancements

### Phase 2 (Planned)
- [ ] Time-specific product recommendations
  - Morning: Focus on protection (SPF, antioxidants)
  - Evening: Focus on repair (retinol, peptides)
- [ ] Drag-and-drop reordering within each section
- [ ] Product conflict detection (e.g., retinol + vitamin C)
- [ ] Routine templates by time of day

### Phase 3 (Future)
- [ ] Weekly routine variations
  - Active ingredients rotation
  - Special treatments schedule
- [ ] Product expiry tracking
- [ ] Routine comparison (current vs suggested)
- [ ] Export as PDF with AM/PM sections

---

## ✅ Benefits Summary

### For Users
✅ Clear organization of AM vs PM routines  
✅ No more scrolling through long text  
✅ Easy to understand what goes when  
✅ Flexibility to fill one or both sections  

### For AI Analysis
✅ Structured data easier to parse  
✅ Can provide time-specific recommendations  
✅ Better understanding of routine context  
✅ Identify missing steps per time of day  

### For Development
✅ Cleaner data structure  
✅ Easier validation logic  
✅ Better separation of concerns  
✅ More maintainable code  

---

**Status**: ✅ Implemented  
**Version**: 1.1.0  
**Last Updated**: December 2024