import type { UIMessage } from 'ai';
import { convertToOpenRouterFormat } from '@/lib/openrouter-utils';
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
  /** OpenRouter/Requesty converted shape for streamText input. */
  formattedMessages: ReturnType<typeof convertToOpenRouterFormat>;
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

  const isOpenRouterModel = selectedModel.startsWith('openrouter/');
  const isRequestyModel = selectedModel.startsWith('requesty/');
  const needsFormatConversion = isOpenRouterModel || isRequestyModel;

  let formattedMessages: ReturnType<typeof convertToOpenRouterFormat> = needsFormatConversion
    ? convertToOpenRouterFormat(modelMessagesFinal)
    : (modelMessagesFinal as ReturnType<typeof convertToOpenRouterFormat>);

  formattedMessages = formattedMessages.filter(
    (msg: { role?: string }) => msg.role !== 'tool'
  );

  return { modelMessagesFinal, formattedMessages };
}
