export type ModelSnapshot = {
  modelId: string;
  modelProvider: string | null;
  modelDisplayName: string | null;
};

export function buildModelSnapshot(params: {
  selectedModel: string;
  modelDisplayName?: string | null;
  modelProvider?: string | null;
}): ModelSnapshot {
  const { selectedModel, modelDisplayName, modelProvider } = params;
  const provider =
    modelProvider ?? (selectedModel.includes('/') ? selectedModel.split('/')[0] : null);

  return {
    modelId: selectedModel,
    modelProvider: provider,
    modelDisplayName:
      modelDisplayName ??
      selectedModel.split('/').pop() ??
      selectedModel,
  };
}
