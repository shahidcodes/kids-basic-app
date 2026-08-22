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
  Text as SvgText,
  Line,
  G,
  Circle,
} from 'react-native-svg';
import { useVoice } from '../hooks/useVoice';
import { COLORS } from '../theme';

interface WriteModeProps {
  isActive: boolean;
  language: 'en' | 'ar' | 'dv';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
}

interface DrawnPath {
  points: string[];
}

const { width } = Dimensions.get('window');
const CANVAS_WIDTH = Math.min(width - 32, 700);
const CANVAS_HEIGHT = (CANVAS_WIDTH * 3) / 4;
const VIEWBOX_W = 100;
const VIEWBOX_H = 75;

const CHAR_SETS = {
  en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split(''),
  ar: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي٠١٢٣٤٥٦٧٨٩'.split(''),
  dv: 'ހށނރބޅކއވމފދތލގޏސޑޒޓޔޕޖޗޘޙޚޛޜޝޞޟޠޡޢޣޤޥ٠١٢٣٤٥٦٧٨٩'.split(''),
};

const ENGLISH_STROKES: Record<string, string[]> = {
  A: ['M 30 60 L 50 15 L 70 60', 'M 35 42 L 65 42'],
  B: ['M 30 15 L 30 60', 'M 30 15 L 55 15 Q 65 15 65 27 Q 65 37 55 37 L 30 37', 'M 30 37 L 55 37 Q 68 37 68 48 Q 68 60 55 60 L 30 60'],
  C: ['M 65 20 Q 30 15 30 37 Q 30 60 65 55'],
  D: ['M 30 15 L 30 60', 'M 30 15 L 55 15 Q 70 20 70 37 Q 70 55 55 60 L 30 60'],
  E: ['M 65 15 L 30 15 L 30 60 L 65 60', 'M 30 37 L 60 37'],
  F: ['M 65 15 L 30 15 L 30 60', 'M 30 37 L 60 37'],
  G: ['M 65 20 Q 30 15 30 37 Q 30 60 65 55 L 65 42 L 50 42'],
  H: ['M 30 15 L 30 60', 'M 70 15 L 70 60', 'M 30 37 L 70 37'],
  I: ['M 50 15 L 50 60', 'M 35 15 L 65 15', 'M 35 60 L 65 60'],
  J: ['M 65 15 L 65 50 Q 65 65 50 65 Q 35 65 35 50'],
  K: ['M 30 15 L 30 60', 'M 70 15 L 30 40 L 70 60'],
  L: ['M 30 15 L 30 60 L 65 60'],
  M: ['M 30 60 L 30 20 L 50 35 L 70 20 L 70 60'],
  N: ['M 30 60 L 30 15 L 70 60 L 70 15'],
  O: ['M 50 15 Q 30 15 30 37 Q 30 60 50 60 Q 70 60 70 37 Q 70 15 50 15'],
  P: ['M 30 15 L 30 60', 'M 30 15 L 55 15 Q 68 15 68 28 Q 68 40 55 40 L 30 40'],
  Q: ['M 50 15 Q 30 15 30 37 Q 30 60 50 60 Q 70 60 70 37 Q 70 15 50 15', 'M 55 50 L 70 70'],
  R: ['M 30 15 L 30 60', 'M 30 15 L 55 15 Q 68 15 68 28 Q 68 40 55 40 L 30 40', 'M 40 40 L 70 60'],
  S: ['M 60 20 Q 35 15 35 30 Q 35 37 50 37 Q 65 37 65 45 Q 65 60 40 55'],
  T: ['M 50 15 L 50 60', 'M 30 15 L 70 15'],
  U: ['M 30 15 L 30 50 Q 30 65 50 65 Q 70 65 70 50 L 70 15'],
  V: ['M 30 15 L 50 60 L 70 15'],
  W: ['M 25 15 L 35 60 L 50 40 L 65 60 L 75 15'],
  X: ['M 30 15 L 70 60', 'M 70 15 L 30 60'],
  Y: ['M 30 15 L 50 40 L 70 15', 'M 50 40 L 50 60'],
  Z: ['M 30 15 L 70 15 L 30 60 L 70 60'],
  '0': ['M 50 15 Q 30 15 30 37 Q 30 60 50 60 Q 70 60 70 37 Q 70 15 50 15'],
  '1': ['M 45 25 L 50 15 L 50 60', 'M 35 60 L 65 60'],
  '2': ['M 30 25 Q 30 15 50 15 Q 70 15 70 30 Q 70 40 30 60 L 70 60'],
  '3': ['M 30 20 Q 50 15 65 25 Q 70 30 50 37', 'M 50 37 Q 70 45 65 55 Q 50 65 30 55'],
  '4': ['M 65 15 L 65 60', 'M 65 15 L 30 50 L 70 50'],
  '5': ['M 65 15 L 30 15 L 30 37', 'M 30 37 Q 70 35 70 48 Q 70 60 50 60 Q 30 60 30 50'],
  '6': ['M 65 20 Q 50 15 35 25 Q 25 37 25 48 Q 25 60 50 60 Q 75 60 75 48 Q 75 40 50 40'],
  '7': ['M 30 15 L 70 15 L 50 60'],
  '8': ['M 50 37 Q 70 30 70 25 Q 70 15 50 15 Q 30 15 30 25 Q 30 30 50 37', 'M 50 37 Q 30 45 30 50 Q 30 60 50 60 Q 70 60 70 50 Q 70 45 50 37'],
  '9': ['M 50 15 Q 75 15 75 27 Q 75 40 50 40 Q 25 40 25 27 Q 25 15 50 15', 'M 65 40 L 65 60'],
};

const ARABIC_STROKES: Record<string, string[]> = {
  'ا': ['M 35 30 Q 35 20 50 20 Q 65 20 65 30 L 65 55 Q 65 60 50 60 Q 35 60 35 55 Z', 'M 50 35 L 50 55'],
  'ب': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 25 Q 45 20 50 25', 'M 55 25 Q 60 20 65 25'],
  'ت': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 35 25 L 40 20', 'M 45 25 L 50 20', 'M 55 25 L 60 20'],
  'ث': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 35 25 L 40 18', 'M 45 25 L 50 18', 'M 55 25 L 60 18', 'M 50 15 L 50 10'],
  'ج': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 55 L 40 60', 'M 55 25 Q 60 20 65 25'],
  'ح': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 55 L 40 60'],
  'خ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 55 L 40 60', 'M 50 10 L 50 5'],
  'د': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 20 L 60 20'],
  'ذ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 20 L 60 20', 'M 50 15 L 50 10'],
  'ر': ['M 35 20 Q 35 10 50 10 Q 65 10 65 20 L 65 40 Q 65 50 50 55', 'M 40 20 L 60 20'],
  'ز': ['M 35 20 Q 35 10 50 10 Q 65 10 65 20 L 65 40 Q 65 50 50 55', 'M 40 20 L 60 20', 'M 50 10 L 50 5'],
  'س': ['M 25 40 Q 25 25 40 25 Q 55 25 55 40 Q 55 55 70 55'],
  'ش': ['M 25 40 Q 25 25 40 25 Q 55 25 55 40 Q 55 55 70 55', 'M 40 20 L 40 15', 'M 50 20 L 50 15', 'M 60 20 L 60 15'],
  'ص': ['M 25 35 Q 25 20 40 20 Q 55 20 55 35 Q 55 50 70 50', 'M 30 35 Q 35 30 40 35'],
  'ض': ['M 25 35 Q 25 20 40 20 Q 55 20 55 35 Q 55 50 70 50', 'M 30 35 Q 35 30 40 35', 'M 40 20 L 40 15'],
  'ط': ['M 20 30 L 80 30', 'M 30 30 L 30 50 Q 30 60 50 60 Q 70 60 70 50 L 70 30', 'M 40 25 Q 45 20 50 25'],
  'ظ': ['M 20 30 L 80 30', 'M 30 30 L 30 50 Q 30 60 50 60 Q 70 60 70 50 L 70 30', 'M 40 25 Q 45 20 50 25', 'M 50 30 L 50 25'],
  'ع': ['M 30 20 Q 50 20 70 30 L 70 40 Q 70 50 50 50 Q 30 50 30 40 L 30 35', 'M 50 20 L 50 10'],
  'غ': ['M 30 20 Q 50 20 70 30 L 70 40 Q 70 50 50 50 Q 30 50 30 40 L 30 35', 'M 50 20 L 50 10', 'M 50 10 L 50 5'],
  'ف': ['M 30 20 L 70 20 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 35 25 Q 40 20 45 25'],
  'ق': ['M 30 20 L 70 20 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 50 60 L 50 70'],
  'ك': ['M 30 15 L 30 60', 'M 30 30 Q 50 25 70 30 L 70 50 Q 70 60 50 60 Q 35 60 35 50'],
  'ل': ['M 30 15 L 30 50 Q 30 60 50 60 Q 70 60 70 50 L 70 30 Q 70 15 50 15', 'M 40 25 Q 45 20 50 25'],
  'م': ['M 25 20 L 25 50', 'M 25 35 Q 50 25 75 35 L 75 50', 'M 50 35 L 50 60'],
  'ن': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 50 60 L 50 65'],
  'ه': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 35 L 60 35'],
  'و': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z'],
  'ي': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 25 L 45 20', 'M 50 25 L 55 20', 'M 60 25 L 65 20'],
  '٠': ['M 50 35 Q 35 35 35 50 Q 35 65 50 65 Q 65 65 65 50 Q 65 35 50 35 Z'],
  '١': ['M 45 25 L 50 35 L 50 65'],
  '٢': ['M 30 40 Q 30 30 50 30 Q 70 30 70 40 Q 70 50 50 55 Q 30 60 30 65 L 70 65'],
  '٣': ['M 30 35 Q 50 25 70 35', 'M 30 50 Q 50 40 70 50', 'M 30 65 Q 50 55 70 65'],
  '٤': ['M 65 25 L 35 50 L 65 50', 'M 65 25 L 65 65'],
  '٥': ['M 70 25 L 30 25 L 30 45', 'M 30 45 Q 70 40 70 55 Q 70 65 50 65 Q 30 65 30 55'],
  '٦': ['M 70 30 Q 50 25 30 35 Q 25 45 25 55 Q 25 65 50 65 Q 75 65 75 55'],
  '٧': ['M 30 25 L 70 25 L 50 65'],
  '٨': ['M 50 45 Q 70 35 70 45 Q 70 55 50 55 Q 30 55 30 45 Q 30 35 50 35 Q 70 35 70 45'],
  '٩': ['M 50 25 Q 75 25 75 40 Q 75 55 50 55 Q 25 55 25 40 Q 25 25 50 25'],
};

const DHIVEHI_STROKES: Record<string, string[]> = {
  'ހ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 35 35 L 65 35'],
  'ށ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 35 L 60 35', 'M 50 20 L 50 25'],
  'ނ': ['M 35 20 Q 35 10 50 10 Q 65 10 65 20 L 65 40 Q 65 50 50 55', 'M 40 35 Q 50 40 60 35'],
  'ރ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 45 Q 70 55 50 55 Q 30 55 30 45', 'M 50 55 L 50 65'],
  'ބ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 25 L 45 20', 'M 55 25 L 60 20'],
  'ޅ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 55', 'M 40 35 Q 50 40 60 35', 'M 50 20 L 50 25'],
  'ކ': ['M 30 15 L 30 60', 'M 30 30 Q 50 25 70 30', 'M 50 30 L 50 60'],
  'އ': ['M 40 20 Q 30 20 30 35 Q 30 50 50 50 Q 70 50 70 35 Q 70 20 60 20', 'M 50 50 L 50 60'],
  'ވ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 45 Q 70 55 50 55 Q 30 55 30 45 Z', 'M 40 35 Q 50 40 60 35'],
  'މ': ['M 25 20 L 25 50', 'M 25 35 Q 50 25 75 35 L 75 50', 'M 50 35 L 50 60', 'M 40 30 L 45 25'],
  'ފ': ['M 30 20 L 70 20 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 25 L 45 20'],
  'ދ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 50 60 L 50 65'],
  'ތ': ['M 20 30 L 80 30', 'M 30 30 L 30 50 Q 30 60 50 60 Q 70 60 70 50 L 70 30', 'M 50 30 L 50 20'],
  'ލ': ['M 30 15 L 30 50 Q 30 60 50 60 Q 70 60 70 50 L 70 30', 'M 40 25 L 45 20'],
  'ގ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 55', 'M 50 35 L 50 65'],
  'ޏ': ['M 25 35 Q 25 20 40 20 Q 55 20 55 35 Q 55 50 70 50', 'M 50 50 L 50 60'],
  'ސ': ['M 25 40 Q 25 25 40 25 Q 55 25 55 40 Q 55 55 70 55', 'M 40 25 L 45 20'],
  'ޑ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 50 60 L 50 70', 'M 40 20 L 45 15'],
  'ޒ': ['M 35 20 Q 35 10 50 10 Q 65 10 65 20 L 65 40 Q 65 50 50 55', 'M 40 20 L 60 20', 'M 50 20 L 50 15'],
  'ޓ': ['M 20 30 L 80 30', 'M 30 30 L 30 60', 'M 40 25 L 45 20'],
  'ޔ': ['M 30 20 L 70 20 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 25 L 45 20', 'M 55 25 L 60 20'],
  'ޕ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 35 25 L 40 20', 'M 45 25 L 50 20'],
  'ޖ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 45 Q 70 55 50 55', 'M 50 55 L 50 65', 'M 40 20 L 45 15'],
  'ޗ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 45 Q 70 55 50 55', 'M 40 20 L 45 15', 'M 50 20 L 50 15', 'M 60 20 L 65 15'],
  'ޘ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z'],
  'ޙ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 20 L 60 20'],
  'ޚ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 20 L 60 20', 'M 50 15 L 50 20'],
  'ޛ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 20 L 50 15 L 60 20'],
  'ޜ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 20 L 50 15 L 60 20', 'M 50 20 L 50 25'],
  'ޝ': ['M 25 40 Q 25 25 40 25 Q 55 25 55 40 Q 55 55 70 55', 'M 40 20 L 45 15', 'M 50 20 L 50 15', 'M 60 20 L 65 15'],
  'ޞ': ['M 25 35 Q 25 20 40 20 Q 55 20 55 35 Q 55 50 70 50', 'M 30 35 L 35 30', 'M 40 35 L 45 30'],
  'ޟ': ['M 25 35 Q 25 20 40 20 Q 55 20 55 35 Q 55 50 70 50', 'M 30 35 L 35 30', 'M 40 35 L 45 30', 'M 40 20 L 40 15'],
  'ޠ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z'],
  'ޡ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 40 20 L 60 20'],
  'ޢ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 50', 'M 50 20 L 50 15'],
  'ޣ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 50', 'M 50 20 L 50 15', 'M 50 15 L 50 10'],
  'ޤ': ['M 30 20 Q 30 10 50 10 Q 70 10 70 20 L 70 40 Q 70 50 50 50', 'M 50 20 L 50 10'],
  'ޥ': ['M 30 25 Q 30 15 50 15 Q 70 15 70 25 L 70 50 Q 70 60 50 60 Q 30 60 30 50 Z', 'M 50 60 L 50 65'],
  '٠': ['M 50 35 Q 35 35 35 50 Q 35 65 50 65 Q 65 65 65 50 Q 65 35 50 35 Z'],
  '١': ['M 45 25 L 50 35 L 50 65'],
  '٢': ['M 30 40 Q 30 30 50 30 Q 70 30 70 40 Q 70 50 50 55 Q 30 60 30 65 L 70 65'],
  '٣': ['M 30 35 Q 50 25 70 35', 'M 30 50 Q 50 40 70 50', 'M 30 65 Q 50 55 70 65'],
  '٤': ['M 65 25 L 35 50 L 65 50', 'M 65 25 L 65 65'],
  '٥': ['M 70 25 L 30 25 L 30 45', 'M 30 45 Q 70 40 70 55 Q 70 65 50 65 Q 30 65 30 55'],
  '٦': ['M 70 30 Q 50 25 30 35 Q 25 45 25 55 Q 25 65 50 65 Q 75 65 75 55'],
  '٧': ['M 30 25 L 70 25 L 50 65'],
  '٨': ['M 50 45 Q 70 35 70 45 Q 70 55 50 55 Q 30 55 30 45 Q 30 35 50 35 Q 70 35 70 45'],
  '٩': ['M 50 25 Q 75 25 75 40 Q 75 55 50 55 Q 25 55 25 40 Q 25 25 50 25'],
};

function getStrokes(char: string, language: 'en' | 'ar' | 'dv'): string[] {
  if (language === 'ar') return ARABIC_STROKES[char] || [];
  if (language === 'dv') return DHIVEHI_STROKES[char] || [];
  return ENGLISH_STROKES[char] || [];
}

export function WriteMode({ isActive, language }: WriteModeProps) {
  const [targetKey, setTargetKey] = useState('');
  const [drawnPaths, setDrawnPaths] = useState<DrawnPath[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);

  const canvasScale = useRef({ x: 1, y: 1 });
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const { speakLetter, celebrate, speakHint } = useVoice();

  const charSet = CHAR_SETS[language];
  const isRTL = language === 'ar' || language === 'dv';
  const strokes = getStrokes(targetKey, language);

  const createParticles = useCallback(() => {
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
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

  const triggerSuccess = useCallback(() => {
    successScale.setValue(0);
    successOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(successScale, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
      }),
      Animated.timing(successOpacity, {
        toValue: 0,
        duration: 2500,
        delay: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccess(false);
    });
  }, [successScale, successOpacity]);

  const getRandomLetter = useCallback(() => {
    return charSet[Math.floor(Math.random() * charSet.length)];
  }, [charSet]);

  const nextLetter = useCallback(() => {
    const random = getRandomLetter();
    setTargetKey(random);
    setDrawnPaths([]);
    setCurrentPath([]);
    setShowSuccess(false);
    setParticles([]);
    setShowGuide(true);
    setCurrentStrokeIndex(0);

    setTimeout(() => {
      const langHint =
        language === 'ar' ? 'ارسم حرف' : language === 'dv' ? 'ލިޔާ' : 'Draw the letter';
      speakHint(`${langHint} ${random}`);
    }, 300);
  }, [getRandomLetter, speakHint, language]);

  useEffect(() => {
    if (isActive && !targetKey) {
      const first = getRandomLetter();
      setTargetKey(first);
      const langHint =
        language === 'ar' ? 'ارسم حرف' : language === 'dv' ? 'ލިޔާ' : 'Draw the letter';
      speakHint(`${langHint} ${first}`);
    }
  }, [isActive, targetKey, getRandomLetter, speakHint, language]);

  // Guide animation - show strokes one by one
  useEffect(() => {
    if (!showGuide || strokes.length === 0) return;

    let strokeIdx = 0;
    const interval = setInterval(() => {
      strokeIdx++;
      if (strokeIdx >= strokes.length) {
        clearInterval(interval);
        setTimeout(() => setShowGuide(false), 800);
      } else {
        setCurrentStrokeIndex(strokeIdx);
      }
    }, 1200);

    setCurrentStrokeIndex(0);

    return () => clearInterval(interval);
  }, [showGuide, strokes]);

  const getPoint = useCallback((evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    const x = (locationX / CANVAS_WIDTH) * VIEWBOX_W;
    const y = (locationY / CANVAS_HEIGHT) * VIEWBOX_H;
    return { x, y };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsDrawing(true);
        setShowGuide(false);
        const point = getPoint(evt);
        setCurrentPath([`${point.x},${point.y}`]);
      },
      onPanResponderMove: (evt) => {
        const point = getPoint(evt);
        setCurrentPath((prev) => [...prev, `${point.x},${point.y}`]);
      },
      onPanResponderRelease: () => {
        setIsDrawing(false);
        setCurrentPath((prev) => {
          if (prev.length > 1) {
            setDrawnPaths((dprev) => [...dprev, { points: prev }]);
          }
          return [];
        });
      },
    })
  ).current;

  const clearCanvas = useCallback(() => {
    setDrawnPaths([]);
    setCurrentPath([]);
    setShowSuccess(false);
    setShowGuide(true);
    setCurrentStrokeIndex(0);
    const langCleared =
      language === 'ar'
        ? 'تم المحو، حاول مرة أخرى'
        : language === 'dv'
        ? 'ފަހީ، އަދިވަރަކާ މަސައްކަތް ކުރާ'
        : 'Cleared, try again';
    speakHint(langCleared);
  }, [speakHint, language]);

  const handleDone = useCallback(() => {
    if (drawnPaths.length === 0) return;
    setShowSuccess(true);
    setCompletedCount((c) => c + 1);
    createParticles();
    speakLetter(targetKey, 'say', language);
    setTimeout(() => celebrate(language), 500);
    triggerSuccess();

    setTimeout(() => {
      nextLetter();
    }, 2500);
  }, [drawnPaths, targetKey, speakLetter, createParticles, celebrate, triggerSuccess, nextLetter, language]);

  const playGuideAnimation = useCallback(() => {
    setShowGuide(true);
    setCurrentStrokeIndex(0);
  }, []);

  if (!isActive) return null;

  const titleText =
    language === 'ar' ? 'وضع الكتابة' : language === 'dv' ? 'ލިޔުން މޯޑު' : 'Write Mode';
  const drawText = language === 'ar' ? 'ارسم:' : language === 'dv' ? 'ލިޔާ:' : 'Draw:';

  return (
    <View style={styles.container}>
      {/* Particles */}
      {particles.map((p) => (
        <View
          key={p.id}
          style={[
            styles.particle,
            {
              backgroundColor: p.color,
              left: `${p.x}%`,
              top: `${p.y}%`,
            },
          ]}
        />
      ))}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{titleText}</Text>
        <View style={styles.headerRow}>
          <Text style={styles.drawLabel}>
            {drawText} <Text style={styles.targetLetter}>{targetKey}</Text>
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countEmoji}>🏆</Text>
            <Text style={styles.countText}>{completedCount}</Text>
          </View>
        </View>
      </View>

      {/* Drawing Canvas */}
      <View style={styles.canvasContainer}>
        <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
          <Svg
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
          >
            {/* Grid lines */}
            <Line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1 1" />
            <Line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1 1" />
            <Line x1="33" y1="0" x2="33" y2="75" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1 1" />
            <Line x1="66" y1="0" x2="66" y2="75" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1 1" />

            {/* Dotted letter template */}
            <SvgText
              x="50"
              y="52"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="45"
              fill="#e5e7eb"
              fontWeight="bold"
              fontFamily={isRTL ? COLORS.fonts.arabic : COLORS.fonts.comic}
            >
              {targetKey}
            </SvgText>

            {/* Guide strokes */}
            {showGuide &&
              strokes.map((pathData, index) => {
                const isCompleted = index < currentStrokeIndex;
                const isCurrent = index === currentStrokeIndex;
                return (
                  <Path
                    key={index}
                    d={pathData}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth={isCurrent ? 4 : 3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={isCompleted ? 0.2 : isCurrent ? 1 : 0.1}
                  />
                );
              })}

            {/* Current stroke hand indicator */}
            {showGuide && strokes[currentStrokeIndex] && (
              <G>
                <Circle
                  cx={strokes[currentStrokeIndex].includes('M') ? parseFloat(strokes[currentStrokeIndex].split('M')[1].trim().split(' ')[0]) : 50}
                  cy={strokes[currentStrokeIndex].includes('M') ? parseFloat(strokes[currentStrokeIndex].split('M')[1].trim().split(' ')[1]) : 30}
                  r="4"
                  fill="#22c55e"
                  stroke="white"
                  strokeWidth="1"
                />
              </G>
            )}

            {/* Drawn paths */}
            {drawnPaths.map((path, i) => (
              <Polyline
                key={i}
                points={path.points.join(' ')}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Current path */}
            {currentPath.length > 0 && (
              <Polyline
                points={currentPath.join(' ')}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        </View>

        {/* Guide overlay */}
        {showGuide && (
          <View style={styles.guideOverlay}>
            <Text style={styles.guideEmoji}>▶️</Text>
            <Text style={styles.guideText}>
              {language === 'ar'
                ? `شاهد كيف ترسم ${targetKey}`
                : language === 'dv'
                ? `${targetKey} ކިތަނާކު ދަސްކޮށްލާ`
                : `Watch how to draw ${targetKey}`}
            </Text>
          </View>
        )}

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
            <View style={styles.successIconContainer}>
              <Text style={styles.successEmoji}>✅</Text>
            </View>
            <Text style={styles.successText}>
              {language === 'ar'
                ? 'أحسنت!'
                : language === 'dv'
                ? 'ރަނގާރީ!'
                : 'Well Done!'}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          onPress={playGuideAnimation}
          style={[styles.controlButton, { backgroundColor: COLORS.btnSecondary }]}
          disabled={showSuccess}
        >
          <Text style={[styles.controlEmoji, { color: COLORS.btnSecondaryText }]}>👁️</Text>
          <Text style={[styles.controlText, { color: COLORS.btnSecondaryText }]}>
            {language === 'ar' ? 'أرني' : language === 'dv' ? 'ދައްކާ' : 'Show Me'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={clearCanvas}
          style={[styles.controlButton, { backgroundColor: COLORS.btnDanger }]}
          disabled={(drawnPaths.length === 0 && currentPath.length === 0) || showSuccess}
        >
          <Text style={[styles.controlEmoji, { color: COLORS.btnDangerText }]}>🧹</Text>
          <Text style={[styles.controlText, { color: COLORS.btnDangerText }]}>
            {language === 'ar' ? 'مسح' : language === 'dv' ? 'ފަހީ' : 'Clear'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDone}
          style={[styles.controlButton, { backgroundColor: COLORS.btnSuccess }]}
          disabled={drawnPaths.length === 0 || showSuccess}
        >
          <Text style={[styles.controlEmoji, { color: COLORS.btnSuccessText }]}>✅</Text>
          <Text style={[styles.controlText, { color: COLORS.btnSuccessText }]}>
            {language === 'ar' ? 'تم!' : language === 'dv' ? 'ނިމި!' : 'Done!'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={nextLetter}
          style={[styles.controlButton, { backgroundColor: '#e5e7eb' }]}
          disabled={showSuccess}
        >
          <Text style={[styles.controlEmoji, { color: '#374151' }]}>➡️</Text>
          <Text style={[styles.controlText, { color: '#374151' }]}>
            {language === 'ar' ? 'تخطي' : language === 'dv' ? 'ދާއެކުވި' : 'Skip'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  particle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    zIndex: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c3aed',
    fontFamily: COLORS.fonts.comic,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  drawLabel: {
    fontSize: 20,
    color: '#7c3aed',
    fontFamily: COLORS.fonts.comic,
  },
  targetLetter: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6b21a8',
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  countEmoji: {
    fontSize: 16,
  },
  countText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
    fontFamily: COLORS.fonts.comic,
  },
  canvasContainer: {
    position: 'relative',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#e9d5ff',
    overflow: 'hidden',
  },
  canvasWrapper: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
  guideOverlay: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guideEmoji: {
    fontSize: 14,
  },
  guideText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#166534',
    fontFamily: COLORS.fonts.comic,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    zIndex: 20,
  },
  successIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  successEmoji: {
    fontSize: 48,
  },
  successText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#16a34a',
    marginTop: 12,
    fontFamily: COLORS.fonts.comic,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  controlEmoji: {
    fontSize: 16,
  },
  controlText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: COLORS.fonts.comic,
  },
});
