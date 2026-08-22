export interface MathProblem {
  num1: number;
  num2: number;
  operation: "+" | "-" | "×";
  answer: number;
}

export type GameMode = "say" | "write" | "correct" | "melody";

export type Difficulty = "easy" | "medium" | "hard";

export interface GameSettings {
  difficulty: Difficulty;
  timerDuration: number;
  numberRange: [number, number];
  operations: ("+" | "-" | "×")[];
}

export interface ScoreEntry {
  mode: GameMode;
  score: number;
  streak: number;
  date: string;
}

export type Language = "en" | "ar" | "dv";
