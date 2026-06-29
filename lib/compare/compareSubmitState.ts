import { getLocalStorageItem, isLocalStorageAvailable } from '@/lib/browser-storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { MIN_COMPARE_MODELS } from '@/lib/compare/comparePolicy';

export function getCompareSubmitState(): { enabled: boolean; models: string[] } {
  if (!isLocalStorageAvailable()) {
    return { enabled: false, models: [] };
  }

  try {
    const enabledItem = getLocalStorageItem(STORAGE_KEYS.COMPARE_MODE);
    const enabled = enabledItem ? JSON.parse(enabledItem) === true : false;

    const modelsItem = getLocalStorageItem(STORAGE_KEYS.COMPARE_MODELS);
    const parsed = modelsItem ? JSON.parse(modelsItem) : [];
    const models = Array.isArray(parsed)
      ? parsed.filter((m): m is string => typeof m === 'string')
      : [];

    return { enabled, models };
  } catch {
    return { enabled: false, models: [] };
  }
}

/** Sync read of compare mode — use at submit time to avoid stale React closures. */
export function shouldSubmitCompare(): boolean {
  const { enabled, models } = getCompareSubmitState();
  return enabled && models.length >= MIN_COMPARE_MODELS;
}
