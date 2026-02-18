import { useState, useEffect, useCallback } from 'react';
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem, isLocalStorageAvailable } from '@/lib/browser-storage';

type SetValue<T> = T | ((val: T) => T);

/**
 * Custom hook for persistent localStorage state with SSR support
 * @param key The localStorage key
 * @param initialValue The initial value if no value exists in localStorage
 * @returns A stateful value and a function to update it
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize state from localStorage or use initialValue (only when storage is actually available)
  useEffect(() => {
    setIsMounted(true);

    if (!isLocalStorageAvailable()) return;

    try {
      const item = getLocalStorageItem(key);
      if (item) {
        setStoredValue(parseJSON(item));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Prevent hydration mismatch by ensuring we only use localStorage values after mounting
  const effectiveValue = isMounted ? storedValue : initialValue;

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback((value: SetValue<T>) => {
    if (!isLocalStorageAvailable()) return;

    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to localStorage
      if (valueToStore === undefined) {
        removeLocalStorageItem(key);
      } else {
        setLocalStorageItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [effectiveValue, setValue] as const;
}

// Helper function to parse JSON with error handling
function parseJSON<T>(value: string): T {
  try {
    return JSON.parse(value);
  } catch {
    console.error('Error parsing JSON from localStorage');
    return {} as T;
  }
}

/**
 * A hook to get a value from localStorage (read-only) with SSR support
 * @param key The localStorage key
 * @param defaultValue The default value if the key doesn't exist
 * @returns The value from localStorage or the default value
 */
export function useLocalStorageValue<T>(key: string, defaultValue: T): T {
  const [value] = useLocalStorage<T>(key, defaultValue);
  return value;
} 