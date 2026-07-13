import type { ChatOperation } from '@/lib/chat/chatRequest';

export type BranchAction =
  | { type: 'regenerate'; assistantMessageId: string; attemptId: string }
  | { type: 'edit-resubmit'; userMessageId: string; content: string; attemptId: string }
  | { type: 'select-leaf'; leafMessageId: string }
  | { type: 'fork'; forkThroughMessageId: string };

export function buildRegenerateMessages(params: {
  activePath: Array<{ id: string; role: string; parts?: unknown; parentMessageId?: string | null }>;
  assistantMessageId: string;
  attemptId: string;
}): {
  messages: typeof params.activePath;
  parentMessageId: string | null;
  anchorUserMessageId: string;
} | null {
  const assistantIndex = params.activePath.findIndex((m) => m.id === params.assistantMessageId);
  if (assistantIndex < 0) return null;

  const assistant = params.activePath[assistantIndex];
  if (assistant.role !== 'assistant') return null;

  const userMessage = params.activePath[assistantIndex - 1];
  if (!userMessage || userMessage.role !== 'user') return null;

  const history = params.activePath.slice(0, assistantIndex);
  const newAssistantId = `asst-${params.attemptId}`;

  return {
    messages: [
      ...history,
      {
        ...assistant,
        id: newAssistantId,
        parentMessageId: userMessage.id,
        parts: [{ type: 'text', text: '' }],
      },
    ],
    parentMessageId: userMessage.id,
    anchorUserMessageId: userMessage.id,
  };
}

export function buildEditResubmitMessages(params: {
  activePath: Array<{ id: string; role: string; parts?: unknown; parentMessageId?: string | null }>;
  userMessageId: string;
  content: string;
  attemptId: string;
}): {
  messages: typeof params.activePath;
  parentMessageId: string | null;
} | null {
  const userIndex = params.activePath.findIndex((m) => m.id === params.userMessageId);
  if (userIndex < 0) return null;

  const userMessage = params.activePath[userIndex];
  if (userMessage.role !== 'user') return null;

  const history = params.activePath.slice(0, userIndex);
  const newUserId = `user-${params.attemptId}`;
  const newAssistantId = `asst-${params.attemptId}`;

  const parentMessageId =
    userMessage.parentMessageId ??
    (userIndex > 0 ? params.activePath[userIndex - 1]?.id ?? null : null);

  return {
    messages: [
      ...history,
      {
        ...userMessage,
        id: newUserId,
        parentMessageId,
        parts: [{ type: 'text', text: params.content }],
      },
      {
        id: newAssistantId,
        role: 'assistant',
        parentMessageId: newUserId,
        parts: [{ type: 'text', text: '' }],
      },
    ],
    parentMessageId,
  };
}

export function operationToBranchAction(
  operation: ChatOperation | undefined
): BranchAction | null {
  if (!operation) return null;

  switch (operation.type) {
    case 'regenerate':
      return {
        type: 'regenerate',
        assistantMessageId: operation.assistantMessageId,
        attemptId: operation.attemptId,
      };
    case 'edit-resubmit':
      return {
        type: 'edit-resubmit',
        userMessageId: operation.userMessageId,
        content: operation.content,
        attemptId: operation.attemptId,
      };
    case 'select-leaf':
      return { type: 'select-leaf', leafMessageId: operation.leafMessageId };
    case 'fork':
      return { type: 'fork', forkThroughMessageId: operation.forkThroughMessageId };
    default:
      return null;
  }
}
