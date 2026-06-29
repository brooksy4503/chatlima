export interface MessageModelSnapshot {
  modelId?: string | null;
  modelProvider?: string | null;
  modelDisplayName?: string | null;
  comparisonTurnId?: string | null;
}

export function buildModelSnapshot(modelId: string, displayName?: string): MessageModelSnapshot {
  const provider = modelId.split('/')[0] ?? null;
  return {
    modelId,
    modelProvider: provider,
    modelDisplayName: displayName ?? modelId,
  };
}

export function buildComparisonTurnSnapshot(
  comparisonTurnId: string
): Pick<MessageModelSnapshot, 'comparisonTurnId'> {
  return { comparisonTurnId };
}
