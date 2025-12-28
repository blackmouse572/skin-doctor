import {
  CaretLeft,
  MagicWand,
  Moon,
  Sparkle,
  Sun,
} from '@phosphor-icons/react';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  FocusCard,
  FocusCardContent,
  FocusCardFooter,
} from '@repo/ui/components/focus-card';
import { useBlocker } from '@tanstack/react-router';
import type { SkinAnalysisData } from '../schemas';
import { ActionCard, UploadedImage } from '../components';

interface AnalyzeStepProps {
  data: SkinAnalysisData;
  onPrev: () => void;
  onSubmit: () => void;
}

export function AnalyzeStep({ data, onPrev, onSubmit }: AnalyzeStepProps) {
  useBlocker({
    shouldBlockFn: () => true,
    enableBeforeUnload: true,
  });

  return (
    <FocusCard className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FocusCardContent className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full mx-0 max-w-max">
        {/* Left Column - Image */}
        <div className="lg:col-span-5">
          <div className="sticky top-8 space-y-4">
            <UploadedImage uploadedImage={data.upload.images[0]} />
          </div>
        </div>

        {/* Right Column - Review Data */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Skin Concern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkle className="w-5 h-5 text-primary" weight="fill" />
                Your Skin Concern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {data.fillInfo.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>

          {/* Routine Information (if provided) */}
          {data.routineImprovement?.eveningRoutine &&
          data.routineImprovement.morningRoutine ? (
            <>
              {/* Morning Routine */}
              {data.routineImprovement.morningRoutine && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sun className="w-5 h-5 text-amber-500" weight="fill" />
                      Morning Routine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {data.routineImprovement.morningRoutine}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Evening Routine */}
              {data.routineImprovement.eveningRoutine && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Moon className="w-5 h-5 text-indigo-500" weight="fill" />
                      Evening Routine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {data.routineImprovement.eveningRoutine}
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkle className="w-5 h-5 text-primary" weight="fill" />
                  Routine Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  You chose to skip the routine improvement step. AI will
                  provide analysis based on your skin concern only.
                </CardDescription>
              </CardContent>
            </Card>
          )}
        </div>
      </FocusCardContent>

      <FocusCardFooter className="space-y-4">
        <h3 className="text-xl font-bold">Review & Submit</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Secondary Action */}
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
                <CaretLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            }
          />

          {/* Main Action Card */}
          <ActionCard
            variant="primary"
            title="Start AI Analysis"
            description="Get personalized skin insights and recommendations powered by AI."
            icon={<MagicWand className="w-32 h-32" weight="fill" />}
            badge="AI POWERED"
            actionLabel="Analyze Now"
            onAction={onSubmit}
            buttonClassName="place-item-end"
          />
        </div>
      </FocusCardFooter>
    </FocusCard>
  );
}
