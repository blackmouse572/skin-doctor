import { ArrowLeft, ChatCircle, Sparkle } from '@phosphor-icons/react';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { apiClient } from '@/clients/apiClient';
import { ResultStep } from '../../-components/skin-analysis/steps/result-step';

export const Route = createFileRoute('/_protected/chat/$chatid')({
  loader: async ({ context, params }) => {
    const queryClient = (context as any).queryClient;
    if (queryClient) {
      await queryClient.ensureQueryData(
        apiClient.skinAnalysis.get.queryOptions({
          input: { id: params.chatid },
        }),
      );
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { chatid } = Route.useParams();
  const { data: analysis } = useSuspenseQuery(
    apiClient.skinAnalysis.get.queryOptions({ input: { id: chatid } }),
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="mb-4 inline-block">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Skin Analysis Chat</h1>
        <p className="text-muted-foreground">
          Discuss your skin analysis results with AI
        </p>
      </div>
      <ResultStep
        data={{
          data: {
            analysisId: analysis.id,
            summary: {
              concerns: analysis.analysisResult?.concerns,
              images: analysis.imageUrls,
              skin: analysis.analysisResult?.skin,
            },
          },
          message: '',
        }}
      />
    </div>
  );
}
