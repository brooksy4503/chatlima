import type { UIMessage } from 'ai';
import { isLocalComparePromotionAheadOfDb } from '@/lib/chat/compareHistory';
import {
  dbActivePathIsDifferentBranch,
  dbMessagesHaveRicherAssistantParts,
  localTranscriptAheadOfStaleDbPath,
} from '@/lib/chat-message-persistence';

export type AdoptDbMessagesParams = {
  chatId: string | undefined;
  loadedChatId: string | null;
  isLoadingChat: boolean;
  status: 'error' | 'submitted' | 'streaming' | 'ready';
  isCompareLoading: boolean;
  initialMessages: UIMessage[];
  currentMessages: UIMessage[];
  activeLeafMessageId?: string | null;
};

export type AdoptDbMessagesResult =
  | { action: 'none' }
  | { action: 'replace'; messages: UIMessage[]; loadedChatId?: string };

/** Decide whether in-memory chat state should adopt a fresher DB active path.
 *  `initialMessages` must come from `buildChatDisplayMessages` so compare turns stay expanded. */
export function adoptDbMessages(params: AdoptDbMessagesParams): AdoptDbMessagesResult {
  const {
    chatId,
    loadedChatId,
    isLoadingChat,
    status,
    isCompareLoading,
    initialMessages,
    currentMessages,
    activeLeafMessageId,
  } = params;

  if (!chatId || isLoadingChat) return { action: 'none' };
  if (status === 'streaming' || status === 'submitted') return { action: 'none' };
  if (isCompareLoading) return { action: 'none' };

  const isNewChatNavigation = loadedChatId !== chatId;

  if (isNewChatNavigation) {
    if (initialMessages.length > 0 || currentMessages.length === 0) {
      return { action: 'replace', messages: initialMessages, loadedChatId: chatId };
    }
    return { action: 'none' };
  }

  if (status !== 'ready' || initialMessages.length === 0) return { action: 'none' };

  if (localTranscriptAheadOfStaleDbPath(currentMessages, initialMessages)) {
    return { action: 'none' };
  }

  if (isLocalComparePromotionAheadOfDb(currentMessages, initialMessages)) {
    return { action: 'none' };
  }

  if (currentMessages.length === 0) {
    return { action: 'replace', messages: initialMessages };
  }

  if (dbMessagesHaveRicherAssistantParts(currentMessages, initialMessages)) {
    return { action: 'replace', messages: initialMessages };
  }

  if (dbActivePathIsDifferentBranch(currentMessages, initialMessages, activeLeafMessageId)) {
    return { action: 'replace', messages: initialMessages };
  }

  return { action: 'none' };
}
