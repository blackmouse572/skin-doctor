import { useChat } from '@ai-sdk/react';
import { createFileRoute } from '@tanstack/react-router';
import { DefaultChatTransport } from 'ai';
import { toast } from 'sonner';
import type { SkinConditionFormData } from './-components/upload-form';
import { ChatbotConversation } from './-components/chatbot-conversation';
import { UploadForm } from './-components/upload-form';
import { authClient } from '@/clients/authClient';
import { env } from '@/env';
import { FillInfoStep } from '../../-components/skin-analysis/steps/fill-info-step';

export const Route = createFileRoute('/_protected/chat/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
  const { messages, id, sendMessage, regenerate, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: `${env.PUBLIC_AI_API_URL}/chat`,
    }),
    id: session?.user.id,
    onError: (err) => {
      console.error('Chat error:', err);
      toast.error(`Chat error: ${err.message || 'Unknown error'}`);
    },
  });

  const handleSubmit = (data: SkinConditionFormData) => {
    const { images } = data;
    const userMessage = `I have a skin condition with the following details:
    - Current routine: ${data.currentRoutine}
    - Symptoms: ${data.symptoms}
    - Description: ${data.description}
    - Duration: ${data.duration}
    <current_routine>
    ${data.currentRoutine}
    </current_routine>
    Please provide an analysis and recommendations based on the above information.
    `;
    // handle upload images
    sendMessage({
      files: images.map((img: any) => img.file),
      text: userMessage,
    });
  };

  return (
    <div className="flex flex-col ">
      <FillInfoStep onNext={() => {}} />
    </div>
  );
}
