/**
 * Slug utilities for model ID to URL slug conversion
 * Provides bi-directional conversion between model IDs and SEO-friendly slugs
 */

export function modelIdToSlug(modelId: string): string {
  return modelId
    .replace(/\//g, '-')           // Replace all slashes with dashes
    .replace(/--+/g, '-')          // Collapse multiple dashes
    .replace(/^-+|-+$/g, '')      // Remove leading/trailing dashes
    .toLowerCase();
}

export function slugToModelId(slug: string): string {
  // Handle openrouter with nested providers (e.g., "openrouter-google-gemini-2-5-flash")
  if (slug.startsWith('openrouter-')) {
    const rest = slug.replace(/^openrouter-/, '');
    const restParts = rest.split('-');
    
    // Common nested providers in openrouter
    const nestedProviders = ['google', 'anthropic', 'openai', 'z-ai', 'bytedance-seed'];
    
    // Check if the first part after "openrouter-" is a nested provider
    if (restParts.length > 1 && nestedProviders.includes(restParts[0])) {
      // Reconstruct: openrouter/google/gemini-2-5-flash
      const modelNameParts = restParts.slice(1);
      // Check for :free suffix
      if (modelNameParts.length > 0 && modelNameParts[modelNameParts.length - 1] === 'free') {
        const baseModelName = modelNameParts.slice(0, -1).join('-');
        return `openrouter/${restParts[0]}/${baseModelName}:free`;
      }
      return `openrouter/${restParts[0]}/${modelNameParts.join('-')}`;
    }
    // Simple openrouter model: openrouter/model-name
    // Check for :free suffix
    if (restParts.length > 0 && restParts[restParts.length - 1] === 'free') {
      const baseModelName = restParts.slice(0, -1).join('-');
      return `openrouter/${baseModelName}:free`;
    }
    return `openrouter/${rest}`;
  }
  
  if (slug.startsWith('requesty-')) {
    return slug.replace(/^requesty-/, 'requesty/');
  }

  // For slugs without provider prefix, try to reconstruct
  // This is a best-effort conversion; prefer storing original model IDs
  const parts = slug.split('-');

  // Try to identify provider from first part
  const provider = parts[0];
  const modelName = parts.slice(1).join('-');

  // Handle common providers
  const providerMap: Record<string, string> = {
    'openrouter': 'openrouter',
    'requesty': 'requesty',
    'openai': 'openai',
    'anthropic': 'anthropic',
    'google': 'google',
    'mistralai': 'mistralai',
    'allenai': 'allenai',
    'xiaomi': 'xiaomi',
    'minimax': 'minimax',
    'nvidia': 'nvidia',
    'z-ai': 'z-ai',
    'bytedance-seed': 'bytedance-seed',
  };

  if (provider in providerMap) {
    // Check if model name ends with "-free" (converted from ":free" suffix)
    // This is a heuristic - if the last part is "free", it's likely a :free model
    const modelParts = modelName.split('-');
    if (modelParts.length > 1 && modelParts[modelParts.length - 1] === 'free') {
      // Remove "free" from the end and add ":free" suffix
      const baseModelName = modelParts.slice(0, -1).join('-');
      return `${providerMap[provider]}/${baseModelName}:free`;
    }
    return `${providerMap[provider]}/${modelName}`;
  }

  // Fallback: return as-is
  return slug;
}

export function getModelSlugPair(modelId: string): { slug: string; originalId: string } {
  return {
    slug: modelIdToSlug(modelId),
    originalId: modelId
  };
}

export function isValidSlug(slug: string): boolean {
  // Basic validation: only allow lowercase letters, numbers, and hyphens
  return /^[a-z0-9-]+$/.test(slug);
}

export function generateComparisonSlug(model1Id: string, model2Id: string): string {
  const slug1 = modelIdToSlug(model1Id);
  const slug2 = modelIdToSlug(model2Id);
  return `${slug1}-vs-${slug2}`;
}

export function parseComparisonSlug(slug: string): { model1Slug: string; model2Slug: string } | null {
  const parts = slug.split('-vs-');
  if (parts.length !== 2) {
    return null;
  }
  return {
    model1Slug: parts[0],
    model2Slug: parts[1]
  };
}
