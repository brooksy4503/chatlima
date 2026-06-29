import type { UIMessage } from 'ai';
import { getUIMessageText } from '@/lib/message-utils';

export type CompareUIMessage = UIMessage & {
  modelId?: string | null;
  modelProvider?: string | null;
  modelDisplayName?: string | null;
  comparisonTurnId?: string | null;
  latencyMs?: number;
  createdAt?: Date | string;
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

export function isComparisonTurn(turnId: string | null): boolean {
  return turnId !== null;
}

export function getUserMessageText(msg: CompareUIMessage): string {
  return getUIMessageText(msg);
}

export function extractComparisonTurns(messages: CompareUIMessage[]): CompareUIMessage[][] {
  const groups = groupMessagesByComparisonTurn(messages);
  return groups
    .filter((g) => isComparisonTurn(g.turnId))
    .map((g) => g.messages);
}
