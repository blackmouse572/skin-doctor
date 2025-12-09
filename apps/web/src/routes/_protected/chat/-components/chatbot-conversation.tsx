import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowClockwise';
import { CopyIcon } from '@phosphor-icons/react/dist/csr/Copy';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@repo/ui/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@repo/ui/components/ai-elements/message';
import {
  PromptInput,
  PromptInputHeader,
  PromptInputAttachments,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@repo/ui/components/ai-elements/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@repo/ui/components/ai-elements/reasoning';
import { Shimmer } from '@repo/ui/components/ai-elements/shimmer';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@repo/ui/components/ai-elements/sources';
import { ChatStatus } from 'ai';
import { useState } from 'react';
import type { UIMessage } from '@ai-sdk/react';
import type { PromptInputMessage } from '@repo/ui/components/ai-elements/prompt-input';

export type ChatbotConversationProps = {
  messages: UIMessage[];
  onSubmit?: (input: PromptInputMessage) => void;
  onRegenerate?: () => void;
  status?: ChatStatus;
  stop?: () => void;
  id?: string;
};
export function ChatbotConversation(props: ChatbotConversationProps) {
  const { messages, onSubmit, id, onRegenerate, status, stop } = props;
  const [input, setInput] = useState('');
  const handleSubmit = (value: PromptInputMessage) => {
    if (status !== 'streaming' && onSubmit) {
      onSubmit(value);
      setInput('');
    } else if (status === 'streaming' && stop) {
      stop();
    }
  };

  const renderLatestMessageStreaming = () => {
    const latestMessage = messages[messages.length - 1];
    if (status !== 'streaming' || !latestMessage) return null;

    const latestPart = latestMessage.parts[latestMessage.parts.length - 1];
    if (!latestPart || latestPart.type === 'text') return null;

    const type = latestPart.type;
    let messageContent;
    if (type === 'tool-agent-skinAnalysisAgent') {
      messageContent = (
        <ReasoningContent>Analyzing your skin condition</ReasoningContent>
      );
    } else if (type === 'data-tool-workflow') {
      const data = latestPart.data as {
        name: string;
        status: 'running' | 'success' | 'failed';
        steps: {
          'analyze-skin': {
            name: string;
            status: 'running' | 'success' | 'failed';
            output?: Record<string, any> | null;
          };
          'analyze-ingredients': {
            name: string;
            status: 'running' | 'success' | 'failed';
            output?: Record<string, any> | null;
          };
        };
        output: Record<string, any> | null;
      };

      if (data.steps['analyze-skin'].status === 'running') {
        messageContent = (
          <ReasoningContent>Analyzing skin condition...</ReasoningContent>
        );
      } else if (data.steps['analyze-ingredients'].status === 'running') {
        messageContent = (
          <ReasoningContent>Analyzing product ingredients...</ReasoningContent>
        );
      } else {
        messageContent = (
          <ReasoningContent>Finalizing analysis...</ReasoningContent>
        );
      }
    }
  };
  return (
    <div className="flex flex-col h-full">
      <Conversation className="h-full">
        <ConversationContent>
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === 'assistant' &&
                message.parts.filter((part) => part.type === 'source-url')
                  .length > 0 && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === 'source-url',
                        ).length
                      }
                    />
                    {message.parts
                      .filter((part) => part.type === 'source-url')
                      .map((part, i) => (
                        <SourcesContent key={`${message.id}-${i}`}>
                          <Source
                            key={`${message.id}-${i}`}
                            href={part.url}
                            title={part.url}
                          />
                        </SourcesContent>
                      ))}
                  </Sources>
                )}
              {message.parts.map((part, i) => {
                switch (part.type) {
                  case 'text':
                    return (
                      <Message key={`${message.id}-${i}`} from={message.role}>
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                        {message.role === 'assistant' &&
                          i === messages.length - 1 && (
                            <MessageActions>
                              <MessageAction
                                onClick={() => onRegenerate && onRegenerate()}
                                label="Retry"
                              >
                                <ArrowClockwiseIcon className="size-3" />
                              </MessageAction>
                              <MessageAction
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </MessageAction>
                            </MessageActions>
                          )}
                      </Message>
                    );
                  case 'reasoning':
                    return (
                      <Reasoning
                        key={`${message.id}-${i}`}
                        className="w-full"
                        isStreaming={
                          status === 'streaming' &&
                          i === message.parts.length - 1 &&
                          message.id === messages[messages.length - 1]?.id
                        }
                      >
                        <ReasoningTrigger />
                        <ReasoningContent>{part.text}</ReasoningContent>
                      </Reasoning>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          ))}
          {status === 'submitted' ||
            (status === 'streaming' && (
              <Shimmer as="p">Waiting for response...</Shimmer>
            ))}
          {renderLatestMessageStreaming()}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
        <PromptInputHeader>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
        </PromptInputHeader>
        <PromptInputBody>
          <PromptInputTextarea
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setInput(e.target.value)
            }
            value={input}
          />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <p className="text-xs text-muted-foreground">C/{id}</p>
          </PromptInputTools>
          <PromptInputSubmit disabled={!input && !status} status={status} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
