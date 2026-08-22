import type { GameMode, GameSettings, ScoreEntry } from "@/types";
import { DEFAULT_SETTINGS } from "@/constants";

export const STORAGE_KEYS = {
  scores: "kidslearn_scores",
  settings: "kidslearn_settings",
  sessionHistory: "kidslearn_history",
} as const;

export function saveScore(mode: GameMode, score: number, streak: number): void {
  if (typeof window === "undefined") return;
  try {
    const scores = loadScores();
    const entry: ScoreEntry = {
      mode,
      score,
      streak,
      date: new Date().toISOString(),
    };
    scores.push(entry);
    const limited = scores.slice(-100);
    localStorage.setItem(STORAGE_KEYS.scores, JSON.stringify(limited));
  } catch {
    console.warn("Failed to save score");
  }
}

export function loadScores(): ScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.scores);
    if (!raw) return [];
    return JSON.parse(raw) as ScoreEntry[];
  } catch {
    return [];
  }
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch {
    console.warn("Failed to save settings");
  }
}

export function loadSettings(): GameSettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return null;
    return JSON.parse(raw) as GameSettings;
  } catch {
    return null;
  }
}

export function getSettingsWithDefaults(): GameSettings {
  return loadSettings() ?? DEFAULT_SETTINGS;
}

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
