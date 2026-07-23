import type { UIMessage } from 'ai';

export type CompareUIMessage = UIMessage & {
  modelId?: string | null;
  modelProvider?: string | null;
  modelDisplayName?: string | null;
  comparisonTurnId?: string | null;
  parentMessageId?: string | null;
  latencyMs?: number;
  createdAt?: Date | string;
  hasWebSearch?: boolean;
  webSearchContextSize?: 'low' | 'medium' | 'high';
};

/**
 * Build per-model message history for compare streaming.
 * Excludes assistant responses from the same comparison turn (sibling models).
 */
export function buildModelHistory(
  allMessages: CompareUIMessage[],
  modelId: string,
  activeComparisonTurnId: string
): UIMessage[] {
  return allMessages
    .filter((msg) => {
      if (msg.comparisonTurnId !== activeComparisonTurnId) {
        return true;
      }
      if (msg.role === 'user') {
        return true;
      }
      if (msg.role === 'assistant' && msg.modelId === modelId) {
        return true;
      }
      return false;
    })
    .map(({ id, role, parts }) => ({ id, role, parts }));
}

function compareAssistantSort(a: CompareUIMessage, b: CompareUIMessage): number {
  const aTime =
    a.createdAt instanceof Date
      ? a.createdAt.getTime()
      : typeof a.createdAt === 'string'
        ? new Date(a.createdAt).getTime()
        : 0;
  const bTime =
    b.createdAt instanceof Date
      ? b.createdAt.getTime()
      : typeof b.createdAt === 'string'
        ? new Date(b.createdAt).getTime()
        : 0;
  if (aTime !== bTime) return aTime - bTime;
  return (a.id ?? '').localeCompare(b.id ?? '');
}

/**
 * Expand a branch active path so every comparison turn includes all assistant
 * siblings from the full graph. Branching stores compare assistants as siblings
 * under the compare user message, so buildActivePathMessages only returns one.
 */
export function expandComparisonTurnsInPath(
  activePath: CompareUIMessage[],
  allMessages: CompareUIMessage[]
): CompareUIMessage[] {
  if (activePath.length === 0) return activePath;

  const assistantsByTurn = new Map<string, CompareUIMessage[]>();
  for (const message of allMessages) {
    if (message.role !== 'assistant' || !message.comparisonTurnId) continue;
    const siblings = assistantsByTurn.get(message.comparisonTurnId) ?? [];
    siblings.push(message);
    assistantsByTurn.set(message.comparisonTurnId, siblings);
  }

  for (const siblings of assistantsByTurn.values()) {
    siblings.sort(compareAssistantSort);
  }

  const expandedTurns = new Set<string>();
  const result: CompareUIMessage[] = [];

  for (const message of activePath) {
    const turnId = message.comparisonTurnId;

    if (message.role === 'assistant' && turnId && expandedTurns.has(turnId)) {
      continue;
    }

    result.push(message);

    if (message.role === 'user' && turnId && !expandedTurns.has(turnId)) {
      expandedTurns.add(turnId);
      const siblings = assistantsByTurn.get(turnId) ?? [];
      for (const sibling of siblings) {
        if (!result.some((existing) => existing.id === sibling.id)) {
          result.push(sibling);
        }
      }
    }
  }

  return result;
}

/**
 * After a partial promote, non-promoted assistants can keep `comparisonTurnId`
 * while the user/promoted pair had it cleared. Incomplete turns must behave as
 * normal branch siblings (pager + message actions), not as live compare turns.
 */
export function stripOrphanComparisonTurnIds<T extends CompareUIMessage>(
  messages: T[]
): T[] {
  if (messages.length === 0) return messages;

  const completeTurnIds = new Set(
    messages
      .filter((message) => message.role === 'user' && Boolean(message.comparisonTurnId))
      .map((message) => message.comparisonTurnId as string)
  );

  let changed = false;
  const next = messages.map((message) => {
    if (!message.comparisonTurnId || completeTurnIds.has(message.comparisonTurnId)) {
      return message;
    }
    changed = true;
    return { ...message, comparisonTurnId: null };
  });

  return changed ? next : messages;
}

/**
 * True when in-memory state reflects a promoted compare turn that DB hydration
 * would re-expand back to all model siblings.
 */
export function isLocalComparePromotionAheadOfDb(
  current: CompareUIMessage[],
  fromDb: CompareUIMessage[]
): boolean {
  for (let index = 0; index < current.length; index++) {
    const message = current[index];
    if (message.role !== 'user' || message.comparisonTurnId) {
      continue;
    }

    const dbUser = fromDb.find((candidate) => candidate.id === message.id);
    const dbTurnId = dbUser?.comparisonTurnId;
    if (!dbTurnId) {
      continue;
    }

    const dbAssistantsForTurn = fromDb.filter(
      (candidate) =>
        candidate.role === 'assistant' && candidate.comparisonTurnId === dbTurnId
    );
    const currentAssistantsForTurn: CompareUIMessage[] = [];

    for (let cursor = index + 1; cursor < current.length; cursor++) {
      const next = current[cursor];
      if (next.role === 'user') {
        break;
      }
      if (next.role === 'assistant') {
        currentAssistantsForTurn.push(next);
      }
    }

    if (
      dbAssistantsForTurn.length > currentAssistantsForTurn.length &&
      currentAssistantsForTurn.length >= 1 &&
      currentAssistantsForTurn.every((assistant) =>
        dbAssistantsForTurn.some((dbAssistant) => dbAssistant.id === assistant.id)
      )
    ) {
      return true;
    }
  }

  return false;
}

export function groupMessagesByComparisonTurn(
  messages: CompareUIMessage[]
): Array<{ turnId: string | null; messages: CompareUIMessage[] }> {
  const groups: Array<{ turnId: string | null; messages: CompareUIMessage[] }> = [];
  let current: CompareUIMessage[] = [];
  let currentTurnId: string | null | undefined = undefined;

  for (const msg of messages) {
    const turnId = msg.comparisonTurnId ?? null;
    if (currentTurnId === undefined) {
      currentTurnId = turnId;
    }
    if (turnId !== currentTurnId && current.length > 0) {
      groups.push({ turnId: currentTurnId ?? null, messages: current });
      current = [];
      currentTurnId = turnId;
    }
    current.push(msg);
  }

  if (current.length > 0) {
    groups.push({ turnId: currentTurnId ?? null, messages: current });
  }

  return groups;
}
