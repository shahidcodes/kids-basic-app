import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { getCharSet, getColorForKey, COLORS, FONTS, SIZES, SHADOWS, BORDERS } from '../theme';

interface VirtualKeyboardProps {
  language: 'en' | 'ar' | 'dv';
  onKeyPress: (key: string) => void;
  targetKey?: string;
  highlightKey?: string | null;
  disabled?: boolean;
  activeKeys?: Set<string>;
  showWordAssociations?: boolean;
}

const { width } = Dimensions.get('window');

interface KeyButtonProps {
  char: string;
  language: 'en' | 'ar' | 'dv';
  isTarget: boolean;
  isHighlighted: boolean;
  isActive: boolean;
  disabled: boolean;
  buttonSize: number;
  onPress: (key: string) => void;
  index: number;
}

function KeyButton({
  char,
  language,
  isTarget,
  isHighlighted,
  isActive,
  disabled,
  buttonSize,
  onPress,
  index,
}: KeyButtonProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const elevationAnim = React.useRef(new Animated.Value(5)).current;
  const [isPressed, setIsPressed] = useState(false);

  const baseColor = getColorForKey(char);

  // Entrance animation
  React.useEffect(() => {
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      delay: index * 20,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const handlePressIn = useCallback(() => {
    setIsPressed(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.88,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.timing(elevationAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(elevationAnim, {
        toValue: 5,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePress = useCallback(() => {
    if (Platform.OS === 'android') {
      Vibration.vibrate(10); // Light haptic feedback
    }
    onPress(char);
  }, [char, onPress]);

  // Determine colors based on state
  const bgColor = isHighlighted
    ? COLORS.success
    : isTarget
    ? COLORS.accentYellow
    : baseColor;

  const borderColor = isHighlighted
    ? COLORS.success
    : isTarget
    ? COLORS.warning
    : baseColor;

  const textColor = 'white';

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        margin: 3,
      }}
    >
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.7}
        style={[
          styles.key,
          {
            width: buttonSize,
            height: buttonSize,
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderWidth: isTarget ? 3 : 0,
            opacity: disabled ? 0.4 : 1,
          },
          isPressed && styles.keyPressed,
        ]}
        accessibilityLabel={`Key ${char}`}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.keyText,
            {
              fontSize: buttonSize * 0.45,
              color: textColor,
              fontFamily:
                language === 'ar' || language === 'dv'
                  ? FONTS.arabicFallback
                  : FONTS.displayFallback,
            },
          ]}
        >
          {char}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function KeyboardSection({
  chars,
  language,
  onKeyPress,
  targetKey,
  highlightKey,
  disabled,
  activeKeys,
  buttonSize,
  charsPerRow,
  startIndex,
}: {
  chars: string[];
  language: 'en' | 'ar' | 'dv';
  onKeyPress: (key: string) => void;
  targetKey?: string;
  highlightKey?: string | null;
  disabled: boolean;
  activeKeys?: Set<string>;
  buttonSize: number;
  charsPerRow: number;
  startIndex: number;
}) {
  const rows: string[][] = [];
  for (let i = 0; i < chars.length; i += charsPerRow) {
    rows.push(chars.slice(i, i + charsPerRow));
  }

  return (
    <View style={styles.section}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((char, charIndex) => {
            const globalIndex = startIndex + rowIndex * charsPerRow + charIndex;
            return (
              <KeyButton
                key={char}
                char={char}
                language={language}
                isTarget={targetKey === char}
                isHighlighted={highlightKey === char}
                isActive={activeKeys?.has(char) || false}
                disabled={disabled}
                buttonSize={buttonSize}
                onPress={onKeyPress}
                index={globalIndex}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function VirtualKeyboard({
  language,
  onKeyPress,
  targetKey,
  highlightKey,
  disabled = false,
  activeKeys,
}: VirtualKeyboardProps) {
  const charSet = useMemo(() => getCharSet(language), [language]);

  // Split into letters and numbers
  const letters = charSet.replace(/[0-9]/g, '').split('');
  const numbers = charSet.match(/[0-9]/g) || ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // Calculate layout for two-column design
  const isTablet = width > 600;
  const gap = 6;
  const sectionGap = 24;

  // Letters section: more chars per row since we have more letters
  const letterCharsPerRow = language === 'en' ? 7 : 6;
  // Numbers section: 3 rows (4 keys each) = 10 numbers
  const numberCharsPerRow = 4;

  // Calculate button size based on available width
  const horizontalPadding = isTablet ? 40 : 16;
  const availableWidth = width - horizontalPadding * 2 - sectionGap;

  // Letters take ~70% of width, numbers ~30%
  const lettersWidth = availableWidth * 0.7;
  const numbersWidth = availableWidth * 0.3;

  const letterButtonSize = Math.min(
    (lettersWidth - gap * (letterCharsPerRow - 1)) / letterCharsPerRow,
    isTablet ? 72 : 54
  );
  const numberButtonSize = Math.min(
    (numbersWidth - gap * (numberCharsPerRow - 1)) / numberCharsPerRow,
    isTablet ? 72 : 54,
    letterButtonSize // Keep them the same size for consistency
  );

  // Use the smaller of the two for consistency
  const buttonSize = Math.min(letterButtonSize, numberButtonSize);

  return (
    <View style={styles.splitContainer}>
      {/* Left side: Letters */}
      <KeyboardSection
        chars={letters}
        language={language}
        onKeyPress={onKeyPress}
        targetKey={targetKey}
        highlightKey={highlightKey}
        disabled={disabled}
        activeKeys={activeKeys}
        buttonSize={buttonSize}
        charsPerRow={letterCharsPerRow}
        startIndex={0}
      />

      {/* Right side: Numbers */}
      <KeyboardSection
        chars={numbers}
        language={language}
        onKeyPress={onKeyPress}
        targetKey={targetKey}
        highlightKey={highlightKey}
        disabled={disabled}
        activeKeys={activeKeys}
        buttonSize={buttonSize}
        charsPerRow={numberCharsPerRow}
        startIndex={letters.length}
      />
    </View>
  );
}

// Compact keyboard variant for smaller screens
export function CompactKeyboard(props: VirtualKeyboardProps) {
  return (
    <View style={styles.compactContainer}>
      <VirtualKeyboard {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.sm,
    alignItems: 'center',
  },
  splitContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: SIZES.md,
    gap: SIZES.lg,
  },
  section: {
    alignItems: 'center',
  },
  compactContainer: {
    transform: [{ scale: 0.9 }],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 3,
  },
  key: {
    borderRadius: BORDERS.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    // Remove shadow bleeding by using minimal elevation
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  keyPressed: {
    shadowOpacity: 0.04,
    elevation: 1,
  },
  keyText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default VirtualKeyboard;
