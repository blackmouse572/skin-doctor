import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@repo/ui/components/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@repo/ui/components/field';
import { Form } from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import SingleUploader from '@repo/ui/components/single-uploader';
import { Textarea } from '@repo/ui/components/textarea';
import { useForm } from '@tanstack/react-form';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export interface SkinConditionFormData {
  images: File[];
  description: string;
  currentRoutine: string;
  symptoms: string;
  duration: string;
}

const STEPS = [
  {
    id: 1,
    title: 'Upload Images',
    description: 'Share photos of your skin condition',
  },
  {
    id: 2,
    title: 'Describe Condition',
    description: 'Tell us about your symptoms',
  },
  { id: 3, title: 'Current Routine', description: 'What products do you use?' },
];

type UploadFormProps = {
  onSubmit?: (data: SkinConditionFormData) => void;
};
export function UploadForm(props: UploadFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm({
    defaultValues: {
      images: [] as File[],
      description: '',
      currentRoutine: '',
      symptoms: '',
      duration: '',
    },
    onSubmit: async ({ value }: { value: SkinConditionFormData }) => {
      if (props.onSubmit) {
        props.onSubmit(value);
      }
    },
  });

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return form.getFieldValue('images').length > 0;
      case 2:
        return (
          form.getFieldValue('description').trim() !== '' &&
          form.getFieldValue('symptoms').trim() !== ''
        );
      case 3:
        return form.getFieldValue('currentRoutine').trim() !== '';
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length && canProceedToNextStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Progress Steps */}
      {/* <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex flex-col items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep > step.id
                      ? 'bg-primary text-primary-foreground'
                      : currentStep === step.id
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                  }`}
                  animate={
                    currentStep === step.id
                      ? {
                          scale: [1, 1.1, 1],
                          transition: { duration: 0.3 },
                        }
                      : {}
                  }
                >
                  {currentStep > step.id ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </motion.div>
                <div className="mt-2 text-center hidden sm:block">
                  <p className="text-xs font-medium">{step.title}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className="w-12 sm:w-24 h-0.5 mx-2 bg-border relative">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{
                      width: currentStep > step.id ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <motion.p
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground text-center"
        >
          {STEPS[currentStep - 1]?.description}
        </motion.p>
      </div> */}

      <Form
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Upload Skin Condition Images</CardTitle>
                  <CardDescription>
                    Upload clear photos of your skin condition from different
                    angles
                  </CardDescription>
                </CardHeader>
                <div className="px-6 pb-6">
                  <form.Field name="images">
                    {(field) => (
                      <SingleUploader
                        onFilesChange={(file) =>
                          field.handleChange(file as any)
                        }
                        maxSize={5 * 1024 * 1024}
                        initialFiles={field.state.value as any}
                      />
                    )}
                  </form.Field>
                </div>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Describe Your Condition</CardTitle>
                  <CardDescription>
                    Help us understand what you&apos;re experiencing
                  </CardDescription>
                </CardHeader>
                <div className="px-6 pb-6 space-y-6">
                  <form.Field
                    name="symptoms"
                    children={(field) => (
                      <Field>
                        <FieldLabel>
                          What symptoms are you experiencing?
                        </FieldLabel>
                        <FieldDescription>
                          E.g., redness, itching, dryness, bumps
                        </FieldDescription>
                        <Input
                          placeholder="Describe your symptoms..."
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.handleChange(e.target.value)
                          }
                        />
                        {field.state.meta.errors && (
                          <FieldError>{field.state.meta.errors[0]}</FieldError>
                        )}
                      </Field>
                    )}
                  />

                  <form.Field
                    name="description"
                    children={(field) => (
                      <Field>
                        <FieldLabel>Detailed Description</FieldLabel>
                        <FieldDescription>
                          Tell us more about your condition, when it started,
                          and any triggers
                        </FieldDescription>
                        <Textarea
                          placeholder="Provide details about your skin condition..."
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>,
                          ) => field.handleChange(e.target.value)}
                          rows={6}
                        />
                        {field.state.meta.errors && (
                          <FieldError>{field.state.meta.errors[0]}</FieldError>
                        )}
                      </Field>
                    )}
                  />

                  <form.Field
                    name="duration"
                    children={(field) => (
                      <Field>
                        <FieldLabel>
                          How long have you had this condition?
                        </FieldLabel>
                        <FieldDescription>
                          E.g., 2 weeks, 3 months, 1 year
                        </FieldDescription>
                        <Input
                          placeholder="Duration..."
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            field.handleChange(e.target.value)
                          }
                        />
                        {field.state.meta.errors && (
                          <FieldError>{field.state.meta.errors[0]}</FieldError>
                        )}
                      </Field>
                    )}
                  />
                </div>
              </Card>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Current Skincare Routine</CardTitle>
                  <CardDescription>
                    Tell us about the products you&apos;re currently using
                  </CardDescription>
                </CardHeader>
                <div className="px-6 pb-6">
                  <form.Field
                    name="currentRoutine"
                    children={(field) => (
                      <Field>
                        <FieldLabel>Describe your skincare routine</FieldLabel>
                        <FieldDescription>
                          List products, frequency, and any treatments
                          you&apos;re using
                        </FieldDescription>
                        <Textarea
                          placeholder="Morning: Cleanser (CeraVe), Moisturizer (Neutrogena)&#x0a;Evening: ..."
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>,
                          ) => field.handleChange(e.target.value)}
                          rows={8}
                        />
                        {field.state.meta.errors && (
                          <FieldError>{field.state.meta.errors[0]}</FieldError>
                        )}
                      </Field>
                    )}
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="flex justify-between mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <CaretLeftIcon className="w-4 h-4" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <form.Subscribe
              selector={(state) => [state.values]}
              children={() => {
                const canProceed = canProceedToNextStep();
                return (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed}
                    className="gap-2"
                  >
                    Next
                    <CaretRightIcon className="w-4 h-4" />
                  </Button>
                );
              }}
            />
          ) : (
            <Button type="submit" className="gap-2">
              <CheckIcon className="w-4 h-4" />
              Submit
            </Button>
          )}
        </motion.div>
      </Form>
    </div>
  );
}
