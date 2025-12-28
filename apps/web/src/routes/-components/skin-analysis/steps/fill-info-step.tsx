'use client';

import {
  ArrowLeftIcon,
  ArrowsClockwise,
  CaretLeftIcon,
  CheckCircle,
  FastForwardIcon,
  FirstAid,
  ScanIcon,
  Sparkle,
} from '@phosphor-icons/react';
import { Button } from '@repo/ui/components/button';
import { Card, CardContent } from '@repo/ui/components/card';
import { Field, FieldError } from '@repo/ui/components/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@repo/ui/components/input-group';
import { useForm } from '@tanstack/react-form';
import * as v from 'valibot';

import { Badge } from '@repo/ui/components/badge';
import {
  FocusCard,
  FocusCardContent,
  FocusCardFooter,
} from '@repo/ui/components/focus-card';
import { ActionCard, UploadedImage } from '../components';
import { fillInfoStepSchema, type FillInfoStepData } from '../schemas';
import { Form } from '@repo/ui/components/form';

type FormMeta = {
  submitAction: 'improveRoutine' | 'skipToAnalyze' | null;
};

const defaultMeta: FormMeta = {
  submitAction: null,
};

interface FillInfoStepProps {
  initialData?: FillInfoStepData;
  uploadedImage?: File | { preview?: string };
  onNext: (data: FillInfoStepData) => void;
  onPrev: () => void;
  onImproveRoutine: (data: FillInfoStepData) => void;
  onSkipToAnalyze: (data: FillInfoStepData) => void;
}

const SUGGESTIONS = [
  'Hidden acne',
  'Uneven skin tone',
  'Large pores',
  'Wrinkles',
  'Dryness',
  'Oily skin',
];

export function FillInfoStep({
  initialData,
  uploadedImage,
  onNext,
  onPrev,
  onImproveRoutine,
  onSkipToAnalyze,
}: FillInfoStepProps) {
  const form = useForm({
    defaultValues: {
      symptoms: initialData?.symptoms || '',
      description: initialData?.description || '',
      duration: initialData?.duration || '',
      currentRoutine: initialData?.currentRoutine || '',
    } as FillInfoStepData,
    validators: {
      onBlur: fillInfoStepSchema,
    },
    onSubmitMeta: defaultMeta,
    onSubmit: async ({ value, meta }) => {
      switch (meta.submitAction) {
        case 'improveRoutine':
          onImproveRoutine(value);
          break;
        case 'skipToAnalyze':
          onSkipToAnalyze(value);
          break;
        default:
          onNext(value);
          break;
      }
    },
    onSubmitInvalid() {
      const InvalidInput = document.querySelector(
        '[aria-invalid="true"]',
      ) as HTMLInputElement;

      InvalidInput?.focus();
    },
  });

  const handleSuggestionClick = (
    suggestion: string,
    currentDescription: string,
    setValue: (val: string) => void,
  ) => {
    const newDescription = currentDescription
      ? `${currentDescription}, ${suggestion}`
      : suggestion;
    setValue(newDescription);
  };

  return (
    <FocusCard className="w-full max-w-6xl mx-auto  animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FocusCardContent className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mx-0 max-w-max">
        {/* Left Column - Image */}
        <div className="lg:col-span-5">
          <div className="sticky top-8">
            <UploadedImage
              uploadedImage={uploadedImage}
              showPrivacyMessage={true}
            />
          </div>
        </div>

        {/* Right Column - Form */}
        <Form
          id="fill-info-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="lg:col-span-7 flex flex-col gap-8"
        >
          <Card className="flex flex-col flex-1">
            <CardContent className="flex flex-col flex-1">
              <div className="space-y-6 flex flex-col flex-1">
                <form.Field
                  name="description"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field
                        data-invalid={isInvalid}
                        className="space-y-4 flex flex-col flex-1"
                      >
                        <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                          <Sparkle
                            className="w-5 h-5 text-primary"
                            weight="fill"
                          />
                          <label htmlFor={field.name}>
                            What is your main skin concern?
                          </label>
                        </div>

                        <InputGroup className="relative flex-1 flex flex-col">
                          <InputGroupTextarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            maxLength={5000}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Example: My skin often gets red when out in the sun, T-zone is oily but cheeks are dry and flaky..."
                            className="flex-1 resize-none min-h-80"
                            aria-invalid={isInvalid}
                          />
                          <InputGroupAddon
                            align="block-end"
                            className="absolute right-0 bottom-0 pointer-events-none"
                          >
                            <InputGroupText className="text-xs bg-background/20 backdrop-blur-sm px-2 py-1 rounded-md ">
                              {field.state.value.length}/5000
                            </InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>

                        <FieldError errors={field.state.meta.errors} />

                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                            Suggestions:
                          </span>
                          {SUGGESTIONS.map((suggestion) => (
                            <Badge
                              key={suggestion}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() =>
                                handleSuggestionClick(
                                  suggestion,
                                  field.state.value,
                                  field.handleChange,
                                )
                              }
                            >
                              {suggestion}
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
        </Form>
      </FocusCardContent>
      <FocusCardFooter className="space-y-4">
        <h3 className="text-xl font-bold">Choose next step</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Secondary Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionCard
              title="Retake photo"
              description="Capture a new image for analysis."
              icon={<ScanIcon className="w-6 h-6" />}
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
              title="Skip to analysis"
              description="Get AI skin analysis without routine improvement."
              icon={<FastForwardIcon className="w-6 h-6" weight="fill" />}
              actionLabel="Skip"
              onAction={() =>
                form.handleSubmit({ submitAction: 'skipToAnalyze' })
              }
              iconContainerClassName="bg-purple-100 text-purple-600 group-hover:scale-110"
            />
          </div>

          {/* Main Action Card */}
          <ActionCard
            variant="primary"
            title="My skin routine needs improvement"
            description="Get personalized recommendations to enhance your skincare routine."
            icon={<FirstAid className="w-32 h-32" weight="fill" />}
            badge="RECOMMENDED"
            actionLabel="Fill my routine"
            onAction={() =>
              form.handleSubmit({ submitAction: 'improveRoutine' })
            }
            buttonClassName="place-item-end"
          />
        </div>
      </FocusCardFooter>
    </FocusCard>
  );
}
