'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@repo/ui/components/field';
import { Input } from '@repo/ui/components/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@repo/ui/components/input-group';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { fillInfoStepSchema, type FillInfoStepData } from '../schemas';
import {
  FocusCard,
  FocusCardContent,
  FocusCardFooter,
} from '@repo/ui/components/focus-card';

interface FillInfoStepProps {
  initialData?: FillInfoStepData;
  onNext: (data: FillInfoStepData) => void;
  onPrev: () => void;
}

export function FillInfoStep({
  initialData,
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
      toast.success('Information saved successfully!', {
        description: (
          <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
            <code>{JSON.stringify(value, null, 2)}</code>
          </pre>
        ),
        position: 'bottom-right',
        classNames: {
          content: 'flex flex-col gap-2',
        },
        style: {
          '--border-radius': 'calc(var(--radius) + 4px)',
        } as React.CSSProperties,
      });
      onNext(value);
    },
    onSubmitInvalid: async () => {
      toast.error('Please fix the errors in the form before proceeding.');
    },
  });

  return (
    <FocusCard>
      <FocusCardContent>
        <CardHeader>
          <CardTitle>Describe Your Condition</CardTitle>
          <CardDescription>
            Help us understand what you&apos;re experiencing
          </CardDescription>
        </CardHeader>
        <form
          id="fill-info-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="symptoms"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      What symptoms are you experiencing?
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="E.g., redness, itching, dryness, bumps"
                      autoComplete="off"
                    />
                    <FieldDescription>
                      Describe the symptoms you&apos;re experiencing
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="description"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Detailed Description
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Tell us more about your condition, when it started, and any triggers"
                        rows={4}
                        className="min-h-24 resize-none"
                        aria-invalid={isInvalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.state.value.length}/500 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Include when it started, triggers, and any observations
                      you&apos;ve made
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="duration"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      How long have you had this condition?
                    </FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="E.g., 2 weeks, 3 months, 1 year"
                      autoComplete="off"
                    />
                    <FieldDescription>
                      Approximate duration of your condition
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />

            <form.Field
              name="currentRoutine"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      Current Skincare Routine
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Morning: Cleanser, Moisturizer... Evening: ..."
                        rows={4}
                        className="min-h-24 resize-none"
                        aria-invalid={isInvalid}
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText className="tabular-nums">
                          {field.state.value?.length}/500 characters
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      List products, frequency, and any treatments you&apos;re
                      using
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>
        </form>
      </FocusCardContent>
      <FocusCardFooter>
        <div className="flex justify-between w-full gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="gap-2"
          >
            <CaretLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button type="submit" form="fill-info-form" className="gap-2">
            Next: Analyze
            <CaretRight className="w-4 h-4" />
          </Button>
        </div>
      </FocusCardFooter>
    </FocusCard>
  );
}
