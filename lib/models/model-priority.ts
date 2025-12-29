import { ModelInfo } from '@/lib/types/models';
import { modelIdToSlug } from './slug-utils';

export interface ModelPriority {
  model: ModelInfo;
  score: number;
}

/**
 * Calculate priority score for a model based on various factors
 * Higher score = higher priority for pre-rendering
 */
export function calculateModelPriority(model: ModelInfo): number {
  let score = 0;

  // Factor 1: Premium models (higher priority)
  if (model.premium) {
    score += 50;
  } else {
    // Free models still valuable, but lower priority
    score += 10;
  }

  // Factor 2: Vision capability
  if (model.vision) {
    score += 20;
  }

  // Factor 3: Key capabilities
  const capabilities = model.capabilities.map(c => c.toLowerCase());
  if (capabilities.includes('reasoning')) {
    score += 30;
  }
  if (capabilities.includes('coding')) {
    score += 25;
  }
  if (capabilities.includes('fast')) {
    score += 15;
  }

  // Factor 4: Context length (larger is generally more impressive)
  if (model.contextMax) {
    if (model.contextMax >= 200000) {
      score += 25; // Very large context
    } else if (model.contextMax >= 100000) {
      score += 20; // Large context
    } else if (model.contextMax >= 50000) {
      score += 15; // Medium context
    }
  }

  // Factor 5: Free models (:free suffix)
  if (model.id.endsWith(':free')) {
    score += 15;
  }

  // Factor 6: Provider reputation
  const provider = model.provider.toLowerCase();
  const topProviders = ['openrouter', 'openai', 'anthropic', 'google', 'mistral'];
  if (topProviders.includes(provider)) {
    score += 10;
  }

  return score;
}

/**
 * Sort models by priority score (highest first)
 */
export function sortModelsByPriority(models: ModelInfo[]): ModelInfo[] {
  const prioritized = models.map(model => ({
    model,
    score: calculateModelPriority(model)
  }));

  return prioritized
    .sort((a, b) => {
      // Sort by score descending
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Tiebreaker: alphabetically by name
      return a.model.name.localeCompare(b.model.name);
    })
    .map(p => p.model);
}

/**
 * Get top N models for pre-rendering at build time
 */
export function getTopModelsForPreRender(models: ModelInfo[], count: number = 100): ModelInfo[] {
  const sorted = sortModelsByPriority(models);
  return sorted.slice(0, count);
}

/**
 * Get top models by category for featured sections
 */
export function getModelsByCategory(models: ModelInfo[]) {
  return {
    premium: models.filter(m => m.premium).slice(0, 10),
    free: models.filter(m => m.id.endsWith(':free')).slice(0, 10),
    vision: models.filter(m => m.vision).slice(0, 10),
    coding: models.filter(m => m.capabilities.some(c =>
      c.toLowerCase().includes('coding') || c.toLowerCase().includes('code')
    )).slice(0, 10),
    reasoning: models.filter(m => m.capabilities.some(c =>
      c.toLowerCase().includes('reasoning') || c.toLowerCase().includes('thinking')
    )).slice(0, 10)
  };
}

/**
 * Get related models for cross-linking
 * Returns models from same provider or with similar capabilities
 */
export function getRelatedModels(
  currentModel: ModelInfo,
  allModels: ModelInfo[],
  count: number = 4
): ModelInfo[] {
  const related = allModels
    .filter(m => m.id !== currentModel.id) // Exclude current model
    .map(model => ({
      model,
      relevanceScore: calculateRelevanceScore(currentModel, model)
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, count)
    .map(r => r.model);

  return related;
}

/**
 * Calculate relevance score between two models for related model recommendations
 */
function calculateRelevanceScore(model1: ModelInfo, model2: ModelInfo): number {
  let score = 0;

  // Same provider = high relevance
  if (model1.provider === model2.provider) {
    score += 50;
  }

  // Same premium status = medium relevance
  if (model1.premium === model2.premium) {
    score += 20;
  }

  // Shared capabilities
  const capabilities1 = new Set(model1.capabilities.map(c => c.toLowerCase()));
  const capabilities2 = new Set(model2.capabilities.map(c => c.toLowerCase()));
  const sharedCapabilities = [...capabilities1].filter(c => capabilities2.has(c));
  score += sharedCapabilities.length * 10;

  // Both have vision or both don't
  if (model1.vision === model2.vision) {
    score += 15;
  }

  return score;
}

/**
 * Pre-built comparison pairs for top models
 * These will be pre-rendered at build time
 */
export const PREBUILT_COMPARISONS: Array<{
  model1Id: string;
  model2Id: string;
  reason: string;
}> = [
  {
    model1Id: 'openai/gpt-5-pro',
    model2Id: 'anthropic/claude-3-5-sonnet',
    reason: 'Two top frontier models compared'
  },
  {
    model1Id: 'openai/gpt-5-pro',
    model2Id: 'google/gemini-3-flash-preview',
    reason: 'Latest OpenAI vs Google flagship'
  },
  {
    model1Id: 'anthropic/claude-3-5-sonnet',
    model2Id: 'google/gemini-3-flash-preview',
    reason: 'Best reasoning models comparison'
  },
  {
    model1Id: 'openai/gpt-5-chat',
    model2Id: 'openai/gpt-5-pro',
    reason: 'GPT-5 Chat vs Pro comparison'
  },
  {
    model1Id: 'mistralai/devstral-2512',
    model2Id: 'allenai/olmo-3.1-32b-think:free',
    reason: 'Top coding models comparison'
  },
  {
    model1Id: 'xiaomi/mimo-v2-flash:free',
    model2Id: 'allenai/olmo-3.1-32b-think:free',
    reason: 'Best free coding models'
  },
  {
    model1Id: 'openai/gpt-5-pro',
    model2Id: 'openrouter/gemini-2.5-flash',
    reason: 'Frontier model comparison'
  },
  {
    model1Id: 'anthropic/claude-3-5-sonnet',
    model2Id: 'openai/gpt-4o',
    reason: 'Claude vs GPT-4o comparison'
  },
  {
    model1Id: 'google/gemini-3-flash-preview',
    model2Id: 'xiaomi/mimo-v2-flash:free',
    reason: 'Free vs paid vision models'
  },
  {
    model1Id: 'openai/gpt-5-pro',
    model2Id: 'mistralai/devstral-2512',
    reason: 'Best models for agentic coding'
  },
  {
    model1Id: 'anthropic/claude-3-5-sonnet',
    model2Id: 'mistralai/devstral-2512',
    reason: 'Reasoning vs agentic coding'
  },
  {
    model1Id: 'openai/gpt-5-chat',
    model2Id: 'google/gemini-3-flash-preview',
    reason: 'Fast chat models comparison'
  },
  {
    model1Id: 'nvidia/nemotron-3-nano-30b-a3b:free',
    model2Id: 'allenai/olmo-3.1-32b-think:free',
    reason: 'NVIDIA vs AllenAI open models'
  },
  {
    model1Id: 'openrouter/z-ai/glm-4.7',
    model2Id: 'openrouter/google/gemini-2.5-flash',
    reason: 'Z.AI vs Google comparison'
  },
  {
    model1Id: 'openai/gpt-5-pro',
    model2Id: 'minimax/minimax-m2.1',
    reason: 'OpenAI vs MiniMax comparison'
  },
  {
    model1Id: 'anthropic/claude-3-5-sonnet',
    model2Id: 'xiaomi/mimo-v2-flash:free',
    reason: 'Premium vs free reasoning models'
  },
  {
    model1Id: 'openrouter/bytedance-seed/seed-1.6-flash',
    model2Id: 'google/gemini-3-flash-preview',
    reason: 'ByteDance vs Google flash models'
  },
  {
    model1Id: 'openai/gpt-5-pro',
    model2Id: 'openrouter/z-ai/glm-4.7',
    reason: 'GPT-5 vs GLM-4.7 comparison'
  },
  {
    model1Id: 'mistralai/devstral-2512',
    model2Id: 'minimax/minimax-m2.1',
    reason: 'Top agentic coding models'
  },
  {
    model1Id: 'openrouter/openai/gpt-4o',
    model2Id: 'openrouter/anthropic/claude-3-5-sonnet',
    reason: 'Most popular models comparison'
  }
];

/**
 * Get comparison slug for a pre-built comparison
 */
export function getPrebuiltComparisonSlug(
  model1Id: string,
  model2Id: string
): string | null {
  const comparison = PREBUILT_COMPARISONS.find(
    c =>
      (c.model1Id === model1Id && c.model2Id === model2Id) ||
      (c.model1Id === model2Id && c.model2Id === model1Id) // Order doesn't matter
  );

  if (!comparison) {
    return null;
  }

  return modelIdToSlug(comparison.model1Id) + '-vs-' + modelIdToSlug(comparison.model2Id);
}

/**
 * Get all pre-built comparison slugs for generateStaticParams
 */
export function getAllPrebuiltComparisonSlugs(): string[] {
  return PREBUILT_COMPARISONS.map(comp =>
    modelIdToSlug(comp.model1Id) + '-vs-' + modelIdToSlug(comp.model2Id)
  );
}
