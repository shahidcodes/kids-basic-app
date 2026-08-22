import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
  Easing,
} from 'react-native';
import Svg, {
  Path,
  Polyline,
  Circle,
  G,
} from 'react-native-svg';
import { useVoice } from '../hooks/useVoice';
import { COLORS, FONTS, SIZES, SHADOWS, BORDERS, getColorForKey } from '../theme';

interface WriteModeProps {
  isActive: boolean;
  language: 'en' | 'ar' | 'dv';
}

interface Point {
  x: number;
  y: number;
}

const { width } = Dimensions.get('window');
const CANVAS_WIDTH = Math.min(width - 48, 500);
const CANVAS_HEIGHT = CANVAS_WIDTH;
const VIEWBOX_SIZE = 100;

// Letter stroke definitions for tracing
const LETTER_STROKES: Record<string, Record<string, string[]>> = {
  en: {
    'A': ['M 30 70 L 50 20 L 70 70', 'M 38 50 L 62 50'],
    'B': ['M 30 20 L 30 70', 'M 30 20 Q 60 20 60 35 Q 60 45 30 45', 'M 30 45 Q 65 45 65 57 Q 65 70 30 70'],
    'C': ['M 70 30 Q 30 20 30 45 Q 30 70 70 60'],
    'D': ['M 30 20 L 30 70', 'M 30 20 Q 70 25 70 45 Q 70 65 30 70'],
    'E': ['M 70 20 L 30 20 L 30 70 L 70 70', 'M 30 45 L 60 45'],
    'F': ['M 70 20 L 30 20 L 30 70', 'M 30 45 L 60 45'],
    'G': ['M 70 30 Q 30 20 30 45 Q 30 70 70 60 L 70 50 L 55 50'],
    'H': ['M 30 20 L 30 70', 'M 70 20 L 70 70', 'M 30 45 L 70 45'],
    'I': ['M 50 20 L 50 70', 'M 35 20 L 65 20', 'M 35 70 L 65 70'],
    'J': ['M 65 20 L 65 55 Q 65 75 50 75 Q 35 75 35 55'],
    'K': ['M 30 20 L 30 70', 'M 70 20 L 30 45 L 70 70'],
    'L': ['M 30 20 L 30 70 L 70 70'],
    'M': ['M 20 70 L 20 25 L 50 50 L 80 25 L 80 70'],
    'N': ['M 30 70 L 30 20 L 70 70 L 70 20'],
    'O': ['M 50 20 Q 25 20 25 45 Q 25 70 50 70 Q 75 70 75 45 Q 75 20 50 20'],
    'P': ['M 30 20 L 30 70', 'M 30 20 Q 65 20 65 37 Q 65 50 30 50'],
    'Q': ['M 50 20 Q 25 20 25 45 Q 25 70 50 70 Q 75 70 75 45 Q 75 20 50 20', 'M 55 60 L 75 80'],
    'R': ['M 30 20 L 30 70', 'M 30 20 Q 65 20 65 35 Q 65 50 30 50', 'M 40 50 L 70 70'],
    'S': ['M 65 30 Q 35 20 35 35 Q 35 45 50 45 Q 65 45 65 55 Q 65 70 35 60'],
    'T': ['M 50 20 L 50 70', 'M 25 20 L 75 20'],
    'U': ['M 30 20 L 30 55 Q 30 75 50 75 Q 70 75 70 55 L 70 20'],
    'V': ['M 25 20 L 50 70 L 75 20'],
    'W': ['M 20 20 L 30 70 L 50 45 L 70 70 L 80 20'],
    'X': ['M 25 20 L 75 70', 'M 75 20 L 25 70'],
    'Y': ['M 25 20 L 50 50 L 75 20', 'M 50 50 L 50 70'],
    'Z': ['M 25 20 L 75 20 L 25 70 L 75 70'],
    '0': ['M 50 20 Q 25 20 25 45 Q 25 70 50 70 Q 75 70 75 45 Q 75 20 50 20'],
    '1': ['M 45 30 L 50 20 L 50 70', 'M 35 70 L 65 70'],
    '2': ['M 30 30 Q 30 20 50 20 Q 70 20 70 35 Q 70 50 30 70 L 70 70'],
    '3': ['M 30 25 Q 50 20 65 30', 'M 65 30 Q 70 37 50 45', 'M 50 45 Q 70 52 65 60 Q 50 70 30 60'],
    '4': ['M 70 20 L 70 70', 'M 70 20 L 30 55 L 75 55'],
    '5': ['M 65 20 L 30 20 L 30 42', 'M 30 42 Q 70 38 70 52 Q 70 70 30 65'],
    '6': ['M 65 25 Q 45 20 30 30 Q 20 45 20 55 Q 20 70 45 70 Q 70 70 70 50 Q 70 35 45 40'],
    '7': ['M 25 20 L 75 20 L 50 70'],
    '8': ['M 50 45 Q 75 38 75 28 Q 75 15 50 15 Q 25 15 25 28 Q 25 38 50 45', 'M 50 45 Q 25 52 25 62 Q 25 75 50 75 Q 75 75 75 62 Q 75 52 50 45'],
    '9': ['M 50 15 Q 75 15 75 40 Q 75 60 50 60 Q 25 60 25 40 Q 25 20 50 25', 'M 65 55 L 65 75'],
  },
  ar: {
    'ا': ['M 40 25 Q 40 15 50 15 Q 60 15 60 25 L 60 55', 'M 50 35 L 50 55'],
    'ب': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 40 22 Q 45 18 50 22', 'M 55 22 Q 60 18 65 22'],
    'ت': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 35 22 L 40 18', 'M 45 22 L 50 18', 'M 55 22 L 60 18'],
    'ث': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 35 22 L 40 18', 'M 45 22 L 50 18', 'M 55 22 L 60 18', 'M 50 15 L 50 10'],
    'ج': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 45 Q 70 55 50 60 L 35 65', 'M 55 22 Q 60 18 65 22'],
    'ح': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 45 Q 70 55 50 60 L 35 65'],
    'خ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 45 Q 70 55 50 60 L 35 65', 'M 50 10 L 50 5'],
    'د': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 40 22 L 60 22'],
    'ذ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 40 22 L 60 22', 'M 50 15 L 50 10'],
    'ر': ['M 35 20 Q 35 10 50 10 Q 65 10 65 20 L 65 45 Q 65 55 50 60', 'M 40 20 L 60 20'],
    'ز': ['M 35 20 Q 35 10 50 10 Q 65 10 65 20 L 65 45 Q 65 55 50 60', 'M 40 20 L 60 20', 'M 50 10 L 50 5'],
    'س': ['M 20 45 Q 20 30 35 30 Q 50 30 50 45 Q 50 60 65 60'],
    'ش': ['M 20 45 Q 20 30 35 30 Q 50 30 50 45 Q 50 60 65 60', 'M 35 22 L 35 17', 'M 45 22 L 45 17', 'M 55 22 L 55 17'],
    'ص': ['M 15 40 Q 15 25 30 25 Q 45 25 45 40 Q 45 55 60 55', 'M 25 40 L 30 35'],
    'ض': ['M 15 40 Q 15 25 30 25 Q 45 25 45 40 Q 45 55 60 55', 'M 25 40 L 30 35', 'M 35 25 L 35 20'],
    'ط': ['M 15 35 L 85 35', 'M 25 35 L 25 55 Q 25 65 50 65 Q 75 65 75 55 L 75 35', 'M 45 30 Q 50 25 55 30'],
    'ظ': ['M 15 35 L 85 35', 'M 25 35 L 25 55 Q 25 65 50 65 Q 75 65 75 55 L 75 35', 'M 45 30 Q 50 25 55 30', 'M 50 35 L 50 30'],
    'ع': ['M 25 20 Q 50 20 75 30 L 75 40 Q 75 50 50 50 Q 25 50 25 40 L 25 35', 'M 50 20 L 50 10'],
    'غ': ['M 25 20 Q 50 20 75 30 L 75 40 Q 75 50 50 50 Q 25 50 25 40 L 25 35', 'M 50 20 L 50 10', 'M 50 10 L 50 5'],
    'ف': ['M 25 20 L 75 20 L 75 50 Q 75 60 50 60 Q 25 60 25 50 Z', 'M 35 25 Q 40 21 45 25'],
    'ق': ['M 25 20 L 75 20 L 75 50 Q 75 60 50 60 Q 25 60 25 50 Z', 'M 50 60 L 50 75'],
    'ك': ['M 25 15 L 25 70', 'M 25 35 Q 50 25 75 35 L 75 50 Q 75 65 50 65 Q 30 65 30 50'],
    'ل': ['M 25 15 L 25 55 Q 25 65 50 65 Q 75 65 75 55 L 75 30 Q 75 15 50 15', 'M 40 25 Q 45 21 50 25'],
    'م': ['M 20 20 L 20 55', 'M 20 40 Q 50 25 80 40 L 80 55', 'M 50 40 L 50 70'],
    'ن': ['M 25 25 Q 25 15 50 15 Q 75 15 75 25 L 75 55', 'M 50 55 L 50 70'],
    'ه': ['M 25 25 Q 25 15 50 15 Q 75 15 75 25 L 75 55 Q 75 65 50 65 Q 25 65 25 55 Z', 'M 40 40 L 60 40'],
    'و': ['M 25 20 Q 25 10 50 10 Q 75 10 75 20 L 75 50 Q 75 65 50 65 Q 25 65 25 50 Z'],
    'ي': ['M 25 20 Q 25 10 50 10 Q 75 10 75 20 L 75 55 Q 75 65 50 65 Q 25 65 25 55 Z', 'M 40 25 L 45 20', 'M 50 25 L 55 20', 'M 60 25 L 65 20'],
    '٠': ['M 50 35 Q 35 35 35 50 Q 35 65 50 65 Q 65 65 65 50 Q 65 35 50 35 Z'],
    '١': ['M 45 30 L 50 20 L 50 70'],
    '٢': ['M 30 35 Q 30 25 50 25 Q 70 25 70 40 Q 70 50 30 70 L 70 70'],
    '٣': ['M 30 35 Q 50 25 70 35', 'M 30 50 Q 50 40 70 50', 'M 30 65 Q 50 55 70 65'],
    '٤': ['M 65 25 L 35 50 L 65 50', 'M 65 25 L 65 70'],
    '٥': ['M 70 25 L 30 25 L 30 45', 'M 30 45 Q 70 40 70 55 Q 70 70 30 65'],
    '٦': ['M 70 30 Q 50 25 30 35 Q 20 50 20 60 Q 20 70 50 70 Q 80 70 80 55'],
    '٧': ['M 30 25 L 70 25 L 50 70'],
    '٨': ['M 50 45 Q 70 35 70 45 Q 70 55 50 55 Q 30 55 30 45 Q 30 35 50 35 Q 70 35 70 45'],
    '٩': ['M 50 25 Q 75 25 75 40 Q 75 55 50 55 Q 25 55 25 40 Q 25 25 50 25'],
  },
  dv: {
    'ހ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 35 35 L 65 35'],
    'ށ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 40 35 L 60 35', 'M 50 22 L 50 27'],
    'ނ': ['M 35 20 Q 35 10 50 10 Q 65 10 65 20 L 65 45 Q 65 55 50 60', 'M 40 40 Q 50 45 60 40'],
    'ރ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 50 Q 70 60 50 60 Q 30 60 30 50', 'M 50 60 L 50 75'],
    'ބ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 40 25 L 45 20', 'M 55 25 L 60 20'],
    'ޅ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 45 Q 70 55 50 60', 'M 40 40 Q 50 45 60 40', 'M 50 22 L 50 27'],
    'ކ': ['M 25 15 L 25 70', 'M 25 35 Q 50 25 75 35', 'M 50 35 L 50 70'],
    'އ': ['M 35 25 Q 25 25 25 40 Q 25 55 50 55 Q 75 55 75 40 Q 75 25 65 25', 'M 50 55 L 50 70'],
    'ވ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 40 Q 50 45 60 40'],
    'މ': ['M 20 20 L 20 55', 'M 20 40 Q 50 25 80 40 L 80 55', 'M 50 40 L 50 70', 'M 35 35 L 40 30'],
    'ފ': ['M 25 20 L 75 20 L 75 50 Q 75 60 50 60 Q 25 60 25 50 Z', 'M 35 25 L 40 20'],
    'ދ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 50 55 L 50 70'],
    'ތ': ['M 15 35 L 85 35', 'M 25 35 L 25 60 Q 25 70 50 70 Q 75 70 75 60 L 75 35', 'M 50 35 L 50 20'],
    'ލ': ['M 25 15 L 25 55 Q 25 65 50 65 Q 75 65 75 55 L 75 30', 'M 35 25 L 40 20'],
    'ގ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 45 Q 70 55 50 60', 'M 50 40 L 50 70'],
    'ޏ': ['M 20 40 Q 20 25 40 25 Q 60 25 60 40 Q 60 55 75 55', 'M 50 55 L 50 70'],
    'ސ': ['M 20 45 Q 20 30 40 30 Q 60 30 60 45 Q 60 60 75 60', 'M 35 30 L 40 25'],
    'ޑ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 50 55 L 50 70', 'M 35 22 L 40 17'],
    'ޒ': ['M 35 20 Q 35 10 50 10 Q 65 10 65 20 L 65 45 Q 65 55 50 60', 'M 40 20 L 60 20', 'M 50 15 L 50 20'],
    'ޓ': ['M 15 35 L 85 35', 'M 25 35 L 25 70', 'M 35 30 L 40 25'],
    'ޔ': ['M 25 20 L 75 20 L 75 50 Q 75 60 50 60 Q 25 60 25 50 Z', 'M 35 25 L 40 20', 'M 55 25 L 60 20'],
    'ޕ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 35 25 L 40 20', 'M 45 25 L 50 20'],
    'ޖ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60', 'M 50 60 L 50 75', 'M 35 22 L 40 17'],
    'ޗ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60', 'M 35 22 L 40 17', 'M 50 22 L 50 17', 'M 65 22 L 70 17'],
    'ޘ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55'],
    'ޙ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 40 22 L 60 22'],
    'ޚ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 40 22 L 60 22', 'M 50 17 L 50 22'],
    'ޛ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 40 22 L 50 17 L 60 22'],
    'ޜ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 40 22 L 50 17 L 60 22', 'M 50 17 L 50 22'],
    'ޝ': ['M 20 45 Q 20 30 40 30 Q 60 30 60 45 Q 60 60 75 60', 'M 35 22 L 35 17', 'M 45 22 L 45 17', 'M 55 22 L 55 17'],
    'ޞ': ['M 20 40 Q 20 25 40 25 Q 60 25 60 40 Q 60 55 75 55', 'M 30 40 L 35 35', 'M 40 40 L 45 35'],
    'ޟ': ['M 20 40 Q 20 25 40 25 Q 60 25 60 40 Q 60 55 75 55', 'M 30 40 L 35 35', 'M 40 40 L 45 35', 'M 40 25 L 40 20'],
    'ޠ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55'],
    'ޡ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 40 22 L 60 22'],
    'ޢ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 45 Q 70 55 50 55', 'M 50 20 L 50 15'],
    'ޣ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 45 Q 70 55 50 55', 'M 50 20 L 50 15', 'M 50 15 L 50 10'],
    'ޤ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 45 Q 70 55 50 55', 'M 50 20 L 50 10'],
    'ޥ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 55', 'M 50 55 L 50 70'],
    '٠': ['M 50 35 Q 35 35 35 50 Q 35 65 50 65 Q 65 65 65 50 Q 65 35 50 35 Z'],
    '١': ['M 45 30 L 50 20 L 50 70'],
    '٢': ['M 30 40 Q 30 30 50 30 Q 70 30 70 40 Q 70 50 30 70 L 70 70'],
    '٣': ['M 30 40 Q 50 30 70 40', 'M 30 55 Q 50 45 70 55', 'M 30 70 Q 50 60 70 70'],
    '٤': ['M 65 25 L 35 50 L 65 50', 'M 65 25 L 65 70'],
    '٥': ['M 70 25 L 30 25 L 30 45', 'M 30 45 Q 70 40 70 55 Q 70 70 30 65'],
    '٦': ['M 70 30 Q 50 25 30 35 Q 20 50 20 60 Q 20 70 50 70 Q 80 70 80 55'],
    '٧': ['M 30 25 L 70 25 L 50 70'],
    '٨': ['M 50 45 Q 70 35 70 45 Q 70 55 50 55 Q 30 55 30 45 Q 30 35 50 35 Q 70 35 70 45'],
    '٩': ['M 50 25 Q 75 25 75 40 Q 75 55 50 55 Q 25 55 25 40 Q 25 25 50 25'],
  },
};

function getStrokes(char: string, language: 'en' | 'ar' | 'dv'): string[] {
  return LETTER_STROKES[language][char] || [];
}

function parsePoint(pointStr: string): Point {
  const parts = pointStr.trim().split(/[\s,]+/);
  return { x: parseFloat(parts[0]), y: parseFloat(parts[1]) };
}

function getPathStartPoint(pathD: string): Point {
  const match = pathD.match(/M\s*([\d.]+)\s+([\d.]+)/);
  if (match) {
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  }
  return { x: 50, y: 50 };
}

function getPathEndPoint(pathD: string): Point {
  // Find the last coordinate pair in the path
  const matches = pathD.match(/([\d.]+)\s+([\d.]+)/g);
  if (matches && matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    const parts = lastMatch.trim().split(/\s+/);
    return { x: parseFloat(parts[0]), y: parseFloat(parts[1]) };
  }
  return { x: 50, y: 50 };
}

export function WriteMode({ isActive, language }: WriteModeProps) {
  const [targetKey, setTargetKey] = useState('');
  const [currentStroke, setCurrentStroke] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState<boolean[]>([]);
  const [userPath, setUserPath] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [score, setScore] = useState(0);
  const [showGuide, setShowGuide] = useState(true);

  const { speakLetter, speakHint } = useVoice();

  const charSet = useRef(
    language === 'ar'
      ? 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'
      : language === 'dv'
      ? 'ހށނރބޅކއވމފދތލގޏސޑޒޓޔޕޖޗޘޙޚޛޜޝޞޟޠޡޢޣޤޥ'
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  ).current;

  const strokes = getStrokes(targetKey, language);
  const isRTL = language === 'ar' || language === 'dv';

  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  // Get a random letter
  const getRandomLetter = useCallback(() => {
    return charSet[Math.floor(Math.random() * charSet.length)];
  }, [charSet]);

  // Start a new letter
  const startNewLetter = useCallback((letter?: string) => {
    const newLetter = letter || getRandomLetter();
    setTargetKey(newLetter);
    setCurrentStroke(0);
    setCompletedStrokes([]);
    setUserPath([]);
    setShowSuccess(false);
    setShowGuide(true);

    setTimeout(() => {
      const hint =
        language === 'ar'
          ? `ارسم حرف ${newLetter}`
          : language === 'dv'
          ? `${newLetter} ލިޔާ`
          : `Trace the letter ${newLetter}`;
      speakHint(hint);
    }, 300);
  }, [getRandomLetter, language, speakHint]);

  // Initialize with first letter
  useEffect(() => {
    if (isActive && !targetKey) {
      startNewLetter('A'); // Start with A for English
    }
  }, [isActive, targetKey, startNewLetter]);

  // Trigger success animation
  const triggerSuccess = useCallback(() => {
    successScale.setValue(0);
    successOpacity.setValue(1);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 2000,
          delay: 1500,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowSuccess(false);
    });
  }, [successScale, successOpacity]);

  // Convert screen point to SVG coordinates
  const getSVGPoint = useCallback((evt: any): Point => {
    const { locationX, locationY } = evt.nativeEvent;
    const x = (locationX / CANVAS_WIDTH) * VIEWBOX_SIZE;
    const y = (locationY / CANVAS_HEIGHT) * VIEWBOX_SIZE;
    return { x: Math.max(0, Math.min(VIEWBOX_SIZE, x)), y: Math.max(0, Math.min(VIEWBOX_SIZE, y)) };
  }, []);

  // Calculate distance from point to path
  function pointToPathDistance(point: Point, pathD: string): number {
    // Sample points along the path and find minimum distance
    const startPoint = getPathStartPoint(pathD);
    const endPoint = getPathEndPoint(pathD);

    // Simple approximation: check distance to start and end
    const distToStart = Math.hypot(point.x - startPoint.x, point.y - startPoint.y);
    const distToEnd = Math.hypot(point.x - endPoint.x, point.y - endPoint.y);

    // Check if point is roughly in the middle region
    const midX = (startPoint.x + endPoint.x) / 2;
    const midY = (startPoint.y + endPoint.y) / 2;
    const distToMid = Math.hypot(point.x - midX, point.y - midY);

    return Math.min(distToStart, distToEnd, distToMid);
  }

  // Validate if user traced the stroke correctly
  const validateStroke = useCallback(
    (path: Point[]): boolean => {
      if (strokes.length === 0 || currentStroke >= strokes.length) return false;

      const targetPath = strokes[currentStroke];
      const startPoint = getPathStartPoint(targetPath);
      const endPoint = getPathEndPoint(targetPath);

      // Check if user started near the stroke start
      if (path.length < 3) return false;

      const userStart = path[0];
      const userEnd = path[path.length - 1];

      const startDist = Math.hypot(userStart.x - startPoint.x, userStart.y - startPoint.y);
      const endDist = Math.hypot(userEnd.x - endPoint.x, userEnd.y - endPoint.y);

      // Threshold: must start within 15 units and end within 20 units
      return startDist < 15 && endDist < 20;
    },
    [strokes, currentStroke]
  );

  // Pan responder for drawing
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        if (showSuccess) return;
        setIsDrawing(true);
        setShowGuide(false);
        const point = getSVGPoint(evt);
        setUserPath([point]);
      },
      onPanResponderMove: (evt) => {
        if (!isDrawing || showSuccess) return;
        const point = getSVGPoint(evt);
        setUserPath((prev) => [...prev, point]);
      },
      onPanResponderRelease: () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        // Validate the stroke
        setUserPath((currentPath) => {
          if (validateStroke(currentPath)) {
            // Stroke completed successfully
            const newCompleted = [...completedStrokes, true];
            setCompletedStrokes(newCompleted);

            if (currentStroke + 1 >= strokes.length) {
              // All strokes completed!
              setShowSuccess(true);
              setScore((s) => s + 1);
              speakLetter(targetKey, 'say', language);
              triggerSuccess();
              setTimeout(() => startNewLetter(), 2000);
            } else {
              // Move to next stroke
              setCurrentStroke((c) => c + 1);
              const nextHint =
                language === 'ar'
                  ? 'أحسنت! استمر'
                  : language === 'dv'
                  ? 'ރަނގަޅު! ކުރިއަށް'
                  : 'Great! Keep going';
              speakHint(nextHint);
            }
          } else {
            // Failed - clear path and show hint
            const failHint =
              language === 'ar'
                ? 'حاول مرة أخرى'
                : language === 'dv'
                ? 'އަދިވަރަކާ މަސައްކަތް ކުރާ'
                : 'Try again';
            speakHint(failHint);
          }
          return [];
        });
      },
    })
  ).current;

  // Skip current letter
  const skipLetter = useCallback(() => {
    startNewLetter();
  }, [startNewLetter]);

  // Replay guide
  const replayGuide = useCallback(() => {
    setCurrentStroke(0);
    setCompletedStrokes([]);
    setUserPath([]);
    setShowGuide(true);
    const hint =
      language === 'ar'
        ? 'شاهد واتبع الخطوط'
        : language === 'dv'
        ? 'ދެކެވުމަށް ފިއްތާ'
        : 'Watch and follow the lines';
    speakHint(hint);
  }, [language, speakHint]);

  if (!isActive) return null;

  const title =
    language === 'ar' ? 'تتبع الحرف' : language === 'dv' ? 'އަކުރު ޓްރޭސް ކުރާ' : 'Trace the Letter';
  const subtitle =
    language === 'ar'
      ? `ارسم حرف ${targetKey} خطوة بخطوة`
      : language === 'dv'
      ? `${targetKey} ސްޓެޕް ބައި ސްޓެޕް ލިޔާ`
      : `Trace ${targetKey} step by step`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.progressBar}>
          {strokes.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.progressDot,
                idx < completedStrokes.length && styles.progressDotCompleted,
                idx === currentStroke && styles.progressDotCurrent,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Canvas */}
      <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
        <Svg
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
          style={styles.canvas}
        >
          {/* Grid dots for guidance */}
          {[20, 40, 60, 80].map((x) =>
            [20, 40, 60, 80].map((y) => (
              <Circle key={`${x}-${y}`} cx={x} cy={y} r="0.5" fill="#e0e0e0" />
            ))
          )}

          {/* Completed strokes (shown faint) */}
          {completedStrokes.map((_, idx) =>
            strokes[idx] ? (
              <Path
                key={`completed-${idx}`}
                d={strokes[idx]}
                fill="none"
                stroke="#4ECDC4"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.4}
              />
            ) : null
          )}

          {/* Current target stroke - highlighted */}
          {strokes[currentStroke] && (
            <>
              {/* Dotted outline to trace */}
              <Path
                d={strokes[currentStroke]}
                fill="none"
                stroke="#FF6B6B"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4,3"
                opacity={0.6}
              />

              {/* Start point indicator */}
              <Circle
                cx={getPathStartPoint(strokes[currentStroke]).x}
                cy={getPathStartPoint(strokes[currentStroke]).y}
                r="4"
                fill="#22c55e"
                stroke="white"
                strokeWidth="1"
              />

              {/* Animated hand indicator for guide */}
              {showGuide && (
                <Circle
                  cx={getPathStartPoint(strokes[currentStroke]).x}
                  cy={getPathStartPoint(strokes[currentStroke]).y}
                  r="3"
                  fill="#FFD93D"
                  opacity={0.8}
                />
              )}
            </>
          )}

          {/* User drawing */}
          {userPath.length > 1 && (
            <Polyline
              points={userPath.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={getColorForKey(targetKey)}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>

        {/* Success overlay */}
        {showSuccess && (
          <Animated.View
            style={[
              styles.successOverlay,
              {
                transform: [{ scale: successScale }],
                opacity: successOpacity,
              },
            ]}
          >
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successText}>
              {language === 'ar' ? 'أحسنت!' : language === 'dv' ? 'ރަނގަޅު!' : 'Great Job!'}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={replayGuide} style={styles.controlBtn}>
          <Text style={styles.controlEmoji}>👁️</Text>
          <Text style={styles.controlText}>
            {language === 'ar' ? 'أظهر' : language === 'dv' ? 'ދައްކާ' : 'Show'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={skipLetter} style={[styles.controlBtn, styles.skipBtn]}>
          <Text style={styles.controlEmoji}>⏭️</Text>
          <Text style={styles.controlText}>
            {language === 'ar' ? 'تخطى' : language === 'dv' ? 'ސްކިޕް' : 'Skip'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreEmoji}>🏆</Text>
        <Text style={styles.scoreText}>{score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  title: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.displayFallback,
  },
  subtitle: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
    marginTop: SIZES.xs,
    fontFamily: FONTS.bodyFallback,
  },
  progressBar: {
    flexDirection: 'row',
    gap: SIZES.xs,
    marginTop: SIZES.sm,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  progressDotCompleted: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  progressDotCurrent: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
    transform: [{ scale: 1.2 }],
  },
  canvasWrapper: {
    alignSelf: 'center',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: COLORS.surface,
    borderRadius: BORDERS.radius.lg,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  canvas: {
    backgroundColor: '#fafafa',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  successEmoji: {
    fontSize: 60,
  },
  successText: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.success,
    marginTop: SIZES.sm,
    fontFamily: FONTS.displayFallback,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.md,
    marginTop: SIZES.md,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: BORDERS.radius.md,
    gap: SIZES.xs,
    ...SHADOWS.small,
  },
  skipBtn: {
    backgroundColor: '#f0f0f0',
  },
  controlEmoji: {
    fontSize: 20,
  },
  controlText: {
    fontSize: SIZES.bodySmall,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: FONTS.uiFallback,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.xs,
    marginTop: SIZES.sm,
  },
  scoreEmoji: {
    fontSize: 24,
  },
  scoreText: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.accentYellow,
    fontFamily: FONTS.displayFallback,
  },
});

export default WriteMode;
