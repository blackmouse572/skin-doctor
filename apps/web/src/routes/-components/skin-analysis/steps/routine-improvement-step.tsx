'use client';

import {
  ArrowLeftIcon,
  ArrowsClockwise,
  CaretLeft,
  FastForwardIcon,
  Lightbulb,
  Moon,
  Sun,
} from '@phosphor-icons/react';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@repo/ui/components/card';
import { Field, FieldError } from '@repo/ui/components/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@repo/ui/components/input-group';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { toast } from 'sonner';
import * as v from 'valibot';

import { Badge } from '@repo/ui/components/badge';
import {
  FocusCard,
  FocusCardContent,
  FocusCardFooter,
} from '@repo/ui/components/focus-card';
import { Form } from '@repo/ui/components/form';
import { cn } from '@repo/ui/lib/utils';
import { ActionCard, UploadedImage } from '../components';
import {
  routineImprovementStepSchema,
  validateRoutineImprovement,
  type RoutineImprovementStepData,
} from '../schemas';

interface RoutineImprovementStepProps {
  initialData?: RoutineImprovementStepData;
  uploadedImage?: File | { preview?: string };
  onNext: (data: RoutineImprovementStepData) => void;
  onPrev: () => void;
  onSkip: () => void;
}

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

export function RoutineImprovementStep({
  initialData,
  uploadedImage,
  onNext,
  onPrev,
  onSkip,
}: RoutineImprovementStepProps) {
  const [morningCount, setMorningCount] = useState(
    initialData?.morningRoutine?.length || 0,
  );
  const [eveningCount, setEveningCount] = useState(
    initialData?.eveningRoutine?.length || 0,
  );

  const form = useForm({
    defaultValues: initialData || {
      morningRoutine: '',
      eveningRoutine: '',
      routineSkipped: false,
    },
    validators: {
      onSubmit: ({ value }) => {
        // First validate with valibot schema
        const result = v.safeParse(routineImprovementStepSchema, value);
        if (!result.success) {
          return result.issues.map((issue) => issue.message).join(', ');
        }

        // Then apply custom validation
        if (!validateRoutineImprovement(result.output)) {
          return 'Please provide at least 30 characters total across morning and evening routines, or skip this step.';
        }

        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      onNext(value);
    },
    onSubmitInvalid: async () => {
      toast.error(
        'Please provide at least 30 characters total in your routines, or skip this step.',
      );
    },
  });

  const handleProductClick = (
    product: { label: string; emoji: string },
    fieldName: 'morningRoutine' | 'eveningRoutine',
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

  const handleSkip = () => {
    onSkip();
  };

  const maxChars = 1000;

  return (
    <FocusCard className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FocusCardContent className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mx-0 max-w-max">
        {/* Left Column - Info & Tips */}
        <div className="lg:col-span-5">
          <div className="sticky top-8 space-y-4">
            <UploadedImage uploadedImage={uploadedImage} />
          </div>
        </div>

        {/* Right Column - Form */}
        <Form
          id="routine-improvement-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="lg:col-span-7 flex flex-col gap-6"
        >
          {/* Morning Routine Section */}
          <Card className="flex flex-col">
            <CardContent className="flex flex-col">
              <div className="space-y-6 flex flex-col">
                <form.Field
                  name="morningRoutine"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field
                        data-invalid={isInvalid}
                        className="space-y-4 flex flex-col"
                      >
                        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                          <Sun
                            className="w-5 h-5 text-amber-500"
                            weight="fill"
                          />
                          <label htmlFor={field.name}>Morning Routine</label>
                        </div>

                        <InputGroup className="relative flex flex-col">
                          <InputGroupTextarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            maxLength={maxChars}
                            onChange={(e) => {
                              field.handleChange(e.target.value);
                              setMorningCount(e.target.value.length);
                            }}
                            placeholder="Example: CeraVe Hydrating Cleanser, Toner, Vitamin C Serum, Moisturizer, Sunscreen SPF 50..."
                            className="resize-none min-h-32"
                            aria-invalid={isInvalid}
                          />
                          <InputGroupAddon
                            align="block-end"
                            className="absolute right-0 bottom-0 pointer-events-none"
                          >
                            <InputGroupText
                              className={`text-xs bg-background/20 backdrop-blur-sm px-2 py-1 rounded-md`}
                            >
                              {morningCount}/{maxChars}
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}

                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                            Quick Add:
                          </span>
                          {ROUTINE_PRODUCTS.map((product) => (
                            <Badge
                              key={`morning-${product.label}`}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() =>
                                handleProductClick(product, 'morningRoutine')
                              }
                            >
                              <span className="mr-1">{product.emoji}</span>
                              {product.label}
                            </Badge>
                          ))}
                        </div>
                      </Field>
                    );
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Evening Routine Section */}
          <Card className="flex flex-col">
            <CardContent className="flex flex-col">
              <form.Field
                name="eveningRoutine"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field
                      data-invalid={isInvalid}
                      className="space-y-4 flex flex-col"
                    >
                      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Moon
                          className="w-5 h-5 text-indigo-500"
                          weight="fill"
                        />
                        <label htmlFor={field.name}>Evening Routine</label>
                      </div>

                      <InputGroup className="relative flex flex-col">
                        <InputGroupTextarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          maxLength={maxChars}
                          onChange={(e) => {
                            field.handleChange(e.target.value);
                            setEveningCount(e.target.value.length);
                          }}
                          placeholder="Example: Oil cleanser, Foam cleanser, Toner, Niacinamide serum, Retinol (3x/week), Night cream..."
                          className="resize-none min-h-32"
                          aria-invalid={isInvalid}
                        />
                        <InputGroupAddon
                          align="block-end"
                          className="absolute right-0 bottom-0 pointer-events-none"
                        >
                          <InputGroupText
                            className={`text-xs bg-background/20 backdrop-blur-sm px-2 py-1 rounded-md`}
                          >
                            {eveningCount}/{maxChars}
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}

                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                          Quick Add:
                        </span>
                        {ROUTINE_PRODUCTS.map((product) => (
                          <Badge
                            key={`evening-${product.label}`}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() =>
                              handleProductClick(product, 'eveningRoutine')
                            }
                          >
                            <span className="mr-1">{product.emoji}</span>
                            {product.label}
                          </Badge>
                        ))}
                      </div>
                    </Field>
                  );
                }}
              />
            </CardContent>
          </Card>

          <TipCard />
        </Form>
      </FocusCardContent>

      <FocusCardFooter className="space-y-4">
        <h3 className="text-xl font-bold">Choose next step</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Secondary Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard
              title="Go back"
              description="Return to previous step to edit your information."
              icon={<CaretLeft className="w-6 h-6" />}
              actionLabel="Back"
              onAction={onPrev}
              iconContainerClassName="bg-gray-100 text-gray-600 group-hover:scale-110"
              footerSlot={
                <Button
                  variant="secondary"
                  onClick={onPrev}
                  className="w-full shadow"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back
                </Button>
              }
            />

            <ActionCard
              title="Don't have a routine yet?"
              description="Skip routine improvement and proceed to analysis."
              icon={<FastForwardIcon className="w-6 h-6" weight="fill" />}
              actionLabel="Skip"
              onAction={handleSkip}
              iconContainerClassName="bg-purple-100 text-purple-600 group-hover:scale-110"
            />
          </div>

          {/* Main Action Card */}
          <ActionCard
            variant="primary"
            title="Continue with my routine"
            description="AI will analyze your routine and provide personalized improvement suggestions."
            icon={<ArrowsClockwise className="w-32 h-32" weight="fill" />}
            badge="AI POWERED"
            actionLabel="Continue"
            onAction={async () => {
              // Validate before submitting
              const result = v.safeParse(
                routineImprovementStepSchema,
                form.state.values,
              );

              if (!result.success) {
                toast.error('Please fill in your routine information.');
                return;
              }

              if (!validateRoutineImprovement(result.output)) {
                // Mark fields as touched to show validation errors
                form.setFieldMeta('morningRoutine', (prev) => ({
                  ...prev,
                  isTouched: true,
                }));
                form.setFieldMeta('eveningRoutine', (prev) => ({
                  ...prev,
                  isTouched: true,
                }));

                toast.error(
                  'Please provide at least 30 characters total across morning and evening routines.',
                );
                return;
              }

              form.handleSubmit();
            }}
            buttonClassName="place-item-end"
          />
        </div>
      </FocusCardFooter>
    </FocusCard>
  );
}

export function TipCard({
  className,
  ...rest
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <Card
      className={cn(
        'border-ui-tag-blue-border bg-ui-tag-blue-bg shadow-sm text-ui-tag-blue-text',
        'gap-3 border-squircle-lg',
        className,
      )}
      {...rest}
    >
      <CardHeader className="text-ui-tag-blue-text">
        <div className="flex items-center gap-1">
          <Lightbulb
            weight="duotone"
            className="text-ui-tag-blue-icon"
            size="24"
          />
          <h3 className="text-lg font-semibold">Tips for better analysis</h3>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm mt-2">
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>
              Include product names or types (e.g., CeraVe Hydrating Cleanser)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>Click quick-add badges to easily build your routine</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>
              Mention frequency of treatments (e.g., clay mask 2x/week)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600">•</span>
            <span>Note products that irritate your skin or work well</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="w-full">
        <div className="mt-4 p-3 bg-ui-tag-blue-bg-hover rounded-lg w-full">
          <p className="text-xs font-semibold text-blue-900 mb-1">Example:</p>
          <p className="text-xs text-blue-800">
            <strong>Morning:</strong> CeraVe Cleanser, Vitamin C Serum,
            Moisturizer, SPF 50
            <br />
            <strong>Evening:</strong> Oil cleanser, Toner, Retinol (3x/week),
            Night cream
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
