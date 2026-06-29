export function getModelDisplayName(
  modelId: string,
  availableModels: Array<{ id: string; name: string }>
): string {
  return availableModels.find((m) => m.id === modelId)?.name ?? modelId.split('/').pop() ?? modelId;
}
