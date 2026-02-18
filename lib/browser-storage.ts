/**
 * Safe localStorage helpers for SSR and environments where localStorage
 * may be missing or broken (e.g. Node with --localstorage-file and invalid path).
 */

export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const storage = window.localStorage;
    return !!storage && typeof storage.getItem === 'function';
  } catch {
    return false;
  }
}

export function getLocalStorageItem(key: string): string | null {
  if (!isLocalStorageAvailable()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setLocalStorageItem(key: string, value: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function removeLocalStorageItem(key: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
