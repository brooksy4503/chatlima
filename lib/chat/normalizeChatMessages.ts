import type { CompareUIMessage } from '@/lib/chat/compareHistory';

export function normalizeChatMessages(source: CompareUIMessage[]): CompareUIMessage[] {
  return source.map((msg) => ({
    id: msg.id,
    role: msg.role,
    parts: msg.parts,
    createdAt: msg.createdAt,
    hasWebSearch: msg.hasWebSearch,
    webSearchContextSize: msg.webSearchContextSize,
    modelId: msg.modelId,
    modelProvider: msg.modelProvider,
    modelDisplayName: msg.modelDisplayName,
    comparisonTurnId: msg.comparisonTurnId,
    parentMessageId: msg.parentMessageId,
  }));
}
