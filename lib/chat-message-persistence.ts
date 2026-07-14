import type { UIMessage } from 'ai';
import { isToolUIPart } from 'ai';
import {
  extractGeneratedImageUrls,
  hasWebSearchToolPart,
  injectSyntheticImageGenerationToolParts,
  injectSyntheticWebSearchToolPart,
} from '@/lib/message-utils';
import { nanoid } from 'nanoid';

/** Return the most recent assistant message (e.g. after a forked-chat follow-up). */
export function getLatestAssistantMessage<T extends { role: string }>(
  messages: T[]
): T | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      return messages[i];
    }
  }
  return undefined;
}

export interface UrlCitation {
  url: string;
  title: string;
  content?: string;
  startIndex: number;
  endIndex: number;
}

export interface UrlCitationAnnotation {
  type: string;
  url_citation: {
    url: string;
    title: string;
    content?: string;
    start_index: number;
    end_index: number;
  };
}

export interface BuildAssistantMessageParams {
  clientMessages: UIMessage[];
  uiResponseMessage: UIMessage | null;
  streamText: string;
  reasoningText?: string;
  responseAssistantId?: string;
}

/** True when UI stream parts contain displayable assistant text. */
function uiPartsHaveDisplayableText(parts: UIMessage['parts'] | undefined): boolean {
  if (!parts?.length) {
    return false;
  }

  return parts.some(
    (part) => part.type === 'text' && typeof part.text === 'string' && part.text.trim().length > 0
  );
}

/** Build the assistant UIMessage to persist, preferring the completed UI stream message. */
export function buildAssistantMessageForPersistence(
  params: BuildAssistantMessageParams
): UIMessage {
  const { clientMessages, uiResponseMessage, streamText, reasoningText, responseAssistantId } =
    params;

  const trailingAssistant = clientMessages[clientMessages.length - 1];
  const fallbackId =
    (trailingAssistant?.role === 'assistant' ? trailingAssistant.id : undefined) ??
    responseAssistantId ??
    nanoid();
  const parentMessageId =
    trailingAssistant?.role === 'assistant'
      ? ((trailingAssistant as { parentMessageId?: string | null }).parentMessageId ?? null)
      : undefined;

  if (uiResponseMessage?.parts?.length && uiPartsHaveDisplayableText(uiResponseMessage.parts)) {
    return {
      id: uiResponseMessage.id || fallbackId,
      role: 'assistant',
      parts: markServerExecutedToolParts(uiResponseMessage.parts),
      ...(parentMessageId !== undefined ? { parentMessageId } : {}),
    } as UIMessage;
  }

  const assistantParts: UIMessage['parts'] = [];
  if (reasoningText?.trim()) {
    assistantParts.push({ type: 'reasoning', text: reasoningText, state: 'done' });
  }
  assistantParts.push({ type: 'text', text: streamText || '', state: 'done' });

  if (
    uiResponseMessage?.parts?.length &&
    !uiPartsHaveDisplayableText(uiResponseMessage.parts)
  ) {
    const nonTextParts = uiResponseMessage.parts.filter((part) => part.type !== 'text');
    if (nonTextParts.length > 0) {
      return {
        id: uiResponseMessage.id || fallbackId,
        role: 'assistant',
        parts: markServerExecutedToolParts([...nonTextParts, ...assistantParts]),
        ...(parentMessageId !== undefined ? { parentMessageId } : {}),
      } as UIMessage;
    }
  }

  return {
    id: fallbackId,
    role: 'assistant',
    parts: assistantParts,
    ...(parentMessageId !== undefined ? { parentMessageId } : {}),
  } as UIMessage;
}

export interface ProcessMessagesForPersistenceParams {
  historyMessages: UIMessage[];
  assistantMessage: UIMessage;
  annotations?: UrlCitationAnnotation[];
  webSearch?: {
    useAgenticServerTools: boolean;
    enabled: boolean;
    wasUsed: boolean;
    invocationCount: number;
  };
  imageGeneration?: {
    enabled: boolean;
    wasUsed: boolean;
    imageUrls: string[];
  };
}

/** Apply citations, synthetic web-search tool parts, and return messages ready for DB conversion. */
export function processMessagesForPersistence(
  params: ProcessMessagesForPersistenceParams
): UIMessage[] {
  const { historyMessages, annotations, webSearch, imageGeneration } = params;
  let { assistantMessage } = params;

  if (
    webSearch?.useAgenticServerTools &&
    webSearch.enabled &&
    webSearch.wasUsed &&
    !hasWebSearchToolPart(assistantMessage.parts)
  ) {
    assistantMessage = {
      ...assistantMessage,
      parts: injectSyntheticWebSearchToolPart(
        assistantMessage.parts ?? [],
        Math.max(webSearch.invocationCount, 1)
      ),
    };
  }

  if (
    imageGeneration?.enabled &&
    imageGeneration.wasUsed &&
    imageGeneration.imageUrls.length > 0 &&
    extractGeneratedImageUrls(assistantMessage.parts).length === 0
  ) {
    assistantMessage = {
      ...assistantMessage,
      parts: injectSyntheticImageGenerationToolParts(
        assistantMessage.parts ?? [],
        imageGeneration.imageUrls
      ),
    };
  }

  const citations =
    annotations
      ?.filter((a) => a.type === 'url_citation')
      .map((c) => ({
        url: c.url_citation.url,
        title: c.url_citation.title,
        content: c.url_citation.content,
        startIndex: c.url_citation.start_index,
        endIndex: c.url_citation.end_index,
      })) ?? [];

  if (citations.length === 0) {
    return [...historyMessages, assistantMessage];
  }

  const updatedAssistantMessage = {
    ...assistantMessage,
    parts:
      assistantMessage.parts?.map((part) => {
        if (part.type === 'text') {
          return { ...part, citations };
        }
        return part;
      }) ?? [],
  };

  return [...historyMessages, updatedAssistantMessage];
}

/** Sync gate: UI stream onFinish can run before streamText onFinish without this. */
export function createStreamFinishGate() {
  let resolveReady: ((value: { event: unknown; response: unknown }) => void) | null = null;
  const readyPromise = new Promise<{ event: unknown; response: unknown }>((resolve) => {
    resolveReady = resolve;
  });

  return {
    readyPromise,
    notify(event: unknown, response: unknown) {
      resolveReady?.({ event, response });
      resolveReady = null;
    },
  };
}

/**
 * Mark server-executed tool parts so useChat does not auto-submit a follow-up request
 * (lastAssistantMessageIsCompleteWithToolCalls treats missing providerExecuted as client tools).
 */
export function markServerExecutedToolParts(parts: UIMessage['parts']): UIMessage['parts'] {
  return parts.map((part) => {
    if (isToolUIPart(part) && part.providerExecuted !== true) {
      return { ...part, providerExecuted: true as const };
    }
    return part;
  });
}

/** Count reasoning / tool parts used to decide if DB history is richer than local stream state. */
export function countPersistableDisplayParts(
  parts: UIMessage['parts'] | undefined
): number {
  if (!parts?.length) {
    return 0;
  }

  return parts.filter((part) => {
    if (part.type === 'reasoning' || part.type === 'tool-invocation') {
      return true;
    }
    return typeof part.type === 'string' && part.type.startsWith('tool-');
  }).length;
}

/** True when the next assistant parts include more tool/reasoning segments than the current set. */
export function assistantPartsAreRicher(
  current: UIMessage['parts'] | undefined,
  next: UIMessage['parts'] | undefined
): boolean {
  return countPersistableDisplayParts(next) > countPersistableDisplayParts(current);
}

/** True when DB messages include more tool/reasoning parts than the current useChat state. */
export function dbMessagesHaveRicherAssistantParts(
  current: UIMessage[],
  fromDb: UIMessage[]
): boolean {
  for (const dbMsg of fromDb) {
    if (dbMsg.role !== 'assistant') {
      continue;
    }

    const currentMsg = current.find((m) => m.id === dbMsg.id);
    // Different branch / message set — not an enrichment of the in-memory turn.
    if (!currentMsg) {
      continue;
    }

    const dbCount = countPersistableDisplayParts(dbMsg.parts);
    const currentCount = countPersistableDisplayParts(currentMsg.parts);

    if (dbCount > currentCount) {
      return true;
    }
  }

  return false;
}

/** True when local state has a completed assistant turn atop a stale DB active path. */
export function localTranscriptAheadOfStaleDbPath(
  current: Array<{ id: string; role?: string }>,
  fromDb: Array<{ id: string }>
): boolean {
  return (
    current.length > fromDb.length &&
    current[current.length - 1]?.role === 'assistant' &&
    fromDb.every((msg, index) => msg.id === current[index]?.id)
  );
}

/** True when the DB active path is a different branch than the in-memory transcript. */
export function dbActivePathIsDifferentBranch(
  current: Array<{ id: string }>,
  fromDb: Array<{ id: string }>,
  activeLeafMessageId?: string | null
): boolean {
  if (fromDb.length === 0 || current.length === 0) {
    return false;
  }

  const localLeafId = current[current.length - 1]?.id;
  const dbLeafId =
    activeLeafMessageId ?? fromDb[fromDb.length - 1]?.id ?? null;

  if (!localLeafId || !dbLeafId || localLeafId === dbLeafId) {
    return false;
  }

  // Only adopt the DB path once it actually ends at the reported active leaf.
  return fromDb[fromDb.length - 1]?.id === dbLeafId;
}
