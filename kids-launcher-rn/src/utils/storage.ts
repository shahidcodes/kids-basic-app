import AsyncStorage from '@react-native-async-storage/async-storage';

interface PersistedData<T> {
  _version: number;
  data: T;
}

const CURRENT_VERSION = 1;

export async function getPersistedState<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return defaultValue;

    const parsed: PersistedData<T> = JSON.parse(raw);
    if (parsed._version !== CURRENT_VERSION) {
      return defaultValue;
    }
    return parsed.data ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function setPersistedState<T>(key: string, value: T): Promise<void> {
  try {
    const persisted: PersistedData<T> = {
      _version: CURRENT_VERSION,
      data: value,
    };
    await AsyncStorage.setItem(key, JSON.stringify(persisted));
  } catch (err) {
    console.warn(`Failed to persist state for key: ${key}`, err);
  }
}

export interface GameSettings {
  language: 'en' | 'ar' | 'dv';
  scores: {
    say: number;
    correct: number;
    write: number;
    melody: number;
  };
  streaks: {
    correct: number;
  };
  completedCount: {
    write: number;
  };
}

export const DEFAULT_SETTINGS: GameSettings = {
  language: 'en',
  scores: { say: 0, correct: 0, write: 0, melody: 0 },
  streaks: { correct: 0 },
  completedCount: { write: 0 },
};

export async function loadSettings(): Promise<GameSettings> {
  return getPersistedState<GameSettings>('kidslearn_settings', DEFAULT_SETTINGS);
}

export async function saveSettings(settings: GameSettings): Promise<void> {
  return setPersistedState('kidslearn_settings', settings);
}

// =====================
// PIN Storage Helpers
// =====================

export async function loadPin(): Promise<string | null> {
  return getPersistedState<string | null>('kidslearn_pin', null);
}

export async function savePin(pin: string): Promise<void> {
  return setPersistedState('kidslearn_pin', pin);
}

export async function hasPin(): Promise<boolean> {
  const pin = await loadPin();
  return pin !== null && pin.length > 0;
}

export async function clearPin(): Promise<void> {
  return setPersistedState('kidslearn_pin', null);
}
