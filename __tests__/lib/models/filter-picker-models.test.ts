import {
  filterPickerModels,
  hasAnyUserApiKeys,
  hasProviderApiKey,
  listProvidersWithKeyStatus,
} from '@/lib/models/filter-picker-models';
import type { ModelInfo } from '@/lib/types/models';

function makeModel(overrides: Partial<ModelInfo> = {}): ModelInfo {
  return {
    id: 'openrouter/openai/gpt-4.1',
    provider: 'OpenRouter',
    name: 'GPT-4.1',
    description: 'Test',
    capabilities: ['Text'],
    premium: true,
    vision: false,
    status: 'available',
    lastChecked: new Date(),
    pricing: { input: 0.000003, output: 0.000012, currency: 'USD' },
    ...overrides,
  };
}

const models: ModelInfo[] = [
  makeModel({ id: 'openrouter/openai/gpt-4.1', name: 'GPT-4.1', provider: 'OpenRouter' }),
  makeModel({ id: 'groq/qwen/qwen3', name: 'Qwen 3', provider: 'Groq', capabilities: ['fast'] }),
  makeModel({ id: 'openai/gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'OpenAI' }),
];

describe('filter-picker-models', () => {
  describe('hasProviderApiKey', () => {
    it('returns true when user has matching provider key', () => {
      expect(
        hasProviderApiKey('groq/qwen/qwen3', { GROQ_API_KEY: 'gsk-test' })
      ).toBe(true);
    });

    it('returns false when key is missing or blank', () => {
      expect(hasProviderApiKey('groq/qwen/qwen3', {})).toBe(false);
      expect(hasProviderApiKey('groq/qwen/qwen3', { GROQ_API_KEY: '   ' })).toBe(false);
    });
  });

  describe('hasAnyUserApiKeys', () => {
    it('returns true when any key is non-empty', () => {
      expect(hasAnyUserApiKeys({ OPENAI_API_KEY: 'sk-test' })).toBe(true);
    });

    it('returns false when keys are empty or absent', () => {
      expect(hasAnyUserApiKeys({})).toBe(false);
      expect(hasAnyUserApiKeys({ OPENAI_API_KEY: '  ' })).toBe(false);
    });
  });

  describe('listProvidersWithKeyStatus', () => {
    it('returns unique providers sorted by name with key status', () => {
      const result = listProvidersWithKeyStatus(models, {
        GROQ_API_KEY: 'gsk-test',
      });

      expect(result.map((provider) => provider.name)).toEqual(['Groq', 'OpenAI', 'OpenRouter']);
      expect(result.find((provider) => provider.name === 'Groq')?.hasKey).toBe(true);
      expect(result.find((provider) => provider.name === 'OpenAI')?.hasKey).toBe(false);
    });
  });

  describe('filterPickerModels', () => {
    const baseInput = {
      models,
      activeTab: 'all' as const,
      favorites: ['openrouter/openai/gpt-4.1'],
      searchTerm: '',
      providerFilter: 'all' as const,
      byokOnly: false,
      userApiKeys: { GROQ_API_KEY: 'gsk-test' },
    };

    it('filters favorites tab', () => {
      const result = filterPickerModels({ ...baseInput, activeTab: 'favorites' });
      expect(result.map((model) => model.id)).toEqual(['openrouter/openai/gpt-4.1']);
    });

    it('filters by provider', () => {
      const result = filterPickerModels({ ...baseInput, providerFilter: 'Groq' });
      expect(result.map((model) => model.name)).toEqual(['Qwen 3']);
    });

    it('filters by BYOK only', () => {
      const result = filterPickerModels({ ...baseInput, byokOnly: true });
      expect(result.map((model) => model.name)).toEqual(['Qwen 3']);
    });

    it('combines provider and BYOK filters', () => {
      const result = filterPickerModels({
        ...baseInput,
        providerFilter: 'Groq',
        byokOnly: true,
      });
      expect(result.map((model) => model.name)).toEqual(['Qwen 3']);
    });

    it('returns empty when provider and BYOK do not overlap', () => {
      const result = filterPickerModels({
        ...baseInput,
        providerFilter: 'OpenAI',
        byokOnly: true,
      });
      expect(result).toEqual([]);
    });

    it('filters by search term across name, provider, and capabilities', () => {
      expect(
        filterPickerModels({ ...baseInput, searchTerm: 'qwen' }).map((model) => model.name)
      ).toEqual(['Qwen 3']);

      expect(
        filterPickerModels({ ...baseInput, searchTerm: 'openrouter' }).map((model) => model.name)
      ).toEqual(['GPT-4.1']);

      expect(
        filterPickerModels({ ...baseInput, searchTerm: 'fast' }).map((model) => model.name)
      ).toEqual(['Qwen 3']);
    });

    it('sorts results by model name', () => {
      const result = filterPickerModels(baseInput);
      expect(result.map((model) => model.name)).toEqual(['GPT-4.1', 'GPT-4.1 Mini', 'Qwen 3']);
    });
  });
});
