import type { UIMessage } from 'ai';

export interface CompareRequestBody {
  chatId: string;
  messages: UIMessage[];
  compareModels: string[];
  comparisonTurnId: string;
  userMessageId: string;
  apiKeys: Record<string, string>;
}

export type CompareStreamEvent =
  | { type: 'model-start'; modelId: string; index: number; messageId: string }
  | { type: 'text-delta'; modelId: string; delta: string }
  | { type: 'model-finish'; modelId: string; messageId: string; latencyMs: number; inputTokens: number; outputTokens: number }
  | { type: 'model-error'; modelId: string; messageId: string; error: string }
  | { type: 'turn-complete'; comparisonTurnId: string }
  | { type: 'error'; message: string; code?: string };

export function parseCompareRequestBody(body: unknown): CompareRequestBody {
  const raw = (body ?? {}) as Record<string, unknown>;
  const compareModels = Array.isArray(raw.compareModels)
    ? (raw.compareModels as string[]).filter((m) => typeof m === 'string')
    : [];

  return {
    chatId: String(raw.chatId ?? ''),
    messages: (raw.messages as UIMessage[]) ?? [],
    compareModels,
    comparisonTurnId: String(raw.comparisonTurnId ?? ''),
    userMessageId: String(raw.userMessageId ?? ''),
    apiKeys: (raw.apiKeys as Record<string, string>) ?? {},
  };
}

export function encodeCompareEvent(event: CompareStreamEvent): string {
  return JSON.stringify(event) + '\n';
}
