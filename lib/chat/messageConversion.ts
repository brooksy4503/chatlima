import { nanoid } from 'nanoid';
import type { UIMessage } from 'ai';
import type {
  FileUIPart,
  ReasoningUIPart,
  SourceUIPart,
  StepStartUIPart,
} from '@ai-sdk/ui-utils';
import type { DBMessage, Message } from '@/lib/db/schema';
import type { CompareUIMessage } from '@/lib/chat/compareHistory';
import { inferParentChainFromLinearOrder } from '@/lib/chat/conversationTree';
import { getUIMessageText } from '@/lib/message-utils';
import type {
  ImageUIPart,
  TextUIPart,
  ToolInvocationUIPart,
} from '@/lib/types';

type AIMessage = CompareUIMessage;

function parseMessageCreatedAt(createdAt: AIMessage['createdAt']): Date | null {
  if (createdAt instanceof Date && !Number.isNaN(createdAt.getTime())) {
    return createdAt;
  }

  if (typeof createdAt === 'string') {
    const parsed = new Date(createdAt);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

export function convertToDBMessages(
  aiMessages: AIMessage[],
  chatId: string
): DBMessage[] {
  const baseTimestamp = Date.now();
  let previousTimestamp = 0;

  return aiMessages.map((message, index) => {
    const id = message.id || nanoid();
    const parsedCreatedAt = parseMessageCreatedAt(message.createdAt);
    let createdAt = parsedCreatedAt ?? new Date(baseTimestamp + index);

    if (createdAt.getTime() <= previousTimestamp) {
      createdAt = new Date(previousTimestamp + 1);
    }
    previousTimestamp = createdAt.getTime();

    const parts =
      message.parts?.length
        ? message.parts
        : ([
            { type: 'text', text: getUIMessageText(message) } as TextUIPart,
          ] as Array<
            | TextUIPart
            | ToolInvocationUIPart
            | ImageUIPart
            | ReasoningUIPart
            | SourceUIPart
            | FileUIPart
            | StepStartUIPart
          >);

    return {
      id,
      chatId,
      role: message.role,
      parts,
      hasWebSearch: message.hasWebSearch || false,
      webSearchContextSize: message.webSearchContextSize || 'medium',
      modelId: message.modelId ?? null,
      modelProvider: message.modelProvider ?? null,
      modelDisplayName: message.modelDisplayName ?? null,
      comparisonTurnId: message.comparisonTurnId ?? null,
      parentMessageId: message.parentMessageId ?? null,
      createdAt,
    };
  });
}

export function convertToDBMessagesWithParents(
  aiMessages: AIMessage[],
  chatId: string
): DBMessage[] {
  return convertToDBMessages(
    inferParentChainFromLinearOrder(aiMessages),
    chatId
  );
}

export function convertToUIMessages(
  dbMessages: Array<Message>
): CompareUIMessage[] {
  return dbMessages.map((message) => ({
    id: message.id,
    parts: message.parts as UIMessage['parts'],
    role: message.role as UIMessage['role'],
    createdAt: message.createdAt,
    hasWebSearch: message.hasWebSearch || false,
    webSearchContextSize: (message.webSearchContextSize || 'medium') as
      | 'low'
      | 'medium'
      | 'high',
    modelId: message.modelId ?? null,
    modelProvider: message.modelProvider ?? null,
    modelDisplayName: message.modelDisplayName ?? null,
    comparisonTurnId: message.comparisonTurnId ?? null,
    parentMessageId: message.parentMessageId ?? null,
  }));
}
