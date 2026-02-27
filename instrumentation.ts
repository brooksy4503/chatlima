/**
 * Node can expose a broken global localStorage when --localstorage-file is invalid.
 * Next.js dev internals may call localStorage.getItem() during SSR, which crashes.
 * This patches only broken storage objects with a minimal in-memory implementation.
 */
function patchBrokenLocalStorage() {
  const globalWithStorage = globalThis as typeof globalThis & {
    localStorage?: Storage | unknown;
  };

  const storage = globalWithStorage.localStorage;
  if (storage == null) return;

  const hasValidApi =
    typeof (storage as Storage).getItem === "function" &&
    typeof (storage as Storage).setItem === "function" &&
    typeof (storage as Storage).removeItem === "function" &&
    typeof (storage as Storage).clear === "function" &&
    typeof (storage as Storage).key === "function";

  if (hasValidApi) return;

  const store = new Map<string, string>();
  const memoryStorage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
  };

  globalWithStorage.localStorage = memoryStorage;
}

patchBrokenLocalStorage();

export async function register() {
  patchBrokenLocalStorage();
}

