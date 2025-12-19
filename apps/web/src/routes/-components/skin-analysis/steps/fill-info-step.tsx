'use client';

import {
  ArrowRight,
  ArrowsClockwise,
  CheckCircle,
  FirstAid,
  Scan,
  ScanIcon,
  ShoppingBag,
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
import * as React from 'react';
import { toast } from 'sonner';

import { fillInfoStepSchema, type FillInfoStepData } from '../schemas';
import { FocusCard, FocusCardContent } from '@repo/ui/components/focus-card';
import { Badge } from '@repo/ui/components/badge';
import { LockIcon } from '@phosphor-icons/react/dist/ssr';

interface FillInfoStepProps {
  initialData?: FillInfoStepData;
  uploadedImage?: File | { preview?: string };
  onNext: (data: FillInfoStepData) => void;
  onPrev: () => void;
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
}: FillInfoStepProps) {
  const form = useForm({
    defaultValues: {
      symptoms: initialData?.symptoms || '',
      description: initialData?.description || '',
      duration: initialData?.duration || '',
      currentRoutine: initialData?.currentRoutine || '',
    } as FillInfoStepData,
    validators: {
      onSubmit: fillInfoStepSchema,
    },
    onSubmit: async ({ value }) => {
      onNext(value);
    },
    onSubmitInvalid: async () => {
      toast.error('Please describe your skin condition before proceeding.');
    },
  });

  const imageUrl = React.useMemo(() => {
    if (!uploadedImage) return null;
    const fileWithPreview = uploadedImage as File & { preview?: string };
    if (
      fileWithPreview.preview &&
      typeof fileWithPreview.preview === 'string'
    ) {
      return fileWithPreview.preview;
    }
    if (uploadedImage instanceof File) {
      return URL.createObjectURL(uploadedImage);
    }
    return null;
  }, [uploadedImage]);

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
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left Column - Image */}
      <div className="lg:col-span-5">
        <FocusCard className="sticky top-8 [&>div]:p-0 border-ui-tag-green-border bg-ui-tag-green-bg ">
          <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl border bg-muted shadow-sm">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Uploaded skin"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <p className="text-muted-foreground">No image uploaded</p>
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 flex justify-between text-white/80 font-medium pointer-events-auto items-center">
              <Button className="w-fit" variant="secondary" onClick={onPrev}>
                <ScanIcon />
                Retake Photo
              </Button>
            </div>
          </div>
          <div className="px-4 py-6 rounded-b-2xl lg:px-8">
            <footer className="flex flex-col gap-0.5">
              <div className="inline-flex items-center gap-2 self-start">
                <LockIcon
                  weight="duotone"
                  className="text-ui-tag-green-icon"
                  size="24"
                />
                <h3 className="text-lg font-semibold text-emerald-600">
                  We secure your privacy
                </h3>
              </div>
              <p className="text-sm text-ui-tag-green-text">
                Your photo and data are encrypted and stored securely. We use
                them solely for analysis and do not share with third parties.
              </p>
            </footer>
          </div>
        </FocusCard>
      </div>

      {/* Right Column - Form */}
      <div className="lg:col-span-7 flex flex-col gap-8">
        <Card>
          <CardContent>
            <form
              id="fill-info-form"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <form.Field
                name="description"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid} className="space-y-4">
                      <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                        <Sparkle
                          className="w-5 h-5 text-primary"
                          weight="fill"
                        />
                        <label htmlFor={field.name}>
                          What is your main skin concern?
                        </label>
                      </div>

                      <InputGroup className="relative">
                        <InputGroupTextarea
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Example: My skin often gets red when out in the sun, T-zone is oily but cheeks are dry and flaky..."
                          rows={6}
                          className="min-h-40 resize-none"
                          aria-invalid={isInvalid}
                        />
                        <InputGroupAddon
                          align="block-end"
                          className="absolute right-0 bottom-0 pointer-events-none"
                        >
                          <InputGroupText className="text-xs bg-background/20 backdrop-blur-sm px-2 py-1 rounded-md ">
                            {field.state.value.length}/500
                          </InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>

                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}

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
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-bold">Choose next step</h3>

          {/* Main Action Card */}
          <div className="relative overflow-hidden rounded-xl bg-slate-900 text-white p-6 sm:p-8 shadow-lg group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <FirstAid className="w-32 h-32" weight="fill" />
            </div>

            <div className="relative z-10 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-start rounded-md bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
                <Sparkle weight="fill" className="w-3 h-3" />
                RECOMMENDED
              </div>

              <div>
                <h4 className="text-2xl font-bold mb-2">
                  Check my skin condition
                </h4>
                <p className="text-slate-300 max-w-xl">
                  Get detailed analysis from AI about moisture, acne,
                  pigmentation and skin age immediately.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full sm:w-auto self-start mt-2 bg-emerald-500 hover:bg-emerald-600 text-white border-none"
                onClick={() => form.handleSubmit()}
              >
                Start Analysis
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Secondary Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-6 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ArrowsClockwise className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-1">Improve routine</h4>
              <p className="text-sm text-muted-foreground">
                Optimize current skincare steps based on new issues.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" weight="fill" />
              </div>
              <h4 className="font-semibold mb-1">Find suitable products</h4>
              <p className="text-sm text-muted-foreground">
                Suggest top treatment products specifically for you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
