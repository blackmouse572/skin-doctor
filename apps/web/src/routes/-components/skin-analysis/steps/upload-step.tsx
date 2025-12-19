import { LockIcon, Sun, Smiley, Scan } from '@phosphor-icons/react';
import { Button } from '@repo/ui/components/button';
import { FocusCard, FocusCardContent } from '@repo/ui/components/focus-card';
import { Form } from '@repo/ui/components/form';
import SingleUploader from '@repo/ui/components/single-uploader';
import { useForm } from '@tanstack/react-form';
import { uploadStepSchema, type UploadStepData } from '../schemas';

interface UploadStepProps {
  initialData?: UploadStepData;
  onNext: (data: UploadStepData) => void;
}

export function UploadStep({ initialData, onNext }: UploadStepProps) {
  const form = useForm({
    defaultValues: {
      images: initialData?.images || [],
    } as UploadStepData,
    validators: {
      onChange: uploadStepSchema,
    },
    onSubmit: async ({ value }) => {
      onNext(value);
    },
  });

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FocusCard>
          <FocusCardContent className="flex flex-col items-center justify-center min-h-[300px] p-8">
            <div className="w-full">
              <form.Field name="images">
                {(field) => (
                  <SingleUploader
                    onFilesChange={(file) => field.handleChange(file as any)}
                    maxSize={10 * 1024 * 1024}
                    initialFiles={field.state.value as any}
                  />
                )}
              </form.Field>

              <div className="mt-6 flex justify-center">
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={(!canSubmit as boolean) || isSubmitting}
                      className="w-full sm:w-auto min-w-[200px]"
                    >
                      Next Step
                    </Button>
                  )}
                />
              </div>
            </div>
          </FocusCardContent>
        </FocusCard>
      </Form>
      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
        <LockIcon weight="fill" className="w-4 h-4" />
        <p>
          Your photo is securely processed and automatically deleted after
          analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
        <InfoCard
          icon={<Sun className="w-8 h-8 text-primary" />}
          title="Good Lighting"
          description="Take photo in natural light, avoid backlight."
        />
        <InfoCard
          icon={<Smiley className="w-8 h-8 text-primary" />}
          title="Bare Face"
          description="No makeup for most accurate AI analysis."
        />
        <InfoCard
          icon={<Scan className="w-8 h-8 text-primary" />}
          title="Front Angle"
          description="Keep face straight, not obscured by hair."
        />
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 flex flex-col items-center text-center border">
      <div className="mb-4 p-3 bg-primary/10 rounded-full">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
