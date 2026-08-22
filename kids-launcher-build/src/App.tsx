import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { MenuScreen, AppMode, Language } from './components/MenuScreen';
import { SayMode } from './components/SayMode';
import { CorrectMode } from './components/CorrectMode';
import { WriteMode } from './components/WriteMode';
import { MelodyMode } from './components/MelodyMode';
import { COLORS } from './theme';

export default function App() {
  const [mode, setMode] = useState<AppMode>('menu');
  const [language, setLanguage] = useState<Language>('en');

  const handleModeSelect = (selectedMode: AppMode) => {
    setMode(selectedMode);
  };

  const handleBackToMenu = () => {
    setMode('menu');
  };

  const getBgColor = () => {
    switch (mode) {
      case 'menu':
      case 'say':
        return COLORS.menuBg;
      case 'correct':
        return COLORS.correctBg;
      case 'write':
        return COLORS.writeBg;
      case 'melody':
        return COLORS.melodyBg;
      default:
        return COLORS.background;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getBgColor() }]}>
      <StatusBar hidden />

      {/* Header with back button */}
      {mode !== 'menu' && (
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToMenu} style={styles.backButton}>
            <Text style={styles.backEmoji}>🏠</Text>
            <Text style={styles.backText}>Menu</Text>
          </TouchableOpacity>

          <View style={styles.langIndicator}>
            <Text style={styles.langEmoji}>🌍</Text>
            <Text style={styles.langText}>
              {language === 'en' ? '🇺🇸' : language === 'ar' ? '🇸🇦' : '🇲🇻'}
            </Text>
          </View>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {mode === 'menu' && (
          <MenuScreen
            language={language}
            onLanguageChange={setLanguage}
            onModeSelect={handleModeSelect}
          />
        )}
        {mode === 'say' && <SayMode isActive={mode === 'say'} language={language} />}
        {mode === 'correct' && (
          <CorrectMode isActive={mode === 'correct'} language={language} />
        )}
        {mode === 'write' && <WriteMode isActive={mode === 'write'} language={language} />}
        {mode === 'melody' && <MelodyMode isActive={mode === 'melody'} language={language} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  backEmoji: {
    fontSize: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    fontFamily: COLORS.fonts.comic,
  },
  langIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  langEmoji: {
    fontSize: 16,
  },
  langText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
});
