// ============================================
// 🎨 KIDS LAUNCHER - PLAYFUL THEME SYSTEM
// ============================================
// A modern, toy-like aesthetic with organic shapes,
// bouncy animations, and cheerful colors.
// Inspired by premium children's apps like Duolingo Kids
// ============================================

// Typography: Rounded, friendly, warm
// Using system fonts as fallback, but prefer Nunito if available
export const FONTS = {
  // Display font for headlines - bold and playful
  display: 'Nunito-ExtraBold',
  displayFallback: 'Georgia-Bold', // iOS has nice rounded serif

  // Body font for readable text
  body: 'Nunito-Bold',
  bodyFallback: 'TrebuchetMS-Bold',

  // UI elements - buttons, labels
  ui: 'Nunito-SemiBold',
  uiFallback: 'TrebuchetMS',

  // Arabic script support
  arabic: 'NotoNaskhArabic-Bold',
  arabicFallback: 'GeezaPro-Bold',
};

// ============================================
// 🌈 COLOR PALETTE - Playful & Memorable
// ============================================
export const COLORS = {
  // Primary brand colors - Coral & Mint
  primary: '#FF6B6B',      // Soft coral - energetic but warm
  primaryLight: '#FFB4B4', // Light coral
  primaryDark: '#EE5A5A',  // Darker coral for pressed states

  secondary: '#4ECDC4',    // Mint green - fresh and calm
  secondaryLight: '#95E1D3', // Light mint
  secondaryDark: '#3DBDB4', // Darker mint

  // Accent colors - Sky & Sunshine
  accentBlue: '#45B7D1',   // Sky blue
  accentYellow: '#FFD93D', // Warm yellow
  accentPurple: '#A78BFA', // Soft purple
  accentPink: '#F472B6',   // Playful pink

  // Semantic colors
  success: '#6BCB77',      // Fresh green
  warning: '#FFB84D',      // Orange
  danger: '#FF6B6B',       // Coral red

  // Background colors - Warm, inviting
  background: '#FFFBF5',   // Cream white
  surface: '#FFFFFF',      // Pure white for cards
  surfaceAlt: '#FFF8F0',   // Warm surface

  // Mode backgrounds - Distinct but harmonious
  menuBg: '#FFFBF5',       // Cream
  sayBg: '#FFF5F0',        // Warm coral tint
  correctBg: '#F0FAF8',    // Mint tint
  writeBg: '#F8F5FF',      // Soft purple tint
  melodyBg: '#FFF0F5',     // Pink tint

  // Text colors
  text: '#2D3748',         // Dark slate - easy on eyes
  textLight: '#718096',    // Medium gray
  textMuted: '#A0AEC0',    // Light gray
  textInverse: '#FFFFFF',  // White for dark backgrounds

  // Mode card colors - Each mode gets its personality
  cardSay: { bg: '#FFF5EB', border: '#FFB84D', accent: '#FF9F43' },
  cardCorrect: { bg: '#EBF8FF', border: '#4ECDC4', accent: '#45B7D1' },
  cardWrite: { bg: '#F3F0FF', border: '#A78BFA', accent: '#8B5CF6' },
  cardMelody: { bg: '#FCE7F3', border: '#F472B6', accent: '#EC4899' },

  // Keyboard key colors - Rainbow progression
  letterColors: [
    '#FF6B6B', // Coral
    '#FFB84D', // Orange
    '#FFD93D', // Yellow
    '#6BCB77', // Green
    '#4ECDC4', // Mint
    '#45B7D1', // Sky
    '#5B8DEF', // Blue
    '#A78BFA', // Purple
    '#F472B6', // Pink
    '#FF8FAB', // Rose
  ],

  // Piano/Melody extended palette
  pianoPalette: [
    '#FF6B6B', '#FF8787', '#FFB84D', '#FFD93D', '#FFF3B0',
    '#6BCB77', '#95E1D3', '#4ECDC4', '#45B7D1', '#74C0FC',
    '#5B8DEF', '#A78BFA', '#C084FC', '#F472B6', '#FF8FAB',
    '#FFB4B4', '#FFD4C4', '#FFE4C4', '#E8F5E9', '#C8E6C9',
  ],

  // Fonts reference (attached for backward compat)
  fonts: FONTS,
};

// ============================================
// 📏 SIZES - Child-friendly dimensions
// ============================================
export const SIZES = {
  // Display text - Large and impactful
  display: 160,
  displayLarge: 200,
  displaySmall: 120,

  // Headers
  h1: 48,
  h2: 36,
  h3: 28,
  h4: 24,

  // Body text
  body: 20,
  bodySmall: 16,
  caption: 14,

  // UI elements
  button: 20,
  label: 18,

  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ============================================
// 🎯 SHADOWS - Subtle, clean depth (reduced to prevent bleeding)
// ============================================
export const SHADOWS = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  }),
};

// ============================================
// 🎪 BORDERS - Organic, rounded shapes
// ============================================
export const BORDERS = {
  radius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },
  width: {
    thin: 1,
    normal: 2,
    thick: 3,
    heavy: 4,
  },
};

// ============================================
// 🌊 ANIMATIONS - Bouncy, playful motion
// ============================================
export const ANIMATIONS = {
  // Spring configs for React Native
  spring: {
    gentle: {
      friction: 8,
      tension: 40,
    },
    bouncy: {
      friction: 6,
      tension: 80,
    },
    wobbly: {
      friction: 4,
      tension: 120,
    },
    stiff: {
      friction: 15,
      tension: 150,
    },
  },

  // Timing configs
  timing: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },

  // Easing functions
  easing: {
    bounce: 'bounce',
    ease: 'ease',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    elastic: 'elastic',
  },
};

// ============================================
// 🎤 TTS LOCALES
// ============================================
export const TTS_LOCALES: Record<'en' | 'ar' | 'dv', string> = {
  en: 'en-US',
  ar: 'ar-SA',
  dv: 'dv-MV',
};

// ============================================
// 🧮 HELPER FUNCTIONS
// ============================================
export function getColorForKey(key: string): string {
  const colors = COLORS.letterColors;
  const code = key.charCodeAt(0);
  return colors[code % colors.length];
}

export function getPianoColor(key: string, language: 'en' | 'ar' | 'dv'): string {
  const charSet = getCharSet(language);
  const index = charSet.indexOf(key);
  if (index === -1) return '#A0AEC0';
  return COLORS.pianoPalette[index % COLORS.pianoPalette.length];
}

export function getCharSet(language: 'en' | 'ar' | 'dv'): string {
  if (language === 'ar') return 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي٠١٢٣٤٥٦٧٨٩';
  if (language === 'dv') return 'ހށނރބޅކއވމފދތލގޏސޑޒޓޔޕޖޗޘޙޚޛޜޝޞޟޠޡޢޣޤޥ٠١٢٣٤٥٦٧٨٩';
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
}

export function getWordAssociations(language: 'en' | 'ar' | 'dv'): {
  letters: string;
  words: Record<string, string>;
  numbers: string[];
} {
  const associations: Record<string, {
    letters: string;
    words: Record<string, string>;
    numbers: string[];
  }> = {
    en: {
      letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      words: {
        A: 'A for Apple', B: 'B for Ball', C: 'C for Cat', D: 'D for Dog',
        E: 'E for Elephant', F: 'F for Fish', G: 'G for Giraffe', H: 'H for House',
        I: 'I for Ice cream', J: 'J for Jellyfish', K: 'K for Kite', L: 'L for Lion',
        M: 'M for Monkey', N: 'N for Nest', O: 'O for Orange', P: 'P for Penguin',
        Q: 'Q for Queen', R: 'R for Rainbow', S: 'S for Sun', T: 'T for Tiger',
        U: 'U for Umbrella', V: 'V for Violin', W: 'W for Whale', X: 'X for Xylophone',
        Y: 'Y for Yellow', Z: 'Z for Zebra',
        '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
        '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
      },
      numbers: ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'],
    },
    ar: {
      letters: 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي',
      words: {
        'ا': 'ألف - أسد', 'ب': 'باء - بطة', 'ت': 'تاء - تفاح', 'ث': 'ثاء - ثعلب',
        'ج': 'جيم - جمل', 'ح': 'حاء - حمار', 'خ': 'خاء - خبز', 'د': 'دال - ديك',
        'ذ': 'ذال - ذئب', 'ر': 'راء - رمان', 'ز': 'زاي - زرافة', 'س': 'سين - سنبلة',
        'ش': 'شين - شمس', 'ص': 'صاد - صقر', 'ض': 'ضاد - ضفدع', 'ط': 'طاء - طائر',
        'ظ': 'ظاء - ظرف', 'ع': 'عين - عنب', 'غ': 'غين - غزال', 'ف': 'فاء - فراشة',
        'ق': 'قاف - قمر', 'ك': 'كاف - كتاب', 'ل': 'لام - ليمون', 'م': 'ميم - موز',
        'ن': 'نون - نجمة', 'ه': 'هاء - هدهد', 'و': 'واو - ورقة', 'ي': 'ياء - يد',
        '٠': 'صفر', '١': 'واحد', '٢': 'اثنان', '٣': 'ثلاثة', '٤': 'أربعة',
        '٥': 'خمسة', '٦': 'ستة', '٧': 'سبعة', '٨': 'ثمانية', '٩': 'تسعة',
      },
      numbers: ['صفر', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'],
    },
    dv: {
      letters: 'ހށނރބޅކއވމފދތލގޏސޑޒޓޔޕޖޗޘޙޚޛޜޝޞޟޠޡޢޣޤޥ',
      words: {
        'ހ': 'ހާ - ހަސް', 'ށ': 'ށާ - ށަމާކި', 'ނ': 'ނާ - ނުވާ', 'ރ': 'ރާ - ރުކަ',
        'ބ': 'ބާ - ބައްރަ', 'ޅ': 'ޅާ - ޅައި', 'ކ': 'ކާ - ކައިގަން', 'އ': 'އާ - އަލި',
        'ވ': 'ވާ - ވަރިއަ', 'މ': 'މާ - މަސް', 'ފ': 'ފާ - ފަތް', 'ދ': 'ދާ - ދޫނި',
        'ތ': 'ތާ - ތިނަ', 'ލ': 'ލާ - ލައި', 'ގ': 'ގާ - ގަހަ', 'ޏ': 'ޏާ - ޏިޔަ',
        'ސ': 'ސާ - ސިނަ', 'ޑ': 'ޑާ - ޑޮރު', 'ޒ': 'ޒާ - ޒޫނަ', 'ޓ': 'ޓާ - ޓޭބަލް',
        'ޔ': 'ޔާ - ޔަކަތް', 'ޕ': 'ޕާ - ޕަންޑަ', 'ޖ': 'ޖާ - ޖަމަލު', 'ޗ': 'ޗާ - ޗާނަ',
        '٠': 'ސިފަރު', '١': 'އެއް', '٢': 'ދޭ', '٣': 'ތިން', '٤': 'ހާރަ',
        '٥': 'ފަސް', '٦': 'ހަތް', '٧': 'އަށް', '٨': 'އަށްޑަރަ', '٩': 'ނުވަ',
      },
      numbers: ['ސިފަރު', 'އެއް', 'ދޭ', 'ތިން', 'ހާރަ', 'ފަސް', 'ހަތް', 'އަށް', 'އަށްޑަރަ', 'ނުވަ'],
    },
  };
  return associations[language] || associations.en;
}

// ============================================
// 🎨 GRADIENT PRESETS (for StyleSheet gradients)
// ============================================
export const GRADIENTS = {
  // Use with react-native-linear-gradient if installed
  // Or create with multiple backgrounds
  primary: ['#FF6B6B', '#FF8E8E'],
  secondary: ['#4ECDC4', '#6EDDD6'],
  sunset: ['#FFB84D', '#FFD93D'],
  ocean: ['#45B7D1', '#74C0FC'],
  magic: ['#A78BFA', '#C084FC'],
  warm: ['#FFF5F0', '#FFFBF5'],
  cool: ['#F0FAF8', '#F8FFFE'],
};

export default {
  FONTS,
  COLORS,
  SIZES,
  SHADOWS,
  BORDERS,
  ANIMATIONS,
  TTS_LOCALES,
  GRADIENTS,
  getColorForKey,
  getPianoColor,
  getCharSet,
  getWordAssociations,
};
