export const COLORS = {
  background: '#fef3c7',
  foreground: '#1f2937',
  primary: '#f59e0b',
  secondary: '#3b82f6',
  success: '#22c55e',
  warning: '#f97316',
  danger: '#ef4444',

  // Mode backgrounds
  menuBg: '#fffbeb',
  sayBg: '#fffbeb',
  correctBg: '#eff6ff',
  writeBg: '#faf5ff',
  melodyBg: '#fdf2f8',

  // Button colors
  btnPrimary: '#fbbf24',
  btnPrimaryText: '#78350f',
  btnSecondary: '#60a5fa',
  btnSecondaryText: '#1e3a8a',
  btnSuccess: '#4ade80',
  btnSuccessText: '#14532d',
  btnDanger: '#f87171',
  btnDangerText: '#7f1d1d',

  // Accent colors for letters
  letterColors: [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899',
  ],

  // Piano/Melody palette
  pianoPalette: [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb923c',
    '#fbbf24', '#a3e635', '#4ade80', '#2dd4bf', '#38bdf8',
    '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9',
    '#f472b6', '#78350f', '#92400e', '#b45309', '#d97706',
    '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7',
    '#fffbeb',
  ],
};

export const FONTS = {
  comic: 'Comic Sans MS',
  arabic: 'Noto Naskh Arabic',
};

export const SIZES = {
  displayText: 120,
  displayTextLarge: 160,
  headerText: 48,
  titleText: 36,
  bodyText: 24,
  smallText: 18,
};

export function getColorForKey(key: string): string {
  const colors = COLORS.letterColors;
  const code = key.charCodeAt(0);
  return colors[code % colors.length];
}

export function getPianoColor(key: string, language: 'en' | 'ar' | 'dv'): string {
  const charSet = getCharSet(language);
  const index = charSet.indexOf(key);
  if (index === -1) return '#9ca3af';
  return COLORS.pianoPalette[index % COLORS.pianoPalette.length];
}

export function getCharSet(language: 'en' | 'ar' | 'dv'): string {
  if (language === 'ar') return 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي٠١٢٣٤٥٦٧٨٩';
  if (language === 'dv') return 'ހށނރބޅކއވމފދތލގޏސޑޒޓޔޕޖޗޘޙޚޛޜޝޞޟޠޡޢޣޤޥ٠١٢٣٤٥٦٧٨٩';
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
}

export function getWordAssociations(language: 'en' | 'ar' | 'dv'): Record<string, { letters: string; words: Record<string, string>; numbers: string[] }> {
  const associations: Record<string, { letters: string; words: Record<string, string>; numbers: string[] }> = {
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
      },
      numbers: ['ސިފަރު', 'އެއް', 'ދޭ', 'ތިން', 'ހާރަ', 'ފަސް', 'ހަތް', 'އަށް', 'އަށްޑަރަ', 'ނުވަ'],
    },
  };
  return associations;
}
