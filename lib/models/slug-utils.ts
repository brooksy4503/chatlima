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
  // If slug already contains provider prefix, convert slashes back
  if (slug.startsWith('openrouter-') || slug.startsWith('requesty-')) {
    return slug.replace(/-/g, '/');
  }

  // For slugs without provider prefix, try to reconstruct
  // This is a best-effort conversion; prefer storing original model IDs
  const parts = slug.split('-');

  // Try to identify provider from first part
  const provider = parts[0];
  const modelName = parts.slice(1).join('-');

  if (provider === 'openrouter') {
    return `openrouter/${modelName}`;
  }
  if (provider === 'requesty') {
    return `requesty/${modelName}`;
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
