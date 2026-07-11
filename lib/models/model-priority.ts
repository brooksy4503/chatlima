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
  // Frontier vs frontier (Artificial Analysis top intelligence)
  {
    model1Id: 'anthropic/claude-fable-5',
    model2Id: 'openai/gpt-5.6-sol-pro',
    reason: 'Top intelligence models: Claude Fable 5 vs GPT-5.6 Sol Pro'
  },
  {
    model1Id: 'anthropic/claude-fable-5',
    model2Id: 'anthropic/claude-opus-4.8',
    reason: 'Anthropic flagship models compared'
  },
  {
    model1Id: 'openai/gpt-5.6-sol-pro',
    model2Id: 'anthropic/claude-opus-4.8',
    reason: 'Two top frontier models compared'
  },
  {
    model1Id: 'openai/gpt-5.6-sol-pro',
    model2Id: 'google/gemini-3.1-pro-preview',
    reason: 'Latest OpenAI vs Google flagship'
  },
  {
    model1Id: 'anthropic/claude-opus-4.8',
    model2Id: 'google/gemini-3.1-pro-preview',
    reason: 'Best reasoning models comparison'
  },
  {
    model1Id: 'openai/gpt-5.4-pro',
    model2Id: 'openai/gpt-5.5-pro',
    reason: 'OpenAI GPT-5.4 Pro vs GPT-5.5 Pro'
  },
  {
    model1Id: 'anthropic/claude-fable-5',
    model2Id: 'x-ai/grok-4.5',
    reason: 'Claude Fable 5 vs Grok 4.5 comparison'
  },
  {
    model1Id: 'google/gemini-3.1-pro-preview',
    model2Id: 'x-ai/grok-4.5',
    reason: 'Google vs xAI frontier comparison'
  },
  {
    model1Id: 'openai/gpt-5.6-sol',
    model2Id: 'openai/gpt-5.6-sol-pro',
    reason: 'GPT-5.6 Sol vs Sol Pro comparison'
  },
  {
    model1Id: 'anthropic/claude-opus-4.8',
    model2Id: 'anthropic/claude-sonnet-4.6',
    reason: 'Claude Opus 4.8 vs Sonnet 4.6'
  },
  // Frontier vs open-weight
  {
    model1Id: 'anthropic/claude-fable-5',
    model2Id: 'z-ai/glm-5.2',
    reason: 'Proprietary vs top open-weight intelligence'
  },
  {
    model1Id: 'openai/gpt-5.6-sol-pro',
    model2Id: 'minimax/minimax-m3',
    reason: 'Frontier vs top open-weight MiniMax-M3'
  },
  {
    model1Id: 'google/gemini-3.1-pro-preview',
    model2Id: 'z-ai/glm-5.2',
    reason: 'Google flagship vs GLM-5.2 open weights'
  },
  {
    model1Id: 'openai/gpt-5.6-sol',
    model2Id: 'deepseek/deepseek-v4-pro',
    reason: 'OpenAI Sol vs DeepSeek V4 Pro'
  },
  // Open-weight vs open-weight
  {
    model1Id: 'z-ai/glm-5.2',
    model2Id: 'minimax/minimax-m3',
    reason: 'Top open-weight models: GLM-5.2 vs MiniMax-M3'
  },
  {
    model1Id: 'z-ai/glm-5.2',
    model2Id: 'deepseek/deepseek-v4-pro',
    reason: 'GLM-5.2 vs DeepSeek V4 Pro comparison'
  },
  {
    model1Id: 'z-ai/glm-5.2',
    model2Id: 'moonshotai/kimi-k2.6',
    reason: 'GLM-5.2 vs Kimi K2.6 open models'
  },
  {
    model1Id: 'z-ai/glm-5.2',
    model2Id: 'qwen/qwen3.5-397b-a17b',
    reason: 'GLM-5.2 vs Qwen3.5 397B comparison'
  },
  {
    model1Id: 'minimax/minimax-m3',
    model2Id: 'deepseek/deepseek-v4-pro',
    reason: 'MiniMax-M3 vs DeepSeek V4 Pro'
  },
  {
    model1Id: 'moonshotai/kimi-k2.6',
    model2Id: 'xiaomi/mimo-v2.5-pro',
    reason: 'Kimi K2.6 vs MiMo-V2.5 Pro open models'
  },
  {
    model1Id: 'deepseek/deepseek-v4-pro',
    model2Id: 'deepseek/deepseek-v4-flash',
    reason: 'DeepSeek V4 Pro vs Flash variants'
  },
  // Fast / coding
  {
    model1Id: 'google/gemini-3.5-flash',
    model2Id: 'x-ai/grok-4.5',
    reason: 'Fast frontier models: Gemini 3.5 Flash vs Grok 4.5'
  },
  {
    model1Id: 'openai/gpt-5.3-codex',
    model2Id: 'anthropic/claude-sonnet-4.6',
    reason: 'Best coding models compared'
  },
  {
    model1Id: 'mistralai/devstral-2512',
    model2Id: 'openai/gpt-5.3-codex',
    reason: 'Agentic coding: Devstral vs GPT-5.3 Codex'
  },
  // Free open-weight SEO
  {
    model1Id: 'openai/gpt-oss-120b:free',
    model2Id: 'google/gemma-4-31b-it:free',
    reason: 'Best free open-weight models compared'
  },
  {
    model1Id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    model2Id: 'openai/gpt-oss-120b:free',
    reason: 'NVIDIA Nemotron Ultra vs GPT-OSS free tier'
  },
  {
    model1Id: 'qwen/qwen3.5-397b-a17b',
    model2Id: 'openai/gpt-oss-120b',
    reason: 'Qwen3.5 397B vs GPT-OSS 120B open models'
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
