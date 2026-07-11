import { hasProviderByokForModel } from '@/lib/services/accessGateService';
import type { ModelInfo } from '@/lib/types/models';

export type PickerTab = 'all' | 'favorites';
export type ProviderFilter = 'all' | string;

export interface ProviderWithKeyStatus {
  name: string;
  hasKey: boolean;
}

export interface FilterPickerModelsInput {
  models: ModelInfo[];
  activeTab: PickerTab;
  favorites: string[];
  searchTerm: string;
  providerFilter: ProviderFilter;
  byokOnly: boolean;
  userApiKeys: Record<string, string>;
}

export function hasProviderApiKey(
  modelId: string,
  userApiKeys: Record<string, string>
): boolean {
  return hasProviderByokForModel(modelId, userApiKeys);
}

export function hasAnyUserApiKeys(userApiKeys: Record<string, string>): boolean {
  return Object.values(userApiKeys).some((value) => value.trim().length > 0);
}

export function listProvidersWithKeyStatus(
  models: ModelInfo[],
  userApiKeys: Record<string, string>
): ProviderWithKeyStatus[] {
  const providerNames = [...new Set(models.map((model) => model.provider))].sort((a, b) =>
    a.localeCompare(b)
  );

  return providerNames.map((name) => ({
    name,
    hasKey: models.some(
      (model) => model.provider === name && hasProviderApiKey(model.id, userApiKeys)
    ),
  }));
}

function matchesSearchTerm(model: ModelInfo, searchTerm: string): boolean {
  if (!searchTerm.trim()) return true;

  const searchLower = searchTerm.toLowerCase();
  return (
    model.name.toLowerCase().includes(searchLower) ||
    model.provider.toLowerCase().includes(searchLower) ||
    model.capabilities.some((capability) => capability.toLowerCase().includes(searchLower))
  );
}

export function filterPickerModels({
  models,
  activeTab,
  favorites,
  searchTerm,
  providerFilter,
  byokOnly,
  userApiKeys,
}: FilterPickerModelsInput): ModelInfo[] {
  return models
    .filter((model) => {
      if (activeTab === 'favorites' && !favorites.includes(model.id)) {
        return false;
      }
      if (providerFilter !== 'all' && model.provider !== providerFilter) {
        return false;
      }
      if (byokOnly && !hasProviderApiKey(model.id, userApiKeys)) {
        return false;
      }
      return matchesSearchTerm(model, searchTerm);
    })
    .sort((modelA, modelB) => modelA.name.localeCompare(modelB.name));
}
