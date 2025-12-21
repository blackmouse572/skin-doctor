# ActionCard Footer Slot Documentation

## 🎯 Overview

The `ActionCard` component now supports a flexible `footerSlot` prop that allows parents to customize the footer content instead of being limited to a predefined button.

---

## 📝 Updated Interface

```typescript
interface ActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  actionLabel: string;              // Used if no footerSlot provided
  onAction?: () => void;             // Used if no footerSlot provided
  variant?: 'primary' | 'secondary';
  badge?: string;
  className?: string;
  iconContainerClassName?: string;
  buttonClassName?: string;
  footerSlot?: ReactNode;           // NEW - Custom footer content
}
```

---

## 🎨 Component Behavior

### Default Behavior (No footerSlot)
When `footerSlot` is **not provided**, the component renders the default button:

```tsx
<ActionCard
  title="Check my skin"
  description="Get AI analysis"
  icon={<FirstAid />}
  actionLabel="Start Analysis"
  onAction={() => handleAnalysis()}
/>

// Renders:
// <Button onClick={handleAnalysis}>
//   Start Analysis <ArrowRight />
// </Button>
```

### Custom Footer (With footerSlot)
When `footerSlot` **is provided**, it completely replaces the default button:

```tsx
<ActionCard
  title="Check my skin"
  description="Get AI analysis"
  icon={<FirstAid />}
  actionLabel="Start Analysis"  // Ignored when footerSlot present
  onAction={() => {}}            // Ignored when footerSlot present
  footerSlot={
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleCancel}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    </div>
  }
/>
```

---

## 💡 Usage Examples

### Example 1: Multiple Buttons

```tsx
<ActionCard
  title="Save your progress"
  description="You can save and continue later"
  icon={<FloppyDisk />}
  variant="secondary"
  footerSlot={
    <div className="flex gap-2 mt-4">
      <Button variant="outline" size="sm" onClick={handleSkip}>
        Skip
      </Button>
      <Button size="sm" onClick={handleSave}>
        Save & Exit
      </Button>
    </div>
  }
/>
```

### Example 2: Custom Link

```tsx
<ActionCard
  title="Learn more"
  description="Read our guide about skincare routines"
  icon={<BookOpen />}
  variant="secondary"
  footerSlot={
    <a 
      href="/guides/skincare" 
      className="text-sm text-primary hover:underline mt-4 inline-block"
    >
      Read the guide →
    </a>
  }
/>
```

### Example 3: Loading State

```tsx
<ActionCard
  title="Processing"
  description="Please wait while we analyze your skin"
  icon={<Spinner />}
  variant="primary"
  footerSlot={
    <Button size="lg" disabled className="w-full sm:w-auto">
      <Spinner className="mr-2 h-4 w-4 animate-spin" />
      Analyzing...
    </Button>
  }
/>
```

### Example 4: No Footer

```tsx
<ActionCard
  title="Information"
  description="This is just informational, no action needed"
  icon={<Info />}
  variant="secondary"
  footerSlot={null}  // No footer rendered
/>
```

### Example 5: Complex Footer with Status

```tsx
<ActionCard
  title="Upload complete"
  description="3 photos uploaded successfully"
  icon={<CheckCircle />}
  variant="secondary"
  footerSlot={
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 text-sm text-emerald-600">
        <CheckCircle className="w-4 h-4" />
        <span>All files verified</span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleAddMore}>
          Add More
        </Button>
        <Button size="sm" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  }
/>
```

---

## 🔄 Migration Guide

### Before (Hardcoded Button)
```tsx
// Limited to single button with fixed styling
<ActionCard
  title="Continue"
  description="Proceed to next step"
  icon={<ArrowRight />}
  actionLabel="Next"
  onAction={handleNext}
/>
```

### After (Flexible Footer)
```tsx
// Option 1: Keep default behavior (no changes needed)
<ActionCard
  title="Continue"
  description="Proceed to next step"
  icon={<ArrowRight />}
  actionLabel="Next"
  onAction={handleNext}
  // Works exactly the same!
/>

// Option 2: Use custom footer
<ActionCard
  title="Continue"
  description="Proceed to next step"
  icon={<ArrowRight />}
  footerSlot={
    <div className="flex justify-between mt-4">
      <Button variant="ghost" onClick={handleBack}>
        Back
      </Button>
      <Button onClick={handleNext}>
        Next Step
      </Button>
    </div>
  }
/>
```

---

## 🎨 Styling Considerations

### Primary Variant
The primary variant has a dark background (`bg-slate-900`), so use light text colors:

```tsx
<ActionCard
  variant="primary"
  title="Premium Feature"
  description="Unlock advanced analysis"
  icon={<Crown />}
  footerSlot={
    <Button 
      size="lg"
      className="bg-emerald-500 hover:bg-emerald-600 text-white"
      onClick={handleUpgrade}
    >
      Upgrade Now
    </Button>
  }
/>
```

### Secondary Variant
The secondary variant has a light background (`bg-card`), use standard button variants:

```tsx
<ActionCard
  variant="secondary"
  title="Optional Step"
  description="You can skip this"
  icon={<Skip />}
  footerSlot={
    <Button 
      variant="secondary"  // Standard secondary styling
      className="mt-4"
      onClick={handleSkip}
    >
      Skip for now
    </Button>
  }
/>
```

---

## ✅ Best Practices

### 1. **Maintain Consistent Spacing**
Always add margin-top to your footer content to maintain spacing:

```tsx
// ✅ Good
footerSlot={
  <Button className="mt-4" onClick={handleAction}>
    Continue
  </Button>
}

// ❌ Bad (no spacing)
footerSlot={
  <Button onClick={handleAction}>
    Continue
  </Button>
}
```

### 2. **Align Multiple Buttons**
Use flexbox for proper alignment:

```tsx
// ✅ Good
footerSlot={
  <div className="flex gap-2 mt-4">
    <Button variant="outline">Cancel</Button>
    <Button>Confirm</Button>
  </div>
}

// ❌ Bad (buttons not aligned)
footerSlot={
  <div className="mt-4">
    <Button variant="outline">Cancel</Button>
    <Button>Confirm</Button>
  </div>
}
```

### 3. **Keep It Simple**
The footer should complement the card, not overwhelm it:

```tsx
// ✅ Good (clear, focused action)
footerSlot={
  <Button onClick={handleSubmit}>
    Submit Form
  </Button>
}

// ❌ Bad (too complex)
footerSlot={
  <div>
    <p className="text-xs mb-2">Choose an option:</p>
    <div className="grid grid-cols-3 gap-1">
      <Button size="sm">Option 1</Button>
      <Button size="sm">Option 2</Button>
      <Button size="sm">Option 3</Button>
    </div>
    <div className="mt-2 flex justify-between">
      <Button variant="ghost" size="sm">Back</Button>
      <Button variant="ghost" size="sm">Skip</Button>
    </div>
  </div>
}
```

---

## 🧪 Testing Scenarios

### Test Case 1: Default Button
```tsx
<ActionCard
  title="Test"
  description="Default button test"
  icon={<Icon />}
  actionLabel="Click Me"
  onAction={mockFn}
/>
// ✅ Should render default button with "Click Me" text
// ✅ Should call mockFn when clicked
```

### Test Case 2: Custom Footer
```tsx
<ActionCard
  title="Test"
  description="Custom footer test"
  icon={<Icon />}
  footerSlot={<button>Custom</button>}
/>
// ✅ Should render custom button
// ✅ Should NOT render default button
```

### Test Case 3: No Footer
```tsx
<ActionCard
  title="Test"
  description="No footer test"
  icon={<Icon />}
  footerSlot={null}
/>
// ✅ Should not render any footer
```

---

## 📊 Comparison

| Feature | Without footerSlot | With footerSlot |
|---------|-------------------|-----------------|
| **Flexibility** | Single button only | Any React content |
| **Button count** | 1 | Unlimited |
| **Custom styling** | Limited to buttonClassName | Full control |
| **Complex layouts** | Not possible | Fully possible |
| **Backward compatible** | N/A | ✅ Yes |

---

## 🚀 Real-World Use Cases

### Use Case 1: Wizard Steps
```tsx
<ActionCard
  title="Step 2 of 4"
  description="Enter your skincare routine"
  icon={<List />}
  footerSlot={
    <div className="flex justify-between mt-4 w-full">
      <Button variant="outline" onClick={handlePrevious}>
        ← Previous
      </Button>
      <Button onClick={handleNext}>
        Next →
      </Button>
    </div>
  }
/>
```

### Use Case 2: Conditional Actions
```tsx
<ActionCard
  title="Review Changes"
  description="Please review before submitting"
  icon={<Eye />}
  footerSlot={
    hasChanges ? (
      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={handleDiscard}>
          Discard
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    ) : (
      <p className="text-sm text-muted-foreground mt-4">
        No changes to save
      </p>
    )
  }
/>
```

### Use Case 3: External Link
```tsx
<ActionCard
  title="Learn More"
  description="Check our documentation"
  icon={<BookOpen />}
  footerSlot={
    <Button 
      variant="outline" 
      className="mt-4"
      onClick={() => window.open('/docs', '_blank')}
    >
      Open Documentation
      <ExternalLink className="ml-2 w-4 h-4" />
    </Button>
  }
/>
```

---

## 📝 Notes

- `footerSlot` takes precedence over `actionLabel` and `onAction`
- When `footerSlot` is provided, `actionLabel` and `onAction` are ignored
- Both primary and secondary variants support `footerSlot`
- Setting `footerSlot={null}` will render no footer at all
- The default button includes an arrow icon automatically
- Custom footers should handle their own icons

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: ✅ Implemented