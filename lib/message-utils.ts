import type { UIMessage } from 'ai';
import { getToolName, isToolUIPart } from 'ai';

/** Extract plain text from a UIMessage's parts. */
export function getUIMessageText(message: UIMessage): string {
  if (!message.parts?.length) {
    return '';
  }

  return message.parts
    .filter((part): part is Extract<typeof part, { type: 'text' }> => part.type === 'text')
    .map(part => part.text)
    .join('\n\n');
}

type ReasoningLikePart = {
  type?: string;
  text?: string;
  reasoning?: string;
  details?: Array<{ type: string; text: string }>;
  state?: 'streaming' | 'done';
};

/** Extract displayable reasoning text from v5 or v6 reasoning parts. */
export function getReasoningPartText(part: ReasoningLikePart): string {
  if (typeof part.text === 'string' && part.text.trim().length > 0) {
    return part.text;
  }

  if (Array.isArray(part.details) && part.details.length > 0) {
    return part.details
      .filter((detail) => detail.type === 'text' && typeof detail.text === 'string')
      .map((detail) => detail.text)
      .join('\n\n');
  }

  if (typeof part.reasoning === 'string' && part.reasoning.trim().length > 0) {
    return part.reasoning;
  }

  return '';
}

/** Whether a tool name represents OpenRouter / native web search. */
export function isWebSearchToolName(toolName: string): boolean {
  return (
    toolName === 'web_search' ||
    toolName === 'openrouter.web_search' ||
    toolName === 'openrouter:web_search' ||
    toolName.endsWith('.web_search') ||
    toolName.endsWith(':web_search')
  );
}

/** Whether a message part represents a web search tool invocation (v5 or v6). */
export function isWebSearchToolPart(part: UIMessage['parts'][number]): boolean {
  if (part.type === 'tool-invocation') {
    const toolName = (part as { toolInvocation?: { toolName?: string } }).toolInvocation?.toolName;
    return typeof toolName === 'string' && isWebSearchToolName(toolName);
  }

  if (isToolUIPart(part)) {
    const toolName = getToolName(part as Parameters<typeof getToolName>[0]);
    return isWebSearchToolName(toolName);
  }

  return false;
}

/** Whether message parts already include a web search tool invocation. */
export function hasWebSearchToolPart(parts: UIMessage['parts'] | undefined): boolean {
  return parts?.some(isWebSearchToolPart) ?? false;
}

/** Whether assistant parts include non-empty text content. */
export function messageHasAssistantText(parts: UIMessage['parts'] | undefined): boolean {
  if (!parts?.length) {
    return false;
  }

  return parts.some(
    (part) => part.type === 'text' && typeof part.text === 'string' && part.text.trim().length > 0
  );
}

/** Map AI SDK v6 tool states to legacy ToolInvocation states used by the UI. */
export function mapV6ToolStateToLegacy(state?: string): 'call' | 'result' {
  return state === 'output-available' ? 'result' : 'call';
}

/** Live "Searching the web" indicator during native OR server-side search (no tool stream events). */
export function shouldShowLiveWebSearchIndicator(params: {
  webSearchEnabled: boolean;
  status: string;
  isLatestMessage: boolean;
  role: string;
  parts: UIMessage['parts'] | undefined;
}): boolean {
  const { webSearchEnabled, status, isLatestMessage, role, parts } = params;

  return (
    webSearchEnabled &&
    role === 'assistant' &&
    isLatestMessage &&
    status === 'streaming' &&
    !hasWebSearchToolPart(parts) &&
    !messageHasAssistantText(parts)
  );
}

/** Completed search card when search ran but no tool part exists in the message yet. */
export function shouldShowSyntheticCompletedWebSearch(params: {
  role: string;
  status: string;
  hasWebSearchResults: boolean;
  parts: UIMessage['parts'] | undefined;
}): boolean {
  const { role, status, hasWebSearchResults, parts } = params;

  return (
    role === 'assistant' &&
    status !== 'streaming' &&
    hasWebSearchResults &&
    !hasWebSearchToolPart(parts)
  );
}

/** Synthetic v6 tool part for provider-executed OpenRouter web search. */
export function createSyntheticWebSearchToolPart(searchCount = 1): UIMessage['parts'][number] {
  return {
    type: 'tool-web_search',
    toolCallId: `web-search-${crypto.randomUUID()}`,
    state: 'output-available',
    input: {},
    output: { searchCount, provider: 'openrouter' },
    providerExecuted: true,
  } as UIMessage['parts'][number];
}

/** Insert a synthetic web search tool part before the first text part (if missing). */
export function injectSyntheticWebSearchToolPart(
  parts: UIMessage['parts'],
  searchCount = 1
): UIMessage['parts'] {
  if (hasWebSearchToolPart(parts)) {
    return parts;
  }

  const synthetic = createSyntheticWebSearchToolPart(searchCount);
  const firstTextIndex = parts.findIndex((part) => part.type === 'text');

  if (firstTextIndex === -1) {
    return [...parts, synthetic];
  }

  return [...parts.slice(0, firstTextIndex), synthetic, ...parts.slice(firstTextIndex)];
}
