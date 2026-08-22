"use client";

import { useCallback, useEffect, useState } from "react";

interface PersistedData<T> {
  _version: number;
  data: T;
}

const CURRENT_VERSION = 1;

export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;

    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;

      const parsed: PersistedData<T> = JSON.parse(raw);
      if (parsed._version !== CURRENT_VERSION) {
        return defaultValue;
      }
      return parsed.data ?? defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersistedState = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;

        if (typeof window !== "undefined") {
          try {
            const persisted: PersistedData<T> = {
              _version: CURRENT_VERSION,
              data: next,
            };
            localStorage.setItem(key, JSON.stringify(persisted));
          } catch {
            console.warn(`Failed to persist state for key: ${key}`);
          }
        }

        return next;
      });
    },
    [key]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const persisted: PersistedData<T> = {
        _version: CURRENT_VERSION,
        data: state,
      };
      localStorage.setItem(key, JSON.stringify(persisted));
    } catch {
      console.warn(`Failed to persist state for key: ${key}`);
    }
  }, [key, state]);

  return [state, setPersistedState];
}
