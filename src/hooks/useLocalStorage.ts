import { useCallback, useEffect, useState } from 'react';

/**
 * Tiny JSON-backed localStorage state.
 *
 * Storage is a nicety, never a requirement: private-mode Safari and blocked
 * third-party storage both throw, so every access is guarded and the hook
 * simply keeps working in memory.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable — in-memory only */
    }
  }, [key, value]);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* noop */
    }
    setValue(initialValue);
  }, [initialValue, key]);

  return [value, setValue, reset] as const;
}
