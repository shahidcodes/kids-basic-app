import { Difficulty, GameSettings } from "@/types";

export const DIFFICULTY_SETTINGS: Record<
  Difficulty,
  { numberRange: [number, number]; timerDuration: number; operations: ("+" | "-" | "×")[] }
> = {
  easy: { numberRange: [0, 5], timerDuration: 15, operations: ["+"] },
  medium: { numberRange: [0, 10], timerDuration: 10, operations: ["+", "-"] },
  hard: { numberRange: [0, 20], timerDuration: 8, operations: ["+", "-", "×"] },
};

export const DEFAULT_SETTINGS: GameSettings = {
  difficulty: "easy",
  timerDuration: DIFFICULTY_SETTINGS.easy.timerDuration,
  numberRange: DIFFICULTY_SETTINGS.easy.numberRange,
  operations: DIFFICULTY_SETTINGS.easy.operations,
};

export const CELEBRATION_PHRASES = [
  "Awesome!",
  "Amazing!",
  "Fantastic!",
  "Super!",
  "Wonderful!",
  "Great job!",
  "Excellent!",
  "Brilliant!",
  "Well done!",
  "You got it!",
];

export const STREAK_THRESHOLDS = {
  bronze: 3,
  silver: 5,
  gold: 10,
};

export const INACTIVITY_TIMEOUT = 5000;

export const SIZE_INCREASE_INTERVAL = 3000;

export const MAX_SIZE_MULTIPLIER = 1.5;
