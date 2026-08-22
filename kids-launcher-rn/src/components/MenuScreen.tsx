import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { COLORS, FONTS } from '../theme';

export type AppMode = 'menu' | 'say' | 'correct' | 'write' | 'melody';
export type Language = 'en' | 'ar' | 'dv';

interface LanguageOption {
  id: Language;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { id: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { id: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { id: 'dv', name: 'Dhivehi', nativeName: 'ދިވެހި', flag: '🇲🇻' },
];

const MODES = [
  {
    id: 'say' as AppMode,
    name: 'Say Mode',
    description: 'Press any key and hear it spoken!',
    emoji: '🔊',
    color: '#fbbf24',
    bgColor: '#fff7ed',
  },
  {
    id: 'correct' as AppMode,
    name: 'Find the Letter',
    description: 'Find the letter shown on screen!',
    emoji: '✅',
    color: '#60a5fa',
    bgColor: '#eff6ff',
  },
  {
    id: 'write' as AppMode,
    name: 'Write Mode',
    description: 'Draw letters with your finger!',
    emoji: '✏️',
    color: '#a78bfa',
    bgColor: '#faf5ff',
  },
  {
    id: 'melody' as AppMode,
    name: 'Melody Mode',
    description: 'Make music and learn words!',
    emoji: '🎵',
    color: '#f472b6',
    bgColor: '#fdf2f8',
  },
];

interface MenuScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onModeSelect: (mode: AppMode) => void;
}

const { width, height } = Dimensions.get('window');

export function MenuScreen({ language, onLanguageChange, onModeSelect }: MenuScreenProps) {
  const selectedLang = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleEmoji}>⭐</Text>
        <Text style={styles.title}>Kids Learn</Text>
        <Text style={styles.titleEmoji}>⭐</Text>
      </View>
      <Text style={styles.subtitle}>Fun way to learn letters & numbers!</Text>

      {/* Language Selector */}
      <View style={styles.languageContainer}>
        <Text style={styles.languageLabel}>
          🌍 Choose Language / اختر اللغة / ބަސް ހޮވާލާ
        </Text>
        <View style={styles.languageRow}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              onPress={() => onLanguageChange(lang.id)}
              style={[
                styles.languageButton,
                language === lang.id && styles.languageButtonActive,
              ]}
            >
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <Text
                style={[
                  styles.languageName,
                  language === lang.id && styles.languageNameActive,
                ]}
              >
                {lang.name}
              </Text>
              <Text
                style={[
                  styles.languageNative,
                  language === lang.id && styles.languageNativeActive,
                ]}
              >
                {lang.nativeName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Mode Cards */}
      <View style={styles.modesContainer}>
        {MODES.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            onPress={() => onModeSelect(mode.id)}
            activeOpacity={0.8}
            style={[styles.modeCard, { backgroundColor: mode.bgColor, borderColor: mode.color }]}
          >
            <View style={[styles.modeIconContainer, { backgroundColor: mode.color }]}>
              <Text style={styles.modeEmoji}>{mode.emoji}</Text>
            </View>
            <Text style={styles.modeName}>{mode.name}</Text>
            <Text style={styles.modeDescription}>{mode.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Current Language Indicator */}
      <View style={styles.currentLangContainer}>
        <Text style={styles.currentLangText}>
          🌍 {selectedLang.flag} {selectedLang.nativeName}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
    minHeight: height - 100,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#d97706',
    marginHorizontal: 12,
    fontFamily: FONTS.displayFallback,
  },
  titleEmoji: {
    fontSize: 36,
  },
  subtitle: {
    fontSize: 20,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 24,
    fontFamily: FONTS.displayFallback,
  },
  languageContainer: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'white',
  },
  languageLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: FONTS.displayFallback,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  languageButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: 100,
  },
  languageButtonActive: {
    backgroundColor: '#fbbf24',
    borderColor: '#f59e0b',
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  languageFlag: {
    fontSize: 28,
    marginBottom: 4,
  },
  languageName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  languageNameActive: {
    color: 'white',
  },
  languageNative: {
    fontSize: 12,
    color: '#9ca3af',
  },
  languageNativeActive: {
    color: 'rgba(255,255,255,0.9)',
  },
  modesContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  modeCard: {
    width: width > 600 ? '45%' : '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modeIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modeEmoji: {
    fontSize: 36,
  },
  modeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
    fontFamily: FONTS.displayFallback,
  },
  modeDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontFamily: FONTS.displayFallback,
  },
  currentLangContainer: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    padding: 12,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  currentLangText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
    fontFamily: FONTS.displayFallback,
  },
});
