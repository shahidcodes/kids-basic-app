import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { getCharSet, getColorForKey, COLORS } from '../theme';

interface VirtualKeyboardProps {
  language: 'en' | 'ar' | 'dv';
  onKeyPress: (key: string) => void;
  targetKey?: string;
  highlightKey?: string | null;
  disabled?: boolean;
  activeKeys?: Set<string>;
}

const { width } = Dimensions.get('window');

export function VirtualKeyboard({
  language,
  onKeyPress,
  targetKey,
  highlightKey,
  disabled = false,
  activeKeys,
}: VirtualKeyboardProps) {
  const charSet = useMemo(() => getCharSet(language), [language]);
  const chars = charSet.split('');

  const charsPerRow = language === 'en' ? 10 : 8;
  const rows: string[][] = [];
  for (let i = 0; i < chars.length; i += charsPerRow) {
    rows.push(chars.slice(i, i + charsPerRow));
  }

  const buttonSize = Math.min((width - 40) / charsPerRow - 6, 64);

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((char) => {
            const isTarget = targetKey === char;
            const isHighlighted = highlightKey === char;
            const isActive = activeKeys?.has(char);
            const baseColor = getColorForKey(char);

            return (
              <TouchableOpacity
                key={char}
                onPress={() => onKeyPress(char)}
                disabled={disabled}
                activeOpacity={0.6}
                style={[
                  styles.key,
                  {
                    width: buttonSize,
                    height: buttonSize,
                    backgroundColor: isHighlighted
                      ? '#22c55e'
                      : isTarget
                      ? '#fbbf24'
                      : baseColor,
                    borderWidth: isTarget ? 3 : 2,
                    borderColor: isTarget ? '#f59e0b' : 'white',
                    opacity: disabled ? 0.5 : 1,
                    transform: [{ scale: isActive ? 0.92 : 1 }],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.keyText,
                    {
                      fontSize: buttonSize * 0.45,
                      color: isHighlighted ? 'white' : 'white',
                      fontFamily:
                        language === 'ar' || language === 'dv'
                          ? COLORS.fonts.arabic
                          : COLORS.fonts.comic,
                    },
                  ]}
                >
                  {char}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  keyText: {
    fontWeight: 'bold',
  },
});
