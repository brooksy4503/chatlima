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

  const existingParts = Array.isArray(userMessage.parts) ? userMessage.parts : [];
  const nonTextParts = existingParts.filter(
    (part) =>
      typeof part === 'object' &&
      part !== null &&
      'type' in part &&
      (part as { type: string }).type !== 'text'
  );
  const editedParts = [...nonTextParts, { type: 'text', text: params.content }];

  return {
    messages: [
      ...history,
      {
        ...userMessage,
        id: newUserId,
        parentMessageId,
        parts: editedParts,
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
