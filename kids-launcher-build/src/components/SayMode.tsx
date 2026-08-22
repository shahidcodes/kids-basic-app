import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useVoice } from '../hooks/useVoice';
import { VirtualKeyboard } from './VirtualKeyboard';
import { getColorForKey, COLORS } from '../theme';

interface SayModeProps {
  isActive: boolean;
  language: 'en' | 'ar' | 'dv';
}

const TRANSLATIONS = {
  en: {
    title: 'Say Mode',
    subtitle: 'Press any letter or number key!',
    prompt: 'Press a key to hear it!',
    lastKey: 'Last key',
    keysPressed: 'Keys pressed',
  },
  ar: {
    title: 'وضع النطق',
    subtitle: 'اضغط على أي حرف أو رقم!',
    prompt: 'اضغط على مفتاح لتسمعه!',
    lastKey: 'آخر مفتاح',
    keysPressed: 'المفاتيح المضغوطة',
  },
  dv: {
    title: 'ބައްކަލުނުދާ މޯޑު',
    subtitle: 'ކޮންމެ ފޮތުން ނުވަތަ ނަންބަރަކުން ފިއާރުކުރާ!',
    prompt: 'އަޑުއިވުމަށް ފިއާރުކުރާ!',
    lastKey: 'އެންމެ ފަހުގެ ފޮތް',
    keysPressed: 'ޖުމްލަ ފިއާރުކޮށްފައިވާ',
  },
};

const { width, height } = Dimensions.get('window');

interface Sparkle {
  id: number;
  x: number;
  y: number;
  scale: Animated.Value;
  opacity: Animated.Value;
}

export function SayMode({ isActive, language }: SayModeProps) {
  const [lastKey, setLastKey] = useState('');
  const [showVisual, setShowVisual] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [keyCount, setKeyCount] = useState(0);
  const { speakLetter } = useVoice();

  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar' || language === 'dv';

  const letterScale = useRef(new Animated.Value(1)).current;
  const letterOpacity = useRef(new Animated.Value(0.4)).current;

  const createSparkles = useCallback(() => {
    const newSparkles: Sparkle[] = [];
    for (let i = 0; i < 12; i++) {
      const scale = new Animated.Value(0);
      const opacity = new Animated.Value(1);
      newSparkles.push({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        scale,
        opacity,
      });

      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.5 + Math.random() * 0.5,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start();
    }
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 1200);
  }, []);

  const animateLetter = useCallback(() => {
    letterScale.setValue(0.8);
    letterOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(letterScale, {
        toValue: 1.1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(letterOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        Animated.timing(letterScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 200);
    });
  }, [letterScale, letterOpacity]);

  const handleKeyPress = useCallback(
    (key: string) => {
      speakLetter(key, 'say', language);
      setLastKey(key);
      setShowVisual(true);
      setKeyCount((c) => c + 1);
      createSparkles();
      animateLetter();

      setTimeout(() => setShowVisual(false), 1200);
    },
    [speakLetter, createSparkles, animateLetter, language]
  );

  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showVisual) {
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showVisual, glowAnim]);

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      {/* Sparkles */}
      {sparkles.map((s) => (
        <Animated.View
          key={s.id}
          style={[
            styles.sparkle,
            {
              left: width / 2 + s.x,
              top: height / 3 + s.y,
              transform: [{ scale: s.scale }],
              opacity: s.opacity,
            },
          ]}
        >
          <Text style={styles.sparkleText}>✨</Text>
        </Animated.View>
      ))}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🌍</Text>
        <Text style={styles.title}>{t.title}</Text>
      </View>
      <Text style={styles.subtitle}>{t.subtitle}</Text>

      {/* Letter Display */}
      <View style={styles.letterContainer}>
        {lastKey ? (
          <View style={styles.letterWrapper}>
            {/* Glow effect */}
            <Animated.View
              style={[
                styles.glow,
                {
                  backgroundColor: getColorForKey(lastKey),
                  opacity: glowAnim,
                  transform: [{ scale: Animated.add(1, Animated.multiply(glowAnim, 0.5)) }],
                },
              ]}
            />
            <Animated.Text
              style={[
                styles.letter,
                {
                  color: getColorForKey(lastKey),
                  fontFamily:
                    language === 'ar' || language === 'dv'
                      ? COLORS.fonts.arabic
                      : COLORS.fonts.comic,
                  transform: [{ scale: letterScale }],
                  opacity: letterOpacity,
                  textShadowColor: showVisual
                    ? `${getColorForKey(lastKey)}80`
                    : 'transparent',
                  textShadowRadius: showVisual ? 40 : 0,
                  textShadowOffset: { width: 0, height: 0 },
                },
              ]}
            >
              {lastKey}
            </Animated.Text>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderEmoji}>🔊</Text>
            <Text style={styles.placeholderText}>✨</Text>
            <Text style={styles.placeholderLabel}>{t.prompt}</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={[styles.statsContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.statBadge}>
          <Text style={styles.statEmoji}>🔊</Text>
          <Text style={styles.statText}>
            {t.lastKey}: <Text style={styles.statValue}>{lastKey || '-'}</Text>
          </Text>
        </View>
        <View style={[styles.statBadge, { backgroundColor: '#f3e8ff' }]}>
          <Text style={[styles.statText, { color: '#7c3aed' }]}>
            {t.keysPressed}: <Text style={[styles.statValue, { color: '#7c3aed' }]}>{keyCount}</Text>
          </Text>
        </View>
      </View>

      {/* Virtual Keyboard */}
      <View style={styles.keyboardContainer}>
        <VirtualKeyboard language={language} onKeyPress={handleKeyPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  sparkle: {
    position: 'absolute',
    zIndex: 50,
  },
  sparkleText: {
    fontSize: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerEmoji: {
    fontSize: 28,
    marginRight: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#b45309',
    fontFamily: COLORS.fonts.comic,
  },
  subtitle: {
    fontSize: 18,
    color: '#d97706',
    marginBottom: 16,
    fontFamily: COLORS.fonts.comic,
  },
  letterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 160,
  },
  letterWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.6,
  },
  letter: {
    fontSize: 140,
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 80,
  },
  placeholderText: {
    fontSize: 32,
    position: 'absolute',
    top: -16,
    right: -32,
  },
  placeholderLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginTop: 8,
    fontFamily: COLORS.fonts.comic,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statEmoji: {
    fontSize: 18,
  },
  statText: {
    fontSize: 16,
    color: '#b45309',
    fontFamily: COLORS.fonts.comic,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#b45309',
  },
  keyboardContainer: {
    width: '100%',
    paddingBottom: 20,
  },
});
