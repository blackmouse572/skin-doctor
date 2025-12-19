import { CaretLeft, MagicWand } from '@phosphor-icons/react';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@repo/ui/components/card';
import type { SkinAnalysisData } from '../schemas';

interface AnalyzeStepProps {
  data: SkinAnalysisData;
  onPrev: () => void;
  onSubmit: () => void;
}

export function AnalyzeStep({ data, onPrev, onSubmit }: AnalyzeStepProps) {
  return (
    <div className="w-full max-w-3xl mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4 w-fit">
            <MagicWand className="w-8 h-8 text-primary" weight="duotone" />
          </div>
          <CardTitle className="text-2xl">Ready to Analyze?</CardTitle>
          <CardDescription>
            We have everything we need to analyze your skin condition.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg text-left text-sm space-y-2">
            <p>
              <span className="font-semibold">Images:</span>{' '}
              {data.upload.images.length} photo(s) uploaded
            </p>
            <p>
              <span className="font-semibold">Symptoms:</span>{' '}
              {data.fillInfo.symptoms}
            </p>
            <p>
              <span className="font-semibold">Description:</span>{' '}
              {data.fillInfo.description.substring(0, 100)}
              {data.fillInfo.description.length > 100 ? '...' : ''}
            </p>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onPrev} className="gap-2">
              <CaretLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button onClick={onSubmit} className="gap-2 min-w-[200px]">
              <MagicWand className="w-4 h-4" />
              Start Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
