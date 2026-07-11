import { modelIdToSlug } from '@/lib/models/slug-utils';

type ModelLike = {
  id: string;
  name: string;
};

/**
 * Resolve a model from a slug/id against a fetched catalog.
 * Prefer exact id, then slug match, then name-part heuristics (OpenRouter nesting).
 */
export function resolveModelFromSlug<T extends ModelLike>(
  models: T[],
  targetId: string,
  targetSlug: string
): T | undefined {
  let model = models.find((m) => m.id === targetId);
  if (model) return model;

  const targetSlugLower = targetSlug.toLowerCase();
  model = models.find((m) => modelIdToSlug(m.id) === targetSlugLower);
  if (model) return model;

  const modelNamePart = targetId.split('/').pop()?.replace(/:free$/, '') || '';
  if (!modelNamePart) return undefined;

  const candidates = models.filter((m) => {
    const normalizedId = m.id.toLowerCase().replace(/:free$/, '');
    const parts = normalizedId.split('/');
    const lastPart = parts[parts.length - 1];
    return (
      lastPart === modelNamePart.toLowerCase() ||
      normalizedId.endsWith(`/${modelNamePart.toLowerCase()}`)
    );
  });

  if (candidates.length > 0) {
    const openrouterModel = candidates.find((m) => m.id.startsWith('openrouter/'));
    if (openrouterModel) return openrouterModel;

    const requestyModel = candidates.find((m) => m.id.startsWith('requesty/'));
    if (requestyModel) return requestyModel;

    return candidates[0];
  }

  return models.find((m) => {
    const normalizedId = m.id.toLowerCase().replace(/:free$/, '');
    return normalizedId.includes(modelNamePart.toLowerCase());
  });
}

/** Prefer a short human label for SERP titles when the catalog name is noisy. */
export function seoModelLabel(model: ModelLike): string {
  const name = model.name?.trim();
  if (name && name.length <= 48 && !name.includes('/')) {
    return name;
  }

  const fromId = model.id.split('/').pop() ?? model.id;
  return fromId.replace(/:free$/i, ' (Free)');
}
