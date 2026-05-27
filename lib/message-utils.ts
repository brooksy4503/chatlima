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

/** Whether a message part represents a web search tool invocation (v5 or v6). */
export function isWebSearchToolPart(part: UIMessage['parts'][number]): boolean {
  if (part.type === 'tool-invocation') {
    const toolName = (part as { toolInvocation?: { toolName?: string } }).toolInvocation?.toolName;
    return toolName === 'web_search' || toolName === 'openrouter.web_search';
  }

  if (isToolUIPart(part)) {
    const toolName = getToolName(part as Parameters<typeof getToolName>[0]);
    return toolName === 'web_search' || toolName === 'openrouter.web_search';
  }

  return false;
}

/** Map AI SDK v6 tool states to legacy ToolInvocation states used by the UI. */
export function mapV6ToolStateToLegacy(state?: string): 'call' | 'result' {
  return state === 'output-available' ? 'result' : 'call';
}
