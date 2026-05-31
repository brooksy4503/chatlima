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

/** Whether a tool name represents OpenRouter image generation. */
export function isImageGenerationToolName(toolName: string): boolean {
  return (
    toolName === 'image_generation' ||
    toolName === 'openrouter.image_generation' ||
    toolName === 'openrouter:image_generation' ||
    toolName.endsWith('.image_generation') ||
    toolName.endsWith(':image_generation')
  );
}

/** Whether a message part represents an image generation tool invocation (v5 or v6). */
export function isImageGenerationToolPart(part: UIMessage['parts'][number]): boolean {
  if (part.type === 'tool-invocation') {
    const toolName = (part as { toolInvocation?: { toolName?: string } }).toolInvocation?.toolName;
    return typeof toolName === 'string' && isImageGenerationToolName(toolName);
  }

  if (isToolUIPart(part)) {
    const toolName = getToolName(part as Parameters<typeof getToolName>[0]);
    return isImageGenerationToolName(toolName);
  }

  return false;
}

/** Whether message parts already include an image generation tool invocation. */
export function hasImageGenerationToolPart(parts: UIMessage['parts'] | undefined): boolean {
  return parts?.some(isImageGenerationToolPart) ?? false;
}

/** Extract image URLs from image generation tool results in message parts. */
export function extractGeneratedImageUrls(parts: UIMessage['parts'] | undefined): string[] {
  if (!parts?.length) {
    return [];
  }

  const urls: string[] = [];

  for (const part of parts) {
    if (part.type === 'tool-invocation') {
      const invocation = (part as { toolInvocation?: { toolName?: string; result?: unknown } }).toolInvocation;
      if (!invocation || !isImageGenerationToolName(invocation.toolName ?? '')) {
        continue;
      }
      const url = getGeneratedImageUrlFromToolResult(invocation.result);
      if (url) {
        urls.push(url);
      }
      continue;
    }

    if (isToolUIPart(part) && isImageGenerationToolPart(part)) {
      const v6Part = part as UIMessage['parts'][number] & { output?: unknown };
      const url = getGeneratedImageUrlFromToolResult(v6Part.output);
      if (url) {
        urls.push(url);
      }
    }
  }

  return urls;
}

/** Extract image URL from an image_generation tool result payload. */
export function getGeneratedImageUrlFromToolResult(result: unknown): string | null {
  if (!result) {
    return null;
  }

  if (typeof result === 'string') {
    try {
      const parsed = JSON.parse(result) as { imageUrl?: string; image_url?: string };
      return parsed.imageUrl ?? parsed.image_url ?? null;
    } catch {
      return null;
    }
  }

  if (typeof result === 'object') {
    const record = result as {
      type?: string;
      output?: unknown;
      result?: unknown;
      imageUrl?: string;
      image_url?: string | { url?: string };
      status?: string;
      error?: string;
    };
    if (record.status === 'error') {
      return null;
    }
    if (typeof record.imageUrl === 'string') {
      return record.imageUrl;
    }
    if (typeof record.image_url === 'string') {
      return record.image_url;
    }
    if (record.image_url && typeof record.image_url === 'object' && typeof record.image_url.url === 'string') {
      return record.image_url.url;
    }

    // AI SDK TypedToolResult wraps OpenRouter payloads in `output` (or legacy `result`).
    for (const nested of [record.output, record.result]) {
      if (nested == null) {
        continue;
      }
      const url = getGeneratedImageUrlFromToolResult(nested);
      if (url) {
        return url;
      }
    }

    return null;
  }

  return null;
}

/** Live "Generating image" indicator during image generation tool execution. */
export function shouldShowLiveImageGenerationIndicator(params: {
  imageGenerationEnabled: boolean;
  status: string;
  isLatestMessage: boolean;
  role: string;
  parts: UIMessage['parts'] | undefined;
}): boolean {
  const { imageGenerationEnabled, status, isLatestMessage, role, parts } = params;

  if (!imageGenerationEnabled || role !== 'assistant' || !isLatestMessage || status !== 'streaming') {
    return false;
  }

  const hasPendingImageGen = parts?.some((part) => {
    if (part.type === 'tool-invocation') {
      const invocation = (part as { toolInvocation?: { toolName?: string; state?: string } }).toolInvocation;
      return (
        isImageGenerationToolName(invocation?.toolName ?? '') &&
        invocation?.state === 'call'
      );
    }

    if (isToolUIPart(part) && isImageGenerationToolPart(part)) {
      const v6Part = part as UIMessage['parts'][number] & { state?: string };
      return v6Part.state !== 'output-available';
    }

    return false;
  });

  if (hasPendingImageGen) {
    return true;
  }

  return (
    !hasImageGenerationToolPart(parts) &&
    !messageHasAssistantText(parts)
  );
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

/** Whether the user's message is asking to create or generate an image. */
export function userMessageRequestsImageCreation(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) {
    return false;
  }

  const hasImageNoun = /\b(image|picture|photo|illustration|artwork|drawing|portrait|poster)\b/i.test(
    normalized
  );
  const hasCreateVerb = /\b(create|generate|draw|make|paint|design|illustrate|render)\b/i.test(
    normalized
  );

  return (
    (hasCreateVerb && hasImageNoun) ||
    /\b(create|generate|draw)\s+(an?\s+)?(image|picture|photo)\b/i.test(normalized)
  );
}

function isImageUrl(value: string): boolean {
  return (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:image/')
  );
}

/** Collect image URLs from known tool/file/message payload shapes. */
function collectImageUrl(value: unknown, urls: string[]): void {
  if (!value) {
    return;
  }

  if (typeof value === 'string') {
    if (isImageUrl(value)) {
      urls.push(value);
    }
    return;
  }

  if (typeof value !== 'object') {
    return;
  }

  const record = value as Record<string, unknown>;

  if (record.type === 'tool-result') {
    collectImageUrl(record.output, urls);
    collectImageUrl(record.result, urls);
    return;
  }

  if (record.type === 'file' && record.file && typeof record.file === 'object') {
    const file = record.file as { base64?: string; mediaType?: string };
    if (typeof file.base64 === 'string' && file.base64.length > 0 && file.mediaType?.startsWith('image/')) {
      urls.push(`data:${file.mediaType};base64,${file.base64}`);
    }
  }

  if (record.type === 'image_url' && record.image_url && typeof record.image_url === 'object') {
    const nested = record.image_url as { url?: string };
    if (typeof nested.url === 'string' && isImageUrl(nested.url)) {
      urls.push(nested.url);
    }
  }

  if (record.type === 'file' || record.type === 'image') {
    if (typeof record.url === 'string' && isImageUrl(record.url)) {
      urls.push(record.url);
    }
    if (typeof record.data === 'string' && record.data.startsWith('data:image/')) {
      urls.push(record.data);
    }
  }

  const fromToolResult = getGeneratedImageUrlFromToolResult(value);
  if (typeof fromToolResult === 'string' && isImageUrl(fromToolResult)) {
    urls.push(fromToolResult);
  }
}

/** Extract generated image URLs from stream finish event / provider response payloads. */
export function extractGeneratedImageUrlsFromStreamEvent(
  event?: {
    content?: unknown[];
    files?: unknown[];
    toolResults?: unknown[];
    staticToolResults?: unknown[];
    dynamicToolResults?: unknown[];
    steps?: Array<{ content?: unknown[]; toolResults?: unknown[] }>;
  } | null,
  response?: { messages?: unknown[] } | null
): string[] {
  const urls: string[] = [];

  for (const part of event?.content ?? []) {
    collectImageUrl(part, urls);
  }

  for (const file of event?.files ?? []) {
    collectImageUrl(file, urls);
  }

  for (const result of [
    ...(event?.toolResults ?? []),
    ...(event?.staticToolResults ?? []),
    ...(event?.dynamicToolResults ?? []),
  ]) {
    collectImageUrl(result, urls);
  }

  for (const step of event?.steps ?? []) {
    for (const part of step.content ?? []) {
      collectImageUrl(part, urls);
    }
    for (const result of step.toolResults ?? []) {
      collectImageUrl(result, urls);
    }
  }

  for (const message of response?.messages ?? []) {
    if (!message || typeof message !== 'object') {
      continue;
    }

    const record = message as Record<string, unknown>;
    if (Array.isArray(record.images)) {
      for (const image of record.images) {
        collectImageUrl(image, urls);
      }
    }

    if (Array.isArray(record.content)) {
      for (const part of record.content) {
        collectImageUrl(part, urls);
      }
    }
  }

  return [...new Set(urls)];
}

/** Synthetic v6 tool part for provider-executed OpenRouter image generation. */
export function createSyntheticImageGenerationToolPart(imageUrl: string): UIMessage['parts'][number] {
  return {
    type: 'tool-image_generation',
    toolCallId: `image-generation-${crypto.randomUUID()}`,
    state: 'output-available',
    input: {},
    output: { imageUrl, provider: 'openrouter' },
    providerExecuted: true,
  } as UIMessage['parts'][number];
}

/** Insert synthetic image tool parts (with URLs) before the first text part when missing. */
export function injectSyntheticImageGenerationToolParts(
  parts: UIMessage['parts'],
  imageUrls: string[]
): UIMessage['parts'] {
  const existing = new Set(extractGeneratedImageUrls(parts));
  const missing = imageUrls.filter((url) => !existing.has(url));

  if (missing.length === 0) {
    return parts;
  }

  const synthetics = missing.map((url) => createSyntheticImageGenerationToolPart(url));
  const firstTextIndex = parts.findIndex((part) => part.type === 'text');

  if (firstTextIndex === -1) {
    return [...parts, ...synthetics];
  }

  return [...parts.slice(0, firstTextIndex), ...synthetics, ...parts.slice(firstTextIndex)];
}
