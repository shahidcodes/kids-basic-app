import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useVoice } from '../hooks/useVoice';
import { VirtualKeyboard } from './VirtualKeyboard';
import { getColorForKey, COLORS, FONTS, SIZES, SHADOWS, BORDERS } from '../theme';

interface SayModeProps {
  isActive: boolean;
  language: 'en' | 'ar' | 'dv';
  onBack: () => void;
}

const TRANSLATIONS = {
  en: {
    title: 'Say Mode',
    prompt: 'Press a key!',
    lastKey: 'Last',
    keysPressed: 'Count',
  },
  ar: {
    title: 'وضع النطق',
    prompt: 'اضغط مفتاح!',
    lastKey: 'الأخير',
    keysPressed: 'العدد',
  },
  dv: {
    title: 'ބައްކަލުނުދާ މޯޑު',
    prompt: 'ކީއެއް ފިއްތާ!',
    lastKey: 'އެންމެ ފަހު',
    keysPressed: 'ޖުމްލަ',
  },
};

const { width } = Dimensions.get('window');

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
  scale: Animated.Value;
  opacity: Animated.Value;
  floatY: Animated.Value;
}

export function SayMode({ isActive, language, onBack }: SayModeProps) {
  const [lastKey, setLastKey] = useState('');
  const [keyCount, setKeyCount] = useState(0);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const { speakLetter } = useVoice();

  const t = TRANSLATIONS[language];

  // Animation values
  const letterScale = useRef(new Animated.Value(1)).current;
  const letterBounce = useRef(new Animated.Value(0)).current;

  const createFloatingEmoji = useCallback((key: string) => {
    const wordEmojis: Record<string, string> = {
      'A': '🍎', 'B': '🏀', 'C': '🐱', 'D': '🐶', 'E': '🐘',
      'F': '🐟', 'G': '🦒', 'H': '🏠', 'I': '🍦', 'J': '🪼',
      'K': '🪁', 'L': '🦁', 'M': '🐵', 'N': '🪹', 'O': '🍊',
      'P': '🐧', 'Q': '👸', 'R': '🌈', 'S': '☀️', 'T': '🐯',
      'U': '☂️', 'V': '🎻', 'W': '🐳', 'X': '🎹', 'Y': '💛',
      'Z': '🦓', '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣',
      '4': '4️⃣', '5': '5️⃣', '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣',
    };

    const emoji = wordEmojis[key.toUpperCase()] || '✨';
    const x = Math.random() * (width - 100) + 50;
    const y = 200;

    const scale = new Animated.Value(0);
    const opacity = new Animated.Value(1);
    const floatY = new Animated.Value(0);

    const newEmoji: FloatingEmoji = {
      id: Date.now(),
      emoji,
      x,
      y,
      scale,
      opacity,
      floatY,
    };

    setFloatingEmojis((prev) => [...prev, newEmoji]);

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.7)),
      }),
      Animated.parallel([
        Animated.timing(floatY, {
          toValue: -120,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]),
    ]).start(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    });
  }, []);

  const animateLetter = useCallback((keyColor: string) => {
    letterScale.setValue(0.5);
    letterBounce.setValue(0);

    Animated.spring(letterScale, {
      toValue: 1,
      friction: 5,
      tension: 150,
      useNativeDriver: true,
    }).start();
  }, [letterScale]);

  const handleKeyPress = useCallback(
    (key: string) => {
      const keyColor = getColorForKey(key);
      speakLetter(key, 'say', language);
      setLastKey(key);
      setKeyCount((c) => c + 1);
      animateLetter(keyColor);
      createFloatingEmoji(key);
    },
    [speakLetter, animateLetter, createFloatingEmoji, language]
  );

  if (!isActive) return null;

  const letterColor = lastKey ? getColorForKey(lastKey) : COLORS.textLight;

  return (
    <View style={styles.container}>
      {/* Integrated Header with Letter Display */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Letter Display - Center */}
        <View style={styles.letterDisplay}>
          <Animated.View
            style={[
              styles.letterBox,
              {
                backgroundColor: lastKey ? letterColor : COLORS.background,
                transform: [
                  { scale: letterScale },
                  { translateY: letterBounce },
                ],
              },
            ]}
          >
            <Text
              style={[
                styles.letterText,
                {
                  color: lastKey ? 'white' : COLORS.textLight,
                  fontFamily:
                    language === 'ar' || language === 'dv'
                      ? FONTS.arabicFallback
                      : FONTS.displayFallback,
                },
              ]}
            >
              {lastKey || '?'}
            </Text>
          </Animated.View>
          {lastKey && <Text style={styles.letterLabel}>{t.lastKey}</Text>}
        </View>

        {/* Count */}
        <View style={styles.countBadge}>
          <Text style={styles.countEmoji}>🔢</Text>
          <Text style={styles.countValue}>{keyCount}</Text>
        </View>
      </View>

      {/* Floating Emojis (rendered above keyboard) */}
      {floatingEmojis.map((emoji) => (
        <Animated.View
          key={emoji.id}
          style={[
            styles.floatingEmoji,
            {
              left: emoji.x,
              top: emoji.y,
              transform: [
                { scale: emoji.scale },
                { translateY: emoji.floatY },
              ],
              opacity: emoji.opacity,
            },
          ]}
        >
          <Text style={styles.floatingEmojiText}>{emoji.emoji}</Text>
        </Animated.View>
      ))}

      {/* Keyboard - Takes full remaining space */}
      <View style={styles.keyboardArea}>
        <VirtualKeyboard language={language} onKeyPress={handleKeyPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.sayBg,
  },

  // Header with integrated letter display - Improved layout
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: BORDERS.radius.md,
    // Fix shadow bleeding on rounded corners
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 80,
  },
  backIcon: {
    fontSize: 20,
    marginRight: SIZES.xs,
    color: COLORS.text,
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.uiFallback,
  },

  // Letter Display in Header - Made larger and more prominent
  letterDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  letterBox: {
    width: 80,
    height: 80,
    borderRadius: BORDERS.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    // Fix shadow bleeding on rounded corners
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  letterText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  letterLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    fontFamily: FONTS.uiFallback,
    fontWeight: '600',
  },

  // Count Badge - Made more prominent
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: BORDERS.radius.md,
    gap: SIZES.xs,
    // Fix shadow bleeding on rounded corners
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 80,
    justifyContent: 'center',
  },
  countEmoji: {
    fontSize: 18,
  },
  countValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.displayFallback,
    minWidth: 24,
    textAlign: 'center',
  },

  // Floating Emojis
  floatingEmoji: {
    position: 'absolute',
    zIndex: 50,
    pointerEvents: 'none',
  },
  floatingEmojiText: {
    fontSize: 50,
  },

  // Keyboard Area
  keyboardArea: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: SIZES.md,
  },
});

export default SayMode;
