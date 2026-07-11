import type { ModelMessage, UIMessage } from 'ai';
import { convertUIMessagesToModelMessages } from '@/lib/openrouter-utils';
import { ChatMessageProcessingService } from '@/lib/services/chatMessageProcessingService';
import type { ModelInfo } from '@/lib/types/models';

export interface PrepareMessagesParams {
  messages: UIMessage[];
  attachments: Array<{ name: string; contentType: string; url: string }>;
  selectedModel: string;
  modelInfo: ModelInfo | null;
}

export interface PreparedModelMessages {
  modelMessagesFinal: UIMessage[];
  /** UIMessage parts converted to streamText ModelMessage content. */
  formattedMessages: ModelMessage[];
}

export async function prepareMessagesForModel(
  params: PrepareMessagesParams
): Promise<PreparedModelMessages> {
  const { messages, attachments, selectedModel, modelInfo } = params;

  const processed = await ChatMessageProcessingService.processMessagesWithAttachments({
    messages,
    attachments,
    modelInfo,
  });

  const modelMessagesFinal = ChatMessageProcessingService.addModelSpecificInstructions(
    processed.messages,
    selectedModel
  );

  let formattedMessages = convertUIMessagesToModelMessages(modelMessagesFinal);

  formattedMessages = formattedMessages.filter(
    (msg) => msg.role !== 'tool'
  );

  return { modelMessagesFinal, formattedMessages };
}
