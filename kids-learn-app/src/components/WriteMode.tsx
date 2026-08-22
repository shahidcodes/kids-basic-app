"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVoice } from "@/hooks/useVoice";
import { Eraser, CheckCircle, ArrowRight, Star, Trophy, Play, Eye, Hand } from "lucide-react";

interface WriteModeProps {
  isActive: boolean;
  language?: "en" | "ar" | "dv";
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
}

// Character sets for each language
const CHAR_SETS = {
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(""),
  ar: "ابتثجحخدذرزسشصضطظعغفقكلمنهوي٠١٢٣٤٥٦٧٨٩".split(""),
  dv: "ހށނރބޅކއވމފދތލގޏސޑޒޓޔޕޖޗޘޙޚޛޜޝޞޟޠޡޢޣޤޥ٠١٢٣٤٥٦٧٨٩".split(""),
};

// Stroke paths for English letters (SVG path data)
const ENGLISH_STROKES: Record<string, string[]> = {
  A: ["M 30 60 L 50 15 L 70 60", "M 35 42 L 65 42"],
  B: ["M 30 15 L 30 60", "M 30 15 L 55 15 Q 65 15 65 27 Q 65 37 55 37 L 30 37", "M 30 37 L 55 37 Q 68 37 68 48 Q 68 60 55 60 L 30 60"],
  C: ["M 65 20 Q 30 15 30 37 Q 30 60 65 55"],
  D: ["M 30 15 L 30 60", "M 30 15 L 55 15 Q 70 20 70 37 Q 70 55 55 60 L 30 60"],
  E: ["M 65 15 L 30 15 L 30 60 L 65 60", "M 30 37 L 60 37"],
  F: ["M 65 15 L 30 15 L 30 60", "M 30 37 L 60 37"],
  G: ["M 65 20 Q 30 15 30 37 Q 30 60 65 55 L 65 42 L 50 42"],
  H: ["M 30 15 L 30 60", "M 70 15 L 70 60", "M 30 37 L 70 37"],
  I: ["M 50 15 L 50 60", "M 35 15 L 65 15", "M 35 60 L 65 60"],
  J: ["M 65 15 L 65 50 Q 65 65 50 65 Q 35 65 35 50"],
  K: ["M 30 15 L 30 60", "M 70 15 L 30 40 L 70 60"],
  L: ["M 30 15 L 30 60 L 65 60"],
  M: ["M 30 60 L 30 20 L 50 35 L 70 20 L 70 60"],
  N: ["M 30 60 L 30 15 L 70 60 L 70 15"],
  O: ["M 50 15 Q 30 15 30 37 Q 30 60 50 60 Q 70 60 70 37 Q 70 15 50 15"],
  P: ["M 30 15 L 30 60", "M 30 15 L 55 15 Q 68 15 68 28 Q 68 40 55 40 L 30 40"],
  Q: ["M 50 15 Q 30 15 30 37 Q 30 60 50 60 Q 70 60 70 37 Q 70 15 50 15", "M 55 50 L 70 70"],
  R: ["M 30 15 L 30 60", "M 30 15 L 55 15 Q 68 15 68 28 Q 68 40 55 40 L 30 40", "M 40 40 L 70 60"],
  S: ["M 60 20 Q 35 15 35 30 Q 35 37 50 37 Q 65 37 65 45 Q 65 60 40 55"],
  T: ["M 50 15 L 50 60", "M 30 15 L 70 15"],
  U: ["M 30 15 L 30 50 Q 30 65 50 65 Q 70 65 70 50 L 70 15"],
  V: ["M 30 15 L 50 60 L 70 15"],
  W: ["M 25 15 L 35 60 L 50 40 L 65 60 L 75 15"],
  X: ["M 30 15 L 70 60", "M 70 15 L 30 60"],
  Y: ["M 30 15 L 50 40 L 70 15", "M 50 40 L 50 60"],
  Z: ["M 30 15 L 70 15 L 30 60 L 70 60"],
  "0": ["M 50 15 Q 30 15 30 37 Q 30 60 50 60 Q 70 60 70 37 Q 70 15 50 15"],
  "1": ["M 45 25 L 50 15 L 50 60", "M 35 60 L 65 60"],
  "2": ["M 30 25 Q 30 15 50 15 Q 70 15 70 30 Q 70 40 30 60 L 70 60"],
  "3": ["M 30 20 Q 50 15 65 25 Q 70 30 50 37", "M 50 37 Q 70 45 65 55 Q 50 65 30 55"],
  "4": ["M 65 15 L 65 60", "M 65 15 L 30 50 L 70 50"],
  "5": ["M 65 15 L 30 15 L 30 37", "M 30 37 Q 70 35 70 48 Q 70 60 50 60 Q 30 60 30 50"],
  "6": ["M 65 20 Q 50 15 35 25 Q 25 37 25 48 Q 25 60 50 60 Q 75 60 75 48 Q 75 40 50 40"],
  "7": ["M 30 15 L 70 15 L 50 60"],
  "8": ["M 50 37 Q 70 30 70 25 Q 70 15 50 15 Q 30 15 30 25 Q 30 30 50 37", "M 50 37 Q 30 45 30 50 Q 30 60 50 60 Q 70 60 70 50 Q 70 45 50 37"],
  "9": ["M 50 15 Q 75 15 75 27 Q 75 40 50 40 Q 25 40 25 27 Q 25 15 50 15", "M 65 40 L 65 60"],
};

// Arabic letter stroke paths (simplified for demonstration)
const ARABIC_STROKES: Record<string, string[]> = {
  "ا": ["M 35 30 Q 35 20 50 20 Q 65 20 65 30 L 65 55 Q 65 60 50 60 Q 35 60 35 55 Z", "M 50 35 L 50 55"],
  "ب": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 25 Q 45 20 50 25", "M 55 25 Q 60 20 65 25"],
  "ت": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 35 25 L 40 20", "M 45 25 L 50 20", "M 55 25 L 60 20"],
  "ث": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 35 25 L 40 18", "M 45 25 L 50 18", "M 55 25 L 60 18", "M 50 15 L 50 10"],
  "ج": ["M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 55 L 40 60", "M 55 25 Q 60 20 65 25"],
  "ح": ["M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 55 L 40 60"],
  "خ": ["M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 55 L 40 60", "M 50 10 L 50 5"],
  "د": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 20 L 60 20"],
  "ذ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 20 L 60 20", "M 50 15 L 50 10"],
  "ر": ["M 35 20 Q 35 10 50 10 Q 65 10 65 20 L 65 40 Q 65 50 50 55", "M 40 20 L 60 20"],
  "ز": ["M 35 20 Q 35 10 50 10 Q 65 10 65 20 L 65 40 Q 65 50 50 55", "M 40 20 L 60 20", "M 50 10 L 50 5"],
  "س": ["M 25 40 Q 25 25 40 25 Q 55 25 55 40 Q 55 55 70 55"],
  "ش": ["M 25 40 Q 25 25 40 25 Q 55 25 55 40 Q 55 55 70 55", "M 40 20 L 40 15", "M 50 20 L 50 15", "M 60 20 L 60 15"],
  "ص": ["M 25 35 Q 25 20 40 20 Q 55 20 55 35 Q 55 50 70 50", "M 30 35 Q 35 30 40 35"],
  "ض": ["M 25 35 Q 25 20 40 20 Q 55 20 55 35 Q 55 50 70 50", "M 30 35 Q 35 30 40 35", "M 40 20 L 40 15"],
  "ط": ["M 20 30 L 80 30", "M 30 30 L 30 50 Q 30 60 50 60 Q 70 60 70 50 L 70 30", "M 40 25 Q 45 20 50 25"],
  "ظ": ["M 20 30 L 80 30", "M 30 30 L 30 50 Q 30 60 50 60 Q 70 60 70 50 L 70 30", "M 40 25 Q 45 20 50 25", "M 50 30 L 50 25"],
  "ع": ["M 30 20 Q 50 20 70 30 L 70 40 Q 70 50 50 50 Q 30 50 30 40 L 30 35", "M 50 20 L 50 10"],
  "غ": ["M 30 20 Q 50 20 70 30 L 70 40 Q 70 50 50 50 Q 30 50 30 40 L 30 35", "M 50 20 L 50 10", "M 50 10 L 50 5"],
  "ف": ["M 30 20 L 70 20 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 35 25 Q 40 20 45 25"],
  "ق": ["M 30 20 L 70 20 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 50 60 L 50 70"],
  "ك": ["M 30 15 L 30 60", "M 30 30 Q 50 25 70 30 L 70 50 Q 70 60 50 60 Q 35 60 35 50"],
  "ل": ["M 30 15 L 30 50 Q 30 60 50 60 Q 70 60 70 50 L 70 30 Q 70 15 50 15", "M 40 25 Q 45 20 50 25"],
  "م": ["M 25 20 L 25 50", "M 25 35 Q 50 25 75 35 L 75 50", "M 50 35 L 50 60"],
  "ن": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 50 60 L 50 65"],
  "ه": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 35 L 60 35"],
  "و": ["M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z"],
  "ي": ["M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 25 L 45 20", "M 50 25 L 55 20", "M 60 25 L 65 20"],
  "٠": ["M 50 35 Q 35 35 35 50 Q 35 65 50 65 Q 65 65 65 50 Q 65 35 50 35 Z"],
  "١": ["M 45 25 L 50 35 L 50 65"],
  "٢": ["M 30 40 Q 30 30 50 30 Q 70 30 70 40 Q 70 50 50 55 Q 30 60 30 65 L 70 65"],
  "٣": ["M 30 35 Q 50 25 70 35", "M 30 50 Q 50 40 70 50", "M 30 65 Q 50 55 70 65"],
  "٤": ["M 65 25 L 35 50 L 65 50", "M 65 25 L 65 65"],
  "٥": ["M 70 25 L 30 25 L 30 45", "M 30 45 Q 70 40 70 55 Q 70 65 50 65 Q 30 65 30 55"],
  "٦": ["M 70 30 Q 50 25 30 35 Q 25 45 25 55 Q 25 65 50 65 Q 75 65 75 55"],
  "٧": ["M 30 25 L 70 25 L 50 65"],
  "٨": ["M 50 45 Q 70 35 70 45 Q 70 55 50 55 Q 30 55 30 45 Q 30 35 50 35 Q 70 35 70 45"],
  "٩": ["M 50 25 Q 75 25 75 40 Q 75 55 50 55 Q 25 55 25 40 Q 25 25 50 25"],
};

// Dhivehi letter stroke paths (simplified for demonstration)
const DHIVEHI_STROKES: Record<string, string[]> = {
  "ހ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 35 35 L 65 35"],
  "ށ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 35 L 60 35", "M 50 20 L 50 25"],
  "ނ": ["M 35 20 Q 35 10 50 10 Q 65 10 65 20 L 65 40 Q 65 50 50 55", "M 40 35 Q 50 40 60 35"],
  "ރ": ["M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 45 Q 70 55 50 55 Q 30 55 30 45", "M 50 55 L 50 65"],
  "ބ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 25 L 45 20", "M 55 25 L 60 20"],
  "ޅ": ["M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 55", "M 40 35 Q 50 40 60 35", "M 50 20 L 50 25"],
  "ކ": ["M 30 15 L 30 60", "M 30 30 Q 50 25 70 30", "M 50 30 L 50 60"],
  "އ": ["M 40 20 Q 30 20 30 35 Q 30 50 50 50 Q 70 50 70 35 Q 70 20 60 20", "M 50 50 L 50 60"],
  "ވ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 45 Q 70 55 50 55 Q 30 55 30 45 Z", "M 40 35 Q 50 40 60 35"],
  "މ": ["M 25 20 L 25 50", "M 25 35 Q 50 25 75 35 L 75 50", "M 50 35 L 50 60", "M 40 30 L 45 25"],
  "ފ": ["M 30 20 L 70 20 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 25 L 45 20"],
  "ދ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 50 60 L 50 65"],
  "ތ": ["M 20 30 L 80 30", "M 30 30 L 30 50 Q 30 60 50 60 Q 70 60 70 50 L 70 30", "M 50 30 L 50 20"],
  "ލ": ["M 30 15 L 30 50 Q 30 60 50 60 Q 70 60 70 50 L 70 30", "M 40 25 L 45 20"],
  "ގ": ["M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 55", "M 50 35 L 50 65"],
  "ޏ": ["M 25 35 Q 25 20 40 20 Q 55 20 55 35 Q 55 50 70 50", "M 50 50 L 50 60"],
  "ސ": ["M 25 40 Q 25 25 40 25 Q 55 25 55 40 Q 55 55 70 55", "M 40 25 L 45 20"],
  "ޑ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 50 60 L 50 70", "M 40 20 L 45 15"],
  "ޒ": ["M 35 20 Q 35 10 50 10 Q 65 10 65 20 L 65 40 Q 65 50 50 55", "M 40 20 L 60 20", "M 50 20 L 50 15"],
  "ޓ": ["M 20 30 L 80 30", "M 30 30 L 30 60", "M 40 25 L 45 20"],
  "ޔ": ["M 30 20 L 70 20 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 25 L 45 20", "M 55 25 L 60 20"],
  "ޕ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 35 25 L 40 20", "M 45 25 L 50 20"],
  "ޖ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 45 Q 70 55 50 55", "M 50 55 L 50 65", "M 40 20 L 45 15"],
  "ޗ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 45 Q 70 55 50 55", "M 40 20 L 45 15", "M 50 20 L 50 15", "M 60 20 L 65 15"],
  "ޘ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z"],
  "ޙ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 20 L 60 20"],
  "ޚ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 20 L 60 20", "M 50 15 L 50 20"],
  "ޛ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 20 L 50 15 L 60 20"],
  "ޜ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 20 L 50 15 L 60 20", "M 50 20 L 50 25"],
  "ޝ": ["M 25 40 Q 25 25 40 25 Q 55 25 55 40 Q 55 55 70 55", "M 40 20 L 45 15", "M 50 20 L 50 15", "M 60 20 L 65 15"],
  "ޞ": ["M 25 35 Q 25 20 40 20 Q 55 20 55 35 Q 55 50 70 50", "M 30 35 L 35 30", "M 40 35 L 45 30"],
  "ޟ": ["M 25 35 Q 25 20 40 20 Q 55 20 55 35 Q 55 50 70 50", "M 30 35 L 35 30", "M 40 35 L 45 30", "M 40 20 L 40 15"],
  "ޠ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z"],
  "ޡ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 40 20 L 60 20"],
  "ޢ": ["M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 50", "M 50 20 L 50 15"],
  "ޣ": ["M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 50", "M 50 20 L 50 15", "M 50 15 L 50 10"],
  "ޤ": ["M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 50", "M 50 20 L 50 10"],
  "ޥ": ["M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z", "M 50 60 L 50 65"],
  "٠": ["M 50 35 Q 35 35 35 50 Q 35 65 50 65 Q 65 65 65 50 Q 65 35 50 35 Z"],
  "١": ["M 45 25 L 50 35 L 50 65"],
  "٢": ["M 30 40 Q 30 30 50 30 Q 70 30 70 40 Q 70 50 50 55 Q 30 60 30 65 L 70 65"],
  "٣": ["M 30 35 Q 50 25 70 35", "M 30 50 Q 50 40 70 50", "M 30 65 Q 50 55 70 65"],
  "٤": ["M 65 25 L 35 50 L 65 50", "M 65 25 L 65 65"],
  "٥": ["M 70 25 L 30 25 L 30 45", "M 30 45 Q 70 40 70 55 Q 70 65 50 65 Q 30 65 30 55"],
  "٦": ["M 70 30 Q 50 25 30 35 Q 25 45 25 55 Q 25 65 50 65 Q 75 65 75 55"],
  "٧": ["M 30 25 L 70 25 L 50 65"],
  "٨": ["M 50 45 Q 70 35 70 45 Q 70 55 50 55 Q 30 55 30 45 Q 30 35 50 35 Q 70 35 70 45"],
  "٩": ["M 50 25 Q 75 25 75 40 Q 75 55 50 55 Q 25 55 25 40 Q 25 25 50 25"],
};

// Get strokes based on language
const getStrokes = (char: string, language: "en" | "ar" | "dv"): string[] => {
  if (language === "ar") return ARABIC_STROKES[char] || [];
  if (language === "dv") return DHIVEHI_STROKES[char] || [];
  return ENGLISH_STROKES[char] || [];
};

export function WriteMode({ isActive, language = "en" }: WriteModeProps) {
  const [targetKey, setTargetKey] = useState<string>("");
  const [drawnPaths, setDrawnPaths] = useState<string[][]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [guideProgress, setGuideProgress] = useState(0);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [handPosition, setHandPosition] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const animationRef = useRef<number | null>(null);

  const { speakLetter, celebrate, speakHint } = useVoice();

  const charSet = CHAR_SETS[language];
  const isRTL = language === "ar" || language === "dv";
  const strokes = getStrokes(targetKey, language);

  // Generate celebration particles
  const createParticles = useCallback(() => {
    const colors = ["#ef4444", "#f97316", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2500);
  }, []);

  // Get random letter
  const getRandomLetter = useCallback(() => {
    return charSet[Math.floor(Math.random() * charSet.length)];
  }, [charSet]);

  // Cancel any running animation
  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Play the drawing guide animation - stroke by stroke with hand cursor
  const playGuideAnimation = useCallback(() => {
    cancelAnimation();
    setShowGuide(true);
    setGuideProgress(0);
    setCurrentStrokeIndex(0);
    setHandPosition(null);

    const letterStrokes = getStrokes(targetKey, language);
    if (letterStrokes.length === 0) {
      setTimeout(() => setShowGuide(false), 500);
      return;
    }

    const strokeDuration = 1200; // ms per stroke
    const pauseBetweenStrokes = 300; // ms pause between strokes
    let startTime: number | null = null;
    let currentStroke = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const totalCycleTime = strokeDuration + pauseBetweenStrokes;
      const elapsed = timestamp - startTime;
      const cycleProgress = elapsed % totalCycleTime;
      const completedCycles = Math.floor(elapsed / totalCycleTime);

      // Check if all strokes are done
      if (completedCycles >= letterStrokes.length) {
        setGuideProgress(1);
        setCurrentStrokeIndex(letterStrokes.length);
        setHandPosition(null);
        setTimeout(() => {
          setShowGuide(false);
        }, 500);
        return;
      }

      // Current stroke
      currentStroke = completedCycles;
      setCurrentStrokeIndex(currentStroke);

      // Progress within current stroke (0 to 1)
      let strokeProgress = 0;
      if (cycleProgress < strokeDuration) {
        strokeProgress = cycleProgress / strokeDuration;
      } else {
        strokeProgress = 1; // In the pause period
      }

      setGuideProgress((completedCycles + strokeProgress) / letterStrokes.length);

      // Calculate hand position along the current stroke path
      const pathEl = pathRefs.current[currentStroke];
      if (pathEl && strokeProgress < 1) {
        const pathLength = pathEl.getTotalLength();
        const currentLength = strokeProgress * pathLength;
        const point = pathEl.getPointAtLength(currentLength);
        setHandPosition({ x: point.x, y: point.y });
      } else if (strokeProgress >= 1) {
        setHandPosition(null); // Hide hand during pause
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [targetKey, language, cancelAnimation]);

  // Get next letter
  const nextLetter = useCallback(() => {
    cancelAnimation();
    const random = getRandomLetter();
    setTargetKey(random);
    setDrawnPaths([]);
    setCurrentPath([]);
    setShowSuccess(false);
    setParticles([]);
    setShowGuide(true);
    setGuideProgress(0);
    setCurrentStrokeIndex(0);
    setHandPosition(null);

    setTimeout(() => {
      const langHint = language === "ar" ? "ارسم حرف" : language === "dv" ? "ލިޔާ" : "Draw the letter";
      speakHint(`${langHint} ${random}`);
      setTimeout(() => playGuideAnimation(), 1500);
    }, 300);
  }, [getRandomLetter, speakHint, playGuideAnimation, language, cancelAnimation]);

  // Initialize
  useEffect(() => {
    if (isActive && !targetKey) {
      const first = getRandomLetter();
      setTargetKey(first);
      const langHint = language === "ar" ? "ارسم حرف" : language === "dv" ? "ލިޔާ" : "Draw the letter";
      speakHint(`${langHint} ${first}`);
      setTimeout(() => playGuideAnimation(), 1500);
    }
  }, [isActive, targetKey, getRandomLetter, speakHint, playGuideAnimation, language]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => cancelAnimation();
  }, [cancelAnimation]);

  // Drawing handlers
  const getPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!canvasRef.current) return { x: 0, y: 0 };

      const svg = canvasRef.current;
      const rect = svg.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0]?.clientX : (e as React.MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY : (e as React.MouseEvent).clientY;

      const viewBox = svg.viewBox.baseVal;
      const viewBoxWidth = viewBox.width;
      const viewBoxHeight = viewBox.height;

      const svgAspect = viewBoxWidth / viewBoxHeight;
      const rectAspect = rect.width / rect.height;

      let scaleX, scaleY, offsetX, offsetY;

      if (rectAspect > svgAspect) {
        const contentWidth = rect.height * svgAspect;
        scaleX = viewBoxWidth / contentWidth;
        scaleY = viewBoxHeight / rect.height;
        offsetX = (rect.width - contentWidth) / 2;
        offsetY = 0;
      } else {
        const contentHeight = rect.width / svgAspect;
        scaleX = viewBoxWidth / rect.width;
        scaleY = viewBoxHeight / contentHeight;
        offsetX = 0;
        offsetY = (rect.height - contentHeight) / 2;
      }

      return {
        x: (clientX - rect.left - offsetX) * scaleX,
        y: (clientY - rect.top - offsetY) * scaleY,
      };
    },
    []
  );

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDrawing(true);
      setShowGuide(false);
      cancelAnimation();
      const point = getPoint(e);
      setCurrentPath([`${point.x},${point.y}`]);
    },
    [getPoint, cancelAnimation]
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();
      const point = getPoint(e);
      setCurrentPath((prev) => [...prev, `${point.x},${point.y}`]);
    },
    [isDrawing, getPoint]
  );

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath.length > 1) {
      setDrawnPaths((prev) => [...prev, currentPath]);
    }
    setCurrentPath([]);
  }, [isDrawing, currentPath]);

  const clearCanvas = useCallback(() => {
    setDrawnPaths([]);
    setCurrentPath([]);
    setShowSuccess(false);
    setShowGuide(true);
    setGuideProgress(0);
    setCurrentStrokeIndex(0);
    setHandPosition(null);
    const langCleared = language === "ar" ? "تم المحو، حاول مرة أخرى" : language === "dv" ? "ފަހީ، އަދިވަރަކާ މަސައްކަތް ކުރާ" : "Cleared, try again";
    speakHint(langCleared);
    setTimeout(() => playGuideAnimation(), 1000);
  }, [speakHint, playGuideAnimation, language]);

  const handleDone = useCallback(() => {
    if (drawnPaths.length === 0) return;
    setShowSuccess(true);
    setCompletedCount((c) => c + 1);
    createParticles();
    speakLetter(targetKey, "say", language);
    setTimeout(() => celebrate(), 500);

    setTimeout(() => {
      nextLetter();
    }, 2500);
  }, [drawnPaths, targetKey, speakLetter, createParticles, celebrate, nextLetter, language]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 relative pt-20" role="main" aria-label="Write Mode - Draw letters">
      {/* Celebration Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-4 h-4 rounded-full pointer-events-none z-50"
          style={{
            backgroundColor: p.color,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `writeCelebrate 1.5s ease-out forwards`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      <div className="mb-2 text-center z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-purple-700 mb-1">
          {language === "ar" ? "وضع الكتابة" : language === "dv" ? "ލިޔުން މޯޑު" : "Write Mode"}
        </h2>
        <div className="flex items-center justify-center gap-4">
          <p className="text-xl text-purple-600" dir={isRTL ? "rtl" : "ltr"}>
            {language === "ar" ? "ارسم:" : language === "dv" ? "ލިޔާ:" : "Draw:"}
            <span className="font-bold text-3xl mx-2">{targetKey}</span>
          </p>
          <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
            <Trophy className="text-purple-600" size={18} />
            <span className="font-bold text-purple-700">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Drawing Canvas */}
      <div className="relative w-full max-w-3xl aspect-[4/3] bg-white rounded-3xl shadow-2xl border-4 border-purple-200 overflow-hidden">
        <svg
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          viewBox="0 0 100 75"
          preserveAspectRatio="xMidYMid meet"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          role="img"
          aria-label={`Drawing canvas for letter ${targetKey}`}
        >
          {/* Grid lines for guidance */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1 1" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1 1" />
          <line x1="33" y1="0" x2="33" y2="75" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1 1" />
          <line x1="66" y1="0" x2="66" y2="75" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1 1" />

          {/* Dotted letter template (very subtle) */}
          <text
            x="50"
            y="52"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="45"
            fill="#e5e7eb"
            fontWeight="bold"
            style={{
              fontFamily: isRTL
                ? "'Noto Naskh Arabic', 'Traditional Arabic', 'Scheherazade New', serif"
                : "'Comic Sans MS', 'Comic Neue', cursive",
            }}
          >
            {targetKey}
          </text>

          {/* Guide strokes with animation */}
          {showGuide && strokes.map((pathData, index) => {
            const isCompleted = index < currentStrokeIndex;
            const isCurrent = index === currentStrokeIndex;
            const opacity = isCompleted ? 0.2 : isCurrent ? 1 : 0.1;
            const strokeWidth = isCurrent ? 4 : 3;

            return (
              <path
                key={index}
                ref={(el) => { pathRefs.current[index] = el; }}
                d={pathData}
                fill="none"
                stroke="#22c55e"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={opacity}
                style={{
                  filter: isCurrent ? "drop-shadow(0 0 6px rgba(34, 197, 94, 0.8))" : "none",
                  transition: "opacity 0.2s ease",
                }}
              />
            );
          })}

          {/* Animated hand cursor following the stroke */}
          {showGuide && handPosition && (
            <g style={{ pointerEvents: "none" }}>
              {/* Glow effect */}
              <circle
                cx={handPosition.x}
                cy={handPosition.y}
                r="6"
                fill="rgba(34, 197, 94, 0.3)"
                style={{ animation: "handPulse 0.5s ease-in-out infinite" }}
              />
              {/* Hand circle */}
              <circle
                cx={handPosition.x}
                cy={handPosition.y}
                r="4"
                fill="#22c55e"
                stroke="white"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Drawn paths */}
          {drawnPaths.map((path, i) => (
            <polyline
              key={i}
              points={path.join(" ")}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Current path */}
          {currentPath.length > 0 && (
            <polyline
              points={currentPath.join(" ")}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* Guide overlay */}
        {showGuide && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-md animate-pulse flex items-center gap-2">
            <Play size={14} />
            {language === "ar" ? `شاهد كيف ترسم ${targetKey}` : language === "dv" ? `${targetKey} ކިތަނާކު ދަސްކޮށްލާ` : `Watch how to draw ${targetKey}`}
          </div>
        )}

        {/* Success overlay */}
        {showSuccess && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-20">
            <div className="relative animate-successBounce">
              <div className="absolute inset-0 animate-ping opacity-30">
                <Star className="text-yellow-400 w-48 h-48" fill="currentColor" />
              </div>
              <div className="relative z-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full p-8 shadow-2xl">
                <CheckCircle className="text-white w-24 h-24" strokeWidth={3} />
              </div>
            </div>
            <p className="text-4xl font-black text-green-600 mt-6 animate-textPop">
              {language === "ar" ? "أحسنت! 🎉" : language === "dv" ? "ރަނގާރީ! 🎉" : "Well Done! 🎉"}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 mt-4 z-10 flex-wrap justify-center">
        <button
          onClick={playGuideAnimation}
          className="kid-btn kid-btn-secondary flex items-center gap-2"
          disabled={showSuccess}
          aria-label="Show drawing guide animation"
        >
          <Eye className="inline" size={20} />
          {language === "ar" ? "أرني" : language === "dv" ? "ދައްކާ" : "Show Me"}
        </button>
        <button
          onClick={clearCanvas}
          className="kid-btn kid-btn-danger"
          disabled={(drawnPaths.length === 0 && currentPath.length === 0) || showSuccess}
          aria-label="Clear drawing canvas"
        >
          <Eraser className="inline mr-2" size={20} />
          {language === "ar" ? "مسح" : language === "dv" ? "ފަހީ" : "Clear"}
        </button>
        <button
          onClick={handleDone}
          className="kid-btn kid-btn-success"
          disabled={drawnPaths.length === 0 || showSuccess}
          aria-label="Submit drawing"
        >
          <CheckCircle className="inline mr-2" size={20} />
          {language === "ar" ? "تم!" : language === "dv" ? "ނިމި!" : "Done!"}
        </button>
        <button onClick={nextLetter} className="kid-btn kid-btn-secondary" disabled={showSuccess} aria-label="Skip to next letter">
          <ArrowRight className="inline mr-2" size={20} />
          {language === "ar" ? "تخطي" : language === "dv" ? "ދާއެކުވި" : "Skip"}
        </button>
      </div>

      <style jsx>{`
        @keyframes writeCelebrate {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotate(360deg) translateY(-50px);
            opacity: 0;
          }
        }

        @keyframes successBounce {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(10deg); opacity: 1; }
          70% { transform: scale(0.9) rotate(-5deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        @keyframes textPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes handPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 0.8; }
        }

        .animate-successBounce {
          animation: successBounce 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-textPop {
          animation: textPop 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
