import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { getColorForKey, COLORS } from '../theme';

interface CorrectModeProps {
  isActive: boolean;
  language: 'en' | 'ar' | 'dv';
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
const INACTIVITY_TIMEOUT = 5000;
const SIZE_INCREASE_INTERVAL = 3000;
const MAX_SIZE_MULTIPLIER = 1.5;

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
  size: number;
}

const { width, height } = Dimensions.get('window');

export function CorrectMode({ isActive, language }: CorrectModeProps) {
  const [targetKey, setTargetKey] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showStreak, setShowStreak] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [letterScale, setLetterScale] = useState(1);
  const [showReminder, setShowReminder] = useState(false);
  const [lastPressedKey, setLastPressedKey] = useState('');

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sizeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { speakLetter, speak, celebrate, speakHint, speakWrongAnswer } = useVoice();

  const animatedLetterScale = useRef(new Animated.Value(1)).current;
  const animatedLetterColor = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;

  const clearAllTimers = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (sizeTimerRef.current) clearTimeout(sizeTimerRef.current);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearAllTimers();
    setLetterScale(1);
    setShowReminder(false);

    inactivityTimerRef.current = setTimeout(() => {
      setShowReminder(true);
      speakHint(`Press the letter ${targetKey}`);
    }, INACTIVITY_TIMEOUT);

    let currentScale = 1;
    const increaseSize = () => {
      if (currentScale < MAX_SIZE_MULTIPLIER) {
        currentScale += 0.1;
        setLetterScale(currentScale);
        animatedLetterScale.setValue(currentScale);
        sizeTimerRef.current = setTimeout(increaseSize, SIZE_INCREASE_INTERVAL);
      }
    };
    sizeTimerRef.current = setTimeout(increaseSize, SIZE_INCREASE_INTERVAL);
  }, [targetKey, speakHint, clearAllTimers, animatedLetterScale]);

  const createParticles = useCallback(() => {
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f472b6', '#10b981'];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.8,
        size: 6 + Math.random() * 14,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 3000);
  }, []);

  const triggerCelebration = useCallback(() => {
    celebrationScale.setValue(0);
    celebrationOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(celebrationScale, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
      }),
      Animated.timing(celebrationOpacity, {
        toValue: 0,
        duration: 2500,
        delay: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowCelebration(false);
    });
  }, [celebrationScale, celebrationOpacity]);

  const pickNewTarget = useCallback(() => {
    const random = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    setTargetKey(random);
    setFeedback(null);
    setShowHint(false);
    setShowCelebration(false);
    setLetterScale(1);
    animatedLetterScale.setValue(1);
    setShowReminder(false);
    clearAllTimers();

    setTimeout(() => {
      speakHint(`Find the letter ${random}`);
      resetInactivityTimer();
    }, 500);
  }, [speakHint, resetInactivityTimer, clearAllTimers, animatedLetterScale]);

  useEffect(() => {
    if (isActive && !targetKey) {
      pickNewTarget();
    }
    return () => {
      clearAllTimers();
    };
  }, [isActive, targetKey, pickNewTarget, clearAllTimers]);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!targetKey) return;

      resetInactivityTimer();
      setLastPressedKey(key);

      if (key === targetKey) {
        // Correct!
        setFeedback('correct');
        setScore((s) => s + 10);
        setStreak((s) => {
          const newStreak = s + 1;
          if (newStreak >= 5) {
            setShowStreak(true);
            setTimeout(() => setShowStreak(false), 2500);
          }
          return newStreak;
        });
        createParticles();
        setShowCelebration(true);
        triggerCelebration();
        speakLetter(key, 'say');
        setTimeout(() => celebrate(language), 400);

        clearAllTimers();

        setTimeout(() => {
          pickNewTarget();
        }, 2500);
      } else {
        // Wrong!
        setFeedback('wrong');
        setStreak(0);
        speakWrongAnswer(key, targetKey, language);

        Animated.sequence([
          Animated.timing(animatedLetterColor, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(animatedLetterColor, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
        ]).start();

        setTimeout(() => {
          setFeedback(null);
        }, 1500);
      }
    },
    [
      targetKey,
      pickNewTarget,
      speakLetter,
      speakWrongAnswer,
      celebrate,
      createParticles,
      triggerCelebration,
      resetInactivityTimer,
      clearAllTimers,
      animatedLetterColor,
      language,
    ]
  );

  const handleShowHint = () => {
    if (!targetKey) return;
    setShowHint(true);
    speakLetter(targetKey, 'say');
    resetInactivityTimer();
    setTimeout(() => setShowHint(false), 2000);
  };

  if (!isActive) return null;

  const animatedColor = animatedLetterColor.interpolate({
    inputRange: [0, 1],
    outputRange: [getColorForKey(targetKey || 'A'), '#ef4444'],
  });

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
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            },
          ]}
        />
      ))}

      {/* Streak Celebration */}
      {showStreak && (
        <View style={styles.streakOverlay} pointerEvents="none">
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>✨</Text>
            <Text style={styles.streakText}>{streak} Streak!</Text>
            <Text style={styles.streakEmoji}>✨</Text>
          </View>
        </View>
      )}

      {/* Success Celebration */}
      {showCelebration && (
        <View style={styles.celebrationOverlay} pointerEvents="none">
          <Animated.View
            style={[
              styles.celebrationContent,
              {
                transform: [{ scale: celebrationScale }],
                opacity: celebrationOpacity,
              },
            ]}
          >
            <View style={styles.celebrationIconContainer}>
              <Text style={styles.celebrationEmoji}>✅</Text>
            </View>
            <Text style={styles.celebrationStars}>⭐ ✨ ⭐</Text>
            <Text style={styles.celebrationText}>
              {language === 'ar' ? 'أحسنت!' : language === 'dv' ? 'ރަނގާރީ!' : 'Amazing!'}
            </Text>
          </Animated.View>
        </View>
      )}

      {/* Reminder */}
      {showReminder && !feedback && (
        <View style={styles.reminderContainer}>
          <Text style={styles.reminderEmoji}>🔊</Text>
          <Text style={styles.reminderText}>Press {targetKey}!</Text>
        </View>
      )}

      {/* Score Header */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreEmoji}>🏆</Text>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
        <View
          style={[
            styles.streakBadgeSmall,
            streak >= 5 && { backgroundColor: '#fde047', transform: [{ scale: 1.1 }] },
          ]}
        >
          <Text style={[styles.streakSmallEmoji, streak >= 5 && { fontSize: 22 }]}>⭐</Text>
          <Text style={[styles.streakSmallText, streak >= 5 && { color: '#854d0e' }]}>{streak}</Text>
        </View>
      </View>

      {/* Main Game Area */}
      <View style={styles.gameArea}>
        <Text style={styles.promptText}>Press this key:</Text>

        <Animated.Text
          style={[
            styles.targetLetter,
            {
              color: feedback === 'correct' ? '#22c55e' : feedback === 'wrong' ? '#ef4444' : animatedColor,
              fontFamily: language === 'ar' || language === 'dv' ? COLORS.fonts.arabic : COLORS.fonts.comic,
              transform: [{ scale: animatedLetterScale }],
              textShadowColor: showHint ? 'rgba(245, 158, 11, 0.8)' : 'transparent',
              textShadowRadius: showHint ? 30 : 0,
              textShadowOffset: { width: 0, height: 0 },
            },
          ]}
        >
          {targetKey || '?'}
        </Animated.Text>

        {/* Wrong feedback overlay */}
        {feedback === 'wrong' && (
          <View style={styles.wrongOverlay} pointerEvents="none">
            <Text style={styles.wrongEmoji}>❌</Text>
          </View>
        )}

        {/* Hint button */}
        <TouchableOpacity
          onPress={handleShowHint}
          style={styles.hintButton}
          disabled={!targetKey || !!feedback}
        >
          <Text style={styles.hintEmoji}>🔊</Text>
          <Text style={styles.hintText}>
            {language === 'ar' ? 'استمع' : language === 'dv' ? 'އަޑުއިވާ' : 'Hear Hint'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Virtual Keyboard */}
      <View style={styles.keyboardContainer}>
        <VirtualKeyboard
          language={language}
          onKeyPress={handleKeyPress}
          targetKey={targetKey}
          disabled={!!feedback}
        />
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
    borderRadius: 50,
    zIndex: 50,
    opacity: 0.8,
  },
  streakOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 40,
  },
  streakBadge: {
    backgroundColor: '#fde047',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  streakEmoji: {
    fontSize: 36,
  },
  streakText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#854d0e',
    fontFamily: COLORS.fonts.comic,
  },
  celebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  celebrationContent: {
    alignItems: 'center',
  },
  celebrationIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  celebrationEmoji: {
    fontSize: 64,
  },
  celebrationStars: {
    fontSize: 32,
    marginTop: 12,
  },
  celebrationText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#16a34a',
    marginTop: 12,
    fontFamily: COLORS.fonts.comic,
  },
  reminderContainer: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    backgroundColor: '#fef3c7',
    borderWidth: 3,
    borderColor: '#fbbf24',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 30,
  },
  reminderEmoji: {
    fontSize: 24,
  },
  reminderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#b45309',
    fontFamily: COLORS.fonts.comic,
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  scoreEmoji: {
    fontSize: 20,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#15803d',
    fontFamily: COLORS.fonts.comic,
  },
  streakBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9c3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  streakSmallEmoji: {
    fontSize: 18,
  },
  streakSmallText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a16207',
    fontFamily: COLORS.fonts.comic,
  },
  gameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  promptText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 12,
    fontFamily: COLORS.fonts.comic,
  },
  targetLetter: {
    fontSize: 120,
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
  },
  wrongOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  wrongEmoji: {
    fontSize: 80,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginTop: 24,
  },
  hintEmoji: {
    fontSize: 20,
  },
  hintText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    fontFamily: COLORS.fonts.comic,
  },
  keyboardContainer: {
    width: '100%',
    paddingBottom: 20,
  },
});
