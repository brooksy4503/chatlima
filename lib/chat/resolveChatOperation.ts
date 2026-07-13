import type { UIMessage } from 'ai';
import type { ChatRequestBody } from '@/lib/chat/chatRequest';
import { ConversationPersistenceService } from '@/lib/services/conversationPersistence';
import {
  buildEditResubmitMessages,
  buildRegenerateMessages,
} from '@/lib/chat/branchOperations';
import { buildActivePathMessages } from '@/lib/chat/conversationTree';
import type { CompareUIMessage } from '@/lib/chat/compareHistory';

export type ResolvedChatOperation =
  | { kind: 'stream'; messages: UIMessage[]; activeLeafMessageId?: string | null }
  | { kind: 'fork'; newChatId: string }
  | { kind: 'select-leaf'; activeLeafMessageId: string; messages: CompareUIMessage[] }
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
    return {
      kind: 'error',
      code: 'CHAT_NOT_FOUND',
      message: 'Chat not found',
      status: 404,
    };
  }

  const activePath = graph.activePathMessages;

  if (operation.type === 'fork') {
    const result = await ConversationPersistenceService.forkChat({
      sourceChatId: body.chatId,
      userId,
      forkThroughMessageId: operation.forkThroughMessageId,
    });
    if (!result) {
      return {
        kind: 'error',
        code: 'FORK_FAILED',
        message: 'Unable to fork chat from the selected message',
        status: 400,
      };
    }
    return { kind: 'fork', newChatId: result.newChatId };
  }

  if (operation.type === 'select-leaf') {
    const ok = await ConversationPersistenceService.setActiveLeaf({
      chatId: body.chatId,
      userId,
      leafMessageId: operation.leafMessageId,
    });
    if (!ok) {
      return {
        kind: 'error',
        code: 'INVALID_LEAF',
        message: 'Selected branch is not valid for this chat',
        status: 400,
      };
    }

    const refreshed = await ConversationPersistenceService.loadChatGraph(body.chatId, userId);
    return {
      kind: 'select-leaf',
      activeLeafMessageId: operation.leafMessageId,
      messages: refreshed?.activePathMessages ?? [],
    };
  }

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
  const clientPath = body.messages;

  if (serverPath.length > 0 && clientPath.length >= serverPath.length) {
    return {
      kind: 'stream',
      messages: clientPath,
      activeLeafMessageId: clientPath[clientPath.length - 1]?.id ?? graph.activeLeafMessageId,
    };
  }

  return {
    kind: 'stream',
    messages: serverPath as UIMessage[],
    activeLeafMessageId: graph.activeLeafMessageId,
  };
}
