import {
  calculateModelPriority,
  sortModelsByPriority,
  getTopModelsForPreRender,
  getModelsByCategory,
  getRelatedModels,
  getPrebuiltComparisonSlug,
  getAllPrebuiltComparisonSlugs,
  PREBUILT_COMPARISONS,
} from '@/lib/models/model-priority';
import { ModelInfo } from '@/lib/types/models';

// Helper: create a minimal valid ModelInfo with sensible defaults
function makeModel(overrides: Partial<ModelInfo> = {}): ModelInfo {
  return {
    id: 'test/model',
    provider: 'TestProvider',
    name: 'Test Model',
    capabilities: [],
    premium: false,
    vision: false,
    status: 'available',
    lastChecked: new Date(),
    ...overrides,
  };
}

describe('calculateModelPriority', () => {
  it('gives base score of 10 for a bare non-premium model', () => {
    const model = makeModel();
    const score = calculateModelPriority(model);
    expect(score).toBe(10);
  });

  it('adds 50 for premium models instead of 10', () => {
    const premium = makeModel({ premium: true });
    const free = makeModel({ premium: false });
    expect(calculateModelPriority(premium)).toBe(50);
    expect(calculateModelPriority(free)).toBe(10);
  });

  it('adds 20 for vision capability', () => {
    const model = makeModel({ vision: true });
    // base 10 + vision 20
    expect(calculateModelPriority(model)).toBe(30);
  });

  it('adds 30 for reasoning capability (case-insensitive)', () => {
    const model = makeModel({ capabilities: ['Reasoning'] });
    expect(calculateModelPriority(model)).toBe(40); // 10 + 30
  });

  it('adds 25 for coding capability', () => {
    const model = makeModel({ capabilities: ['coding'] });
    expect(calculateModelPriority(model)).toBe(35); // 10 + 25
  });

  it('adds 15 for fast capability', () => {
    const model = makeModel({ capabilities: ['fast'] });
    expect(calculateModelPriority(model)).toBe(25); // 10 + 15
  });

  it('stacks multiple capabilities', () => {
    const model = makeModel({ capabilities: ['reasoning', 'coding', 'fast'] });
    expect(calculateModelPriority(model)).toBe(80); // 10 + 30 + 25 + 15
  });

  it('awards context length tiers correctly', () => {
    const huge = makeModel({ contextMax: 200000 });
    const large = makeModel({ contextMax: 100000 });
    const medium = makeModel({ contextMax: 50000 });
    const small = makeModel({ contextMax: 1000 });
    const none = makeModel();

    // base 10 + context bonus
    expect(calculateModelPriority(huge)).toBe(35);   // 10 + 25
    expect(calculateModelPriority(large)).toBe(30);  // 10 + 20
    expect(calculateModelPriority(medium)).toBe(25); // 10 + 15
    expect(calculateModelPriority(small)).toBe(10);  // no bonus
    expect(calculateModelPriority(none)).toBe(10);   // no bonus
  });

  it('adds 15 for :free suffix in model id', () => {
    const model = makeModel({ id: 'openai/gpt-4o-mini:free' });
    expect(calculateModelPriority(model)).toBe(25); // 10 + 15
  });

  it('adds 10 for top-tier providers (case-insensitive)', () => {
    const providers = ['OpenRouter', 'OpenAI', 'Anthropic', 'Google', 'Mistral'];
    for (const p of providers) {
      const model = makeModel({ provider: p });
      expect(calculateModelPriority(model)).toBe(20); // 10 + 10
    }
  });

  it('does not add provider bonus for unknown providers', () => {
    const model = makeModel({ provider: 'SomeRandomProvider' });
    expect(calculateModelPriority(model)).toBe(10);
  });

  it('calculates a complex model score correctly', () => {
    const model = makeModel({
      id: 'openai/gpt-5.2-pro',
      provider: 'openai',
      premium: true,
      vision: true,
      capabilities: ['reasoning', 'coding'],
      contextMax: 200000,
    });
    // premium: 50, vision: 20, reasoning: 30, coding: 25, context 200k: 25, provider: 10
    // Total: 160
    expect(calculateModelPriority(model)).toBe(160);
  });
});

describe('sortModelsByPriority', () => {
  it('sorts models by priority score descending', () => {
    const low = makeModel({ id: 'low', name: 'Low Priority' });
    const high = makeModel({ id: 'high', name: 'High Priority', premium: true, vision: true });
    const mid = makeModel({ id: 'mid', name: 'Mid Priority', vision: true });

    const sorted = sortModelsByPriority([low, high, mid]);
    expect(sorted.map(m => m.id)).toEqual(['high', 'mid', 'low']);
  });

  it('breaks ties alphabetically by name', () => {
    const zModel = makeModel({ id: 'z', name: 'Zebra Model', premium: true });
    const aModel = makeModel({ id: 'a', name: 'Alpha Model', premium: true });

    const sorted = sortModelsByPriority([zModel, aModel]);
    // Both have same score (50), so alpha wins
    expect(sorted[0].name).toBe('Alpha Model');
    expect(sorted[1].name).toBe('Zebra Model');
  });

  it('returns empty array for empty input', () => {
    expect(sortModelsByPriority([])).toEqual([]);
  });

  it('does not mutate the original array', () => {
    const models = [
      makeModel({ id: 'low', name: 'Low' }),
      makeModel({ id: 'high', name: 'High', premium: true }),
    ];
    const originalOrder = models.map(m => m.id);
    sortModelsByPriority(models);
    expect(models.map(m => m.id)).toEqual(originalOrder);
  });
});

describe('getTopModelsForPreRender', () => {
  it('returns the top N models by priority', () => {
    const models = Array.from({ length: 15 }, (_, i) =>
      makeModel({ id: `model-${i}`, name: `Model ${i}`, premium: i < 5 })
    );

    const top3 = getTopModelsForPreRender(models, 3);
    expect(top3).toHaveLength(3);
    // Premium models should be in the top 5
    expect(top3.every(m => m.premium)).toBe(true);
  });

  it('defaults to 100 when no count specified', () => {
    const models = Array.from({ length: 5 }, (_, i) =>
      makeModel({ id: `model-${i}`, name: `Model ${i}` })
    );
    const result = getTopModelsForPreRender(models);
    expect(result).toHaveLength(5); // fewer than 100, returns all
  });
});

describe('getModelsByCategory', () => {
  it('groups models into correct categories', () => {
    const models = [
      makeModel({ id: 'premium-1', premium: true }),
      makeModel({ id: 'free-1', id_override: undefined }),
      makeModel({ id: 'free-2', name: 'Free Model' }),
      makeModel({ id: 'vision-1', vision: true }),
      makeModel({ id: 'coding-1', capabilities: ['coding'] }),
      makeModel({ id: 'reasoning-1', capabilities: ['reasoning'] }),
    ];
    // Fix the free model
    models[1] = makeModel({ id: 'provider/model:free' });
    models[2] = makeModel({ id: 'provider/other:free' });

    const cats = getModelsByCategory(models);

    expect(cats.premium).toHaveLength(1);
    expect(cats.free).toHaveLength(2);
    expect(cats.vision).toHaveLength(1);
    expect(cats.coding).toHaveLength(1);
    expect(cats.reasoning).toHaveLength(1);
  });

  it('limits each category to 10 models', () => {
    const models = Array.from({ length: 15 }, (_, i) =>
      makeModel({
        id: `p/model-${i}`,
        name: `Model ${i}`,
        premium: true,
        vision: true,
        capabilities: ['coding', 'reasoning'],
      })
    );

    const cats = getModelsByCategory(models);
    expect(cats.premium).toHaveLength(10);
    expect(cats.vision).toHaveLength(10);
    expect(cats.coding).toHaveLength(10);
    expect(cats.reasoning).toHaveLength(10);
  });

  it('returns empty arrays for categories with no matches', () => {
    const model = makeModel({ id: 'plain/model' });
    const cats = getModelsByCategory([model]);

    expect(cats.premium).toEqual([]);
    expect(cats.free).toEqual([]);
    expect(cats.vision).toEqual([]);
    expect(cats.coding).toEqual([]);
    expect(cats.reasoning).toEqual([]);
  });
});

describe('getRelatedModels', () => {
  it('excludes the current model from results', () => {
    const current = makeModel({ id: 'openai/gpt-5', provider: 'openai' });
    const others = [
      makeModel({ id: 'openai/gpt-4', provider: 'openai' }),
      makeModel({ id: 'anthropic/claude', provider: 'anthropic' }),
    ];

    const related = getRelatedModels(current, others);
    expect(related.find(m => m.id === 'openai/gpt-5')).toBeUndefined();
  });

  it('prioritizes same-provider models', () => {
    const current = makeModel({ id: 'openai/gpt-5', provider: 'openai' });
    const others = [
      makeModel({ id: 'google/gemini', provider: 'google', name: 'Gemini' }),
      makeModel({ id: 'openai/gpt-4', provider: 'openai', name: 'GPT-4' }),
    ];

    const related = getRelatedModels(current, others, 1);
    expect(related[0].id).toBe('openai/gpt-4');
  });

  it('respects the count parameter', () => {
    const current = makeModel({ id: 'm/current' });
    const others = Array.from({ length: 10 }, (_, i) =>
      makeModel({ id: `m/other-${i}`, name: `Other ${i}` })
    );

    const related = getRelatedModels(current, others, 3);
    expect(related).toHaveLength(3);
  });

  it('defaults to 4 related models', () => {
    const current = makeModel({ id: 'm/current' });
    const others = Array.from({ length: 10 }, (_, i) =>
      makeModel({ id: `m/other-${i}`, name: `Other ${i}` })
    );

    const related = getRelatedModels(current, others);
    expect(related).toHaveLength(4);
  });
});

describe('getPrebuiltComparisonSlug', () => {
  it('returns a slug for a known comparison pair', () => {
    const slug = getPrebuiltComparisonSlug(
      'openai/gpt-5.2-pro',
      'anthropic/claude-opus-4.6'
    );
    expect(slug).not.toBeNull();
    expect(slug).toContain('-vs-');
  });

  it('finds the comparison regardless of argument order', () => {
    const slug1 = getPrebuiltComparisonSlug('openai/gpt-5.2-pro', 'anthropic/claude-opus-4.6');
    const slug2 = getPrebuiltComparisonSlug('anthropic/claude-opus-4.6', 'openai/gpt-5.2-pro');
    expect(slug1).toBe(slug2);
  });

  it('returns null for an unknown pair', () => {
    const slug = getPrebuiltComparisonSlug('fake/model-a', 'fake/model-b');
    expect(slug).toBeNull();
  });
});

describe('getAllPrebuiltComparisonSlugs', () => {
  it('returns a slug for every prebuilt comparison', () => {
    const slugs = getAllPrebuiltComparisonSlugs();
    expect(slugs).toHaveLength(PREBUILT_COMPARISONS.length);
  });

  it('every slug contains -vs-', () => {
    const slugs = getAllPrebuiltComparisonSlugs();
    expect(slugs.every(s => s.includes('-vs-'))).toBe(true);
  });

  it('produces no duplicate slugs', () => {
    const slugs = getAllPrebuiltComparisonSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
