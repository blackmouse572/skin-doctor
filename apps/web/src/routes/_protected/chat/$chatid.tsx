import { apiClient } from '@/clients/apiClient';
import { useFormatDateString } from '@repo/ui/hooks/use-date';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ResultStep } from '../../-components/skin-analysis/steps/result-step';

export const Route = createFileRoute('/_protected/chat/$chatid')({
  loader: async ({ context, params }) => {
    const queryClient = (context as any).queryClient;
    if (queryClient) {
      await queryClient.ensureQueryData(
        apiClient.skinAnalysis.get.queryOptions({
          input: { id: Number(params.chatid) },
        }),
      );
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { chatid } = Route.useParams();
  const { data: analysis } = useSuspenseQuery(
    apiClient.skinAnalysis.get.queryOptions({ input: { id: Number(chatid) } }),
  );
  const createdAt = useFormatDateString(analysis.createdAt);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center text-sm mb-6 text-muted-foreground">
        <p>
          <span>#</span>
          <span>{analysis.id}</span>
        </p>
        <p>{createdAt}</p>
      </div>
      <ResultStep
        data={{
          data: {
            analysisId: analysis.id,
            summary: {
              concerns: analysis.analysisResult?.concerns || [],
              images: analysis.imageUrls,
              skin: analysis.analysisResult?.skin || {
                healthPoint: 0,
                moistureLevel: 0,
                skinAge: 0,
                skinType: 'Unknown',
              },
            },
          },
          message: '',
        }}
      />
    </div>
  );
}
