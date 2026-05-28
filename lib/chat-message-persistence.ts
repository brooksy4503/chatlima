import type { UIMessage } from 'ai';
import { hasWebSearchToolPart, injectSyntheticWebSearchToolPart } from '@/lib/message-utils';
import { nanoid } from 'nanoid';

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

/** Build the assistant UIMessage to persist, preferring the completed UI stream message. */
export function buildAssistantMessageForPersistence(
  params: BuildAssistantMessageParams
): UIMessage {
  const { clientMessages, uiResponseMessage, streamText, reasoningText, responseAssistantId } =
    params;

  const trailingAssistant = clientMessages[clientMessages.length - 1];
  const fallbackId =
    responseAssistantId ??
    (trailingAssistant?.role === 'assistant' ? trailingAssistant.id : undefined) ??
    nanoid();

  if (uiResponseMessage?.parts?.length) {
    return {
      id: uiResponseMessage.id || fallbackId,
      role: 'assistant',
      parts: uiResponseMessage.parts,
    };
  }

  const assistantParts: UIMessage['parts'] = [];
  if (reasoningText?.trim()) {
    assistantParts.push({ type: 'reasoning', text: reasoningText, state: 'done' });
  }
  assistantParts.push({ type: 'text', text: streamText || '', state: 'done' });

  return {
    id: fallbackId,
    role: 'assistant',
    parts: assistantParts,
  };
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
}

/** Apply citations, synthetic web-search tool parts, and return messages ready for DB conversion. */
export function processMessagesForPersistence(
  params: ProcessMessagesForPersistenceParams
): UIMessage[] {
  const { historyMessages, annotations, webSearch } = params;
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

  const withAssistant = [...historyMessages, assistantMessage];

  if (citations.length === 0) {
    return withAssistant;
  }

  return withAssistant.map((msg) => {
    if (msg.role !== 'assistant' || !msg.parts) {
      return msg;
    }

    return {
      ...msg,
      parts: msg.parts.map((part) => {
        if (part.type === 'text') {
          return { ...part, citations };
        }
        return part;
      }),
    };
  });
}

/** Await the UI stream response message until the client finishes consuming the SSE stream. */
export function waitForUiResponseMessage(
  promise: Promise<UIMessage>,
  abortSignal: AbortSignal
): Promise<UIMessage | null> {
  if (abortSignal.aborted) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const onAbort = () => resolve(null);
    abortSignal.addEventListener('abort', onAbort, { once: true });

    promise
      .then((message) => {
        abortSignal.removeEventListener('abort', onAbort);
        resolve(message);
      })
      .catch(() => {
        abortSignal.removeEventListener('abort', onAbort);
        resolve(null);
      });
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
    const dbCount = countPersistableDisplayParts(dbMsg.parts);
    const currentCount = countPersistableDisplayParts(currentMsg?.parts);

    if (dbCount > currentCount) {
      return true;
    }
  }

  return false;
}
