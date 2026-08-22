import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS, BORDERS } from '../theme';

type PinMode = 'setup' | 'verify' | 'change';

interface PinPadProps {
  mode: PinMode;
  onComplete: (pin: string) => void;
  onCancel?: () => void;
  errorMessage?: string;
}

const PIN_LENGTH = 4;

export function PinPad({ mode, onComplete, onCancel, errorMessage }: PinPadProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const isSetup = mode === 'setup';
  const isChange = mode === 'change';
  const isConfirmStage = isSetup && stage === 'confirm';
  const isChangeConfirm = isChange && stage === 'confirm';

  useEffect(() => {
    setPin('');
    setConfirmPin('');
    setStage('enter');
    setError('');
  }, [mode]);

  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
      setPin('');
      setConfirmPin('');
      triggerShake();
    }
  }, [errorMessage]);

  const triggerShake = () => {
    Vibration.vibrate(200);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleDigit = (digit: string) => {
    const target = isConfirmStage || isChangeConfirm ? confirmPin : pin;
    if (target.length >= PIN_LENGTH) return;

    if (isConfirmStage || isChangeConfirm) {
      setConfirmPin((prev) => {
        const next = prev + digit;
        if (next.length === PIN_LENGTH) {
          // Check match
          if (next === pin) {
            onComplete(next);
          } else {
            setError(isChange ? 'PINs do not match. Try again.' : 'PINs do not match. Set again.');
            triggerShake();
            setConfirmPin('');
            if (!isChange) {
              setPin('');
              setStage('enter');
            }
          }
        }
        return next;
      });
    } else {
      setPin((prev) => {
        const next = prev + digit;
        if (next.length === PIN_LENGTH) {
          if (isSetup || (isChange && stage === 'enter')) {
            setStage('confirm');
          } else {
            onComplete(next);
          }
        }
        return next;
      });
    }
    setError('');
  };

  const handleBackspace = () => {
    if (isConfirmStage || isChangeConfirm) {
      setConfirmPin((prev) => prev.slice(0, -1));
    } else {
      setPin((prev) => prev.slice(0, -1));
    }
    setError('');
  };

  const handleCancel = () => {
    if (isSetup && stage === 'confirm') {
      setPin('');
      setConfirmPin('');
      setStage('enter');
      setError('');
    } else {
      onCancel?.();
    }
  };

  const getTitle = () => {
    if (isSetup) {
      return stage === 'enter' ? 'Set Parent PIN' : 'Confirm PIN';
    }
    if (isChange) {
      if (stage === 'enter') return 'Enter Current PIN';
      return 'Set New PIN';
    }
    return 'Enter PIN';
  };

  const getSubtitle = () => {
    if (isSetup) {
      return stage === 'enter'
        ? 'Create a 4-digit PIN for parent access'
        : 'Enter the same PIN again to confirm';
    }
    if (isChange) {
      if (stage === 'enter') return 'Enter your current parent PIN';
      return 'Create a new 4-digit PIN';
    }
    return 'Parents enter PIN to continue';
  };

  const activePin = isConfirmStage || isChangeConfirm ? confirmPin : pin;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
      </View>

      {/* PIN Dots */}
      <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < activePin.length && styles.dotFilled,
            ]}
          />
        ))}
      </Animated.View>

      {error ? <Text style={styles.errorText}>{error}</Text> : <View style={styles.errorSpacer} />}

      {/* Numpad */}
      <View style={styles.numpad}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, rowIdx) => (
          <View key={rowIdx} style={styles.numpadRow}>
            {row.map((digit) => (
              <TouchableOpacity
                key={digit}
                onPress={() => handleDigit(digit)}
                activeOpacity={0.8}
                style={styles.digitButton}
              >
                <Text style={styles.digitText}>{digit}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={styles.numpadRow}>
          <TouchableOpacity onPress={handleCancel} activeOpacity={0.8} style={styles.actionButton}>
            <Text style={styles.actionText}>{isSetup || isChangeConfirm ? 'Back' : 'Cancel'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleDigit('0')} activeOpacity={0.8} style={styles.digitButton}>
            <Text style={styles.digitText}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBackspace} activeOpacity={0.8} style={styles.actionButton}>
            <Text style={styles.actionText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SIZES.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.displayFallback,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    fontFamily: FONTS.bodyFallback,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondaryDark,
  },
  errorText: {
    fontSize: SIZES.body,
    color: COLORS.danger,
    fontFamily: FONTS.bodyFallback,
    marginBottom: SIZES.lg,
    textAlign: 'center',
  },
  errorSpacer: {
    height: SIZES.body + SIZES.lg,
  },
  numpad: {
    gap: SIZES.md,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: SIZES.md,
    justifyContent: 'center',
  },
  digitButton: {
    width: 80,
    height: 80,
    borderRadius: BORDERS.radius.lg,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondaryLight,
    ...SHADOWS.small,
  },
  digitText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.displayFallback,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: BORDERS.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  actionText: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.textLight,
    fontFamily: FONTS.uiFallback,
  },
});
