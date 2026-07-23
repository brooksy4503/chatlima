import { convertToUIMessages } from '@/lib/chat/messageConversion';
import { normalizeChatMessages } from '@/lib/chat/normalizeChatMessages';
import {
  expandComparisonTurnsInPath,
  stripOrphanComparisonTurnIds,
  type CompareUIMessage,
} from '@/lib/chat/compareHistory';
import type { Message } from '@/lib/db/schema';

export type ChatDisplayMessagesInput = {
  messages?: Message[] | null;
  activePathMessages?: CompareUIMessage[] | null;
};

export type ChatDisplayMessages = {
  /** Full persisted graph for branch pager / merge. */
  allGraphMessages: CompareUIMessage[];
  /** Active path expanded for compare UI and DB adoption. */
  initialMessages: CompareUIMessage[];
};

/**
 * Canonical chat load path: normalize DB rows, resolve the active branch, then
 * expand comparison turns so every compare assistant sibling is visible in the UI.
 * Use this anywhere client state is hydrated from `getChatById` / active-leaf.
 */
export function buildChatDisplayMessages(
  input: ChatDisplayMessagesInput | null | undefined
): ChatDisplayMessages {
  if (!input?.messages?.length) {
    return { allGraphMessages: [], initialMessages: [] };
  }

  const allGraphMessages = normalizeChatMessages(convertToUIMessages(input.messages));
  const activePath =
    input.activePathMessages && input.activePathMessages.length > 0
      ? normalizeChatMessages(input.activePathMessages)
      : allGraphMessages;

  return {
    allGraphMessages,
    initialMessages: buildCompareDisplayPath(activePath, allGraphMessages),
  };
}

/** Expand a branch path with all compare assistant siblings from the full graph. */
export function buildCompareDisplayPath(
  activePath: CompareUIMessage[],
  allGraphMessages: CompareUIMessage[]
): CompareUIMessage[] {
  const normalizedPath = stripOrphanComparisonTurnIds(activePath);
  const normalizedGraph = stripOrphanComparisonTurnIds(allGraphMessages);
  return expandComparisonTurnsInPath(normalizedPath, normalizedGraph);
}
