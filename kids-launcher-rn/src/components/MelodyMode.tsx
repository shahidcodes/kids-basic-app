import React, { useCallback, useMemo, useState } from 'react';
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
import { getPianoColor, getCharSet, getWordAssociations, COLORS, FONTS } from '../theme';

interface MelodyModeProps {
  isActive: boolean;
  language: 'en' | 'ar' | 'dv';
}

interface Ripple {
  id: number;
  key: string;
  opacity: Animated.Value;
  scale: Animated.Value;
}

const { width } = Dimensions.get('window');

export function MelodyMode({ isActive, language }: MelodyModeProps) {
  const [lastKey, setLastKey] = useState('');
  const [lastWord, setLastWord] = useState('');
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [noteCount, setNoteCount] = useState(0);

  const { speakLetter, speakWord } = useVoice({ rate: 0.9, pitch: 1, volume: 1 });

  const charSet = useMemo(() => getCharSet(language), [language]);
  const chars = charSet.split('');
  const charsPerRow = language === 'en' ? 10 : 8;
  const rows: string[][] = [];
  for (let i = 0; i < chars.length; i += charsPerRow) {
    rows.push(chars.slice(i, i + charsPerRow));
  }

  const buttonSize = Math.min((width - 40) / charsPerRow - 6, 72);

  const handleKeyPress = useCallback(
    (key: string) => {
      speakLetter(key, 'melody', language);

      const assoc = getWordAssociations(language);
      let word = assoc.words[key] || '';

      if (word) {
        setTimeout(() => {
          speakWord(word, language);
        }, 400);
      }

      setLastKey(key);
      setLastWord(word);
      setNoteCount((c) => c + 1);

      // Visual feedback
      setActiveNotes((prev) => new Set([...prev, key]));

      // Add ripple
      const rippleId = Date.now();
      const opacity = new Animated.Value(0.8);
      const scale = new Animated.Value(0);

      const newRipple: Ripple = {
        id: rippleId,
        key,
        opacity,
        scale,
      };

      setRipples((prev) => [...prev, newRipple]);

      Animated.parallel([
        Animated.timing(scale, {
          toValue: 2,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
      ]).start(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      });

      setTimeout(() => {
        setActiveNotes((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }, 300);
    },
    [speakLetter, speakWord, language]
  );

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🎵</Text>
        <Text style={styles.title}>Melody Mode</Text>
      </View>
      <View style={styles.subtitleRow}>
        <Text style={styles.subtitle}>Press keys to make music!</Text>
        <View style={styles.noteCountBadge}>
          <Text style={styles.noteCountEmoji}>🎵</Text>
          <Text style={styles.noteCountText}>{noteCount}</Text>
        </View>
      </View>

      {/* Word display */}
      {lastWord && (
        <View style={styles.wordContainer}>
          <View style={styles.wordBadge}>
            <Text
              style={[
                styles.wordText,
                {
                  fontFamily:
                    language === 'ar' || language === 'dv'
                      ? FONTS.arabicFallback
                      : FONTS.displayFallback,
                },
              ]}
            >
              {lastWord}
            </Text>
          </View>
        </View>
      )}

      {/* Piano Grid */}
      <View style={styles.gridContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((key) => {
              const isActive = activeNotes.has(key);
              const color = getPianoColor(key, language);

              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleKeyPress(key)}
                  activeOpacity={0.7}
                  style={[
                    styles.key,
                    {
                      width: buttonSize,
                      height: buttonSize,
                      backgroundColor: color,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: isActive ? 2 : 6 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: isActive ? 2 : 6,
                      transform: [{ translateY: isActive ? 4 : 0 }, { scale: isActive ? 0.95 : 1 }],
                    },
                  ]}
                >
                  {/* Ripple effect */}
                  {ripples
                    .filter((r) => r.key === key)
                    .map((ripple) => (
                      <Animated.View
                        key={ripple.id}
                        style={[
                          styles.ripple,
                          {
                            backgroundColor: 'rgba(255,255,255,0.4)',
                            opacity: ripple.opacity,
                            transform: [{ scale: ripple.scale }],
                          },
                        ]}
                      />
                    ))}
                  <Text
                    style={[
                      styles.keyText,
                      {
                        fontSize: buttonSize * 0.4,
                        fontFamily:
                          language === 'ar' || language === 'dv'
                            ? FONTS.arabicFallback
                            : FONTS.displayFallback,
                      },
                    ]}
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Last key display */}
      <View style={styles.lastKeyContainer}>
        <View style={styles.lastKeyWrapper}>
          {lastKey && (
            <View
              style={[
                styles.lastKeyGlow,
                { backgroundColor: getPianoColor(lastKey, language) },
              ]}
            />
          )}
          <View
            style={[
              styles.lastKeyBox,
              {
                backgroundColor: lastKey ? getPianoColor(lastKey, language) : '#e5e7eb',
                shadowColor: lastKey ? getPianoColor(lastKey, language) : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 15,
                elevation: lastKey ? 8 : 0,
              },
            ]}
          >
            <Text
              style={[
                styles.lastKeyText,
                {
                  color: lastKey ? 'white' : '#9ca3af',
                  fontFamily:
                    language === 'ar' || language === 'dv'
                      ? FONTS.arabicFallback
                      : FONTS.displayFallback,
                },
              ]}
            >
              {lastKey || '?'}
            </Text>
            {lastKey && (
              <Text style={styles.lastKeySparkle}>✨</Text>
            )}
          </View>
        </View>

        <View style={styles.hintContainer}>
          <Text style={styles.hintEmoji}>🎵</Text>
          <Text style={styles.hintText}>Keep playing!</Text>
          <View style={styles.hintRow}>
            <Text style={styles.hintEmojiSmall}>🔊</Text>
            <Text style={styles.hintSubtext}>Each letter plays a different note</Text>
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#be185d',
    fontFamily: FONTS.displayFallback,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#db2777',
    fontFamily: FONTS.displayFallback,
  },
  noteCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fce7f3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  noteCountEmoji: {
    fontSize: 16,
  },
  noteCountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#be185d',
    fontFamily: FONTS.displayFallback,
  },
  wordContainer: {
    marginBottom: 12,
  },
  wordBadge: {
    backgroundColor: '#fce7f3',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  wordText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7c3aed',
    textAlign: 'center',
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 4,
    gap: 6,
  },
  key: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  keyText: {
    fontWeight: 'bold',
    color: 'white',
    zIndex: 10,
  },
  ripple: {
    position: 'absolute',
    inset: 0,
    borderRadius: 12,
  },
  lastKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 16,
  },
  lastKeyWrapper: {
    position: 'relative',
  },
  lastKeyGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 16,
    opacity: 0.5,
    top: -8,
    left: -8,
  },
  lastKeyBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lastKeyText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  lastKeySparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
    fontSize: 20,
  },
  hintContainer: {
    gap: 4,
  },
  hintEmoji: {
    fontSize: 20,
  },
  hintText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#db2777',
    fontFamily: FONTS.displayFallback,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintEmojiSmall: {
    fontSize: 14,
  },
  hintSubtext: {
    fontSize: 13,
    color: '#ec4899',
    fontFamily: FONTS.displayFallback,
  },
});
