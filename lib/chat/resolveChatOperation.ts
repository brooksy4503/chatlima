import type { UIMessage } from 'ai';
import type { ChatRequestBody } from '@/lib/chat/chatRequest';
import { ConversationPersistenceService } from '@/lib/services/conversationPersistence';
import {
  buildEditResubmitMessages,
  buildRegenerateMessages,
} from '@/lib/chat/branchOperations';
import { buildActivePathMessages } from '@/lib/chat/conversationTree';
import { mergeContinuePath } from '@/lib/chat/mergeContinuePath';
import type { CompareUIMessage } from '@/lib/chat/compareHistory';

export type ResolvedChatOperation =
  | { kind: 'stream'; messages: UIMessage[]; activeLeafMessageId?: string | null }
  | { kind: 'error'; code: string; message: string; status: number };

export async function resolveChatOperation(params: {
  body: ChatRequestBody;
  userId: string;
}): Promise<ResolvedChatOperation> {
  const { body, userId } = params;
  const operation = body.operation ?? { type: 'continue' as const };

  if (!body.chatId) {
    return { kind: 'stream', messages: body.messages };
  }

  const graph = await ConversationPersistenceService.loadChatGraph(body.chatId, userId);
  if (!graph) {
    // New chats receive a client-generated chatId before the chat row exists.
    // The stream executor creates that row after operation resolution.
    if (operation.type === 'continue') {
      return { kind: 'stream', messages: body.messages };
    }

    return {
      kind: 'error',
      code: 'CHAT_NOT_FOUND',
      message: 'Chat not found',
      status: 404,
    };
  }

  const activePath = graph.activePathMessages;

  if (operation.type === 'regenerate') {
    const rebuilt = buildRegenerateMessages({
      activePath,
      assistantMessageId: operation.assistantMessageId,
      attemptId: operation.attemptId,
    });
    if (!rebuilt) {
      return {
        kind: 'error',
        code: 'INVALID_REGENERATE',
        message: 'Cannot regenerate the selected response',
        status: 400,
      };
    }
    return {
      kind: 'stream',
      messages: rebuilt.messages as UIMessage[],
      activeLeafMessageId: rebuilt.messages[rebuilt.messages.length - 1]?.id ?? null,
    };
  }

  if (operation.type === 'edit-resubmit') {
    const rebuilt = buildEditResubmitMessages({
      activePath,
      userMessageId: operation.userMessageId,
      content: operation.content,
      attemptId: operation.attemptId,
    });
    if (!rebuilt) {
      return {
        kind: 'error',
        code: 'INVALID_EDIT',
        message: 'Cannot edit the selected message',
        status: 400,
      };
    }
    return {
      kind: 'stream',
      messages: rebuilt.messages as UIMessage[],
      activeLeafMessageId: rebuilt.messages[rebuilt.messages.length - 1]?.id ?? null,
    };
  }

  const serverPath = buildActivePathMessages(graph.allMessages, graph.activeLeafMessageId);
  const merged = mergeContinuePath(serverPath, body.messages);

  return {
    kind: 'stream',
    messages: merged.messages,
    activeLeafMessageId: merged.activeLeafMessageId ?? graph.activeLeafMessageId,
  };
}
