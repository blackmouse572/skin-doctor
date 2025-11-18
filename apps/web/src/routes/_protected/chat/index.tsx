import { useChat } from '@ai-sdk/react';
import { createFileRoute } from '@tanstack/react-router';
import { DefaultChatTransport } from 'ai';
import { toast } from 'sonner';
import type { SkinConditionFormData } from './-components/upload-form';
import { ChatbotConversation } from './-components/chatbot-conversation';
import { UploadForm } from './-components/upload-form';
import { authClient } from '@/clients/authClient';
import { env } from '@/env';

export const Route = createFileRoute('/_protected/chat/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession();
  const { messages, error, sendMessage, regenerate, status, stop } = useChat({
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
    <div className="flex flex-col items-center w-full h-full p-2 mx-auto justify-center @sm:p-4 @sm:gap-9 isolate mt-16 @sm:mt-0 overflow-scroll">
      {messages.length > 0 ? (
        <ChatbotConversation
          messages={messages}
          status={status}
          onSubmit={sendMessage}
          stop={stop}
          onRegenerate={regenerate}
        />
      ) : (
        <UploadForm onSubmit={handleSubmit} />
      )}
    </div>
  );
}
