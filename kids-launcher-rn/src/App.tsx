import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Alert,
  NativeModules,
  Platform,
  Animated,
  Dimensions,
  useWindowDimensions,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SayMode } from './components/SayMode';
import { CorrectMode } from './components/CorrectMode';
import { WriteMode } from './components/WriteMode';
import { MelodyMode } from './components/MelodyMode';
import { PinPad } from './components/PinPad';
import { ParentModePanel } from './components/ParentModePanel';
import { SetLauncherPrompt } from './components/SetLauncherPrompt';
import { COLORS, FONTS, SIZES, SHADOWS, BORDERS, ANIMATIONS } from './theme';
import { loadSettings, saveSettings, GameSettings, DEFAULT_SETTINGS, loadPin, hasPin, savePin } from './utils/storage';

type AppMode = 'menu' | 'say' | 'correct' | 'write' | 'melody' | 'pinSetup' | 'pinVerify' | 'launcherPrompt';

const LANGUAGES = [
  { id: 'en' as const, name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { id: 'ar' as const, name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { id: 'dv' as const, name: 'Dhivehi', nativeName: 'ދިވެހި', flag: '🇲🇻' },
];

const MODES = [
  {
    id: 'say' as AppMode,
    name: { en: 'Say Mode', ar: 'وضع النطق', dv: 'ބައްކަލުނުދާ މޯޑު' },
    description: { en: 'Press any key and hear it!', ar: 'اضغط أي مفتاح واسمع!', dv: 'ކޮންމެ ކީއެއް ފިއްތާ އަޑުއަހާ!' },
    icon: '🔊',
    colors: COLORS.cardSay,
  },
  {
    id: 'correct' as AppMode,
    name: { en: 'Find the Letter', ar: 'جد الحرف', dv: 'އަކުރު ހޯދާ' },
    description: { en: 'Find the letter shown!', ar: 'جد الحرف المعروض!', dv: 'ފެންނަ އަކުރު ހޯދާ!' },
    icon: '✅',
    colors: COLORS.cardCorrect,
  },
  {
    id: 'write' as AppMode,
    name: { en: 'Write Mode', ar: 'وضع الكتابة', dv: 'ލިޔުން މޯޑު' },
    description: { en: 'Draw letters with your finger!', ar: 'ارسم الحروف بإصبعك!', dv: 'އުނގުލުން އަކުރު ލިޔާ!' },
    icon: '✏️',
    colors: COLORS.cardWrite,
  },
  {
    id: 'melody' as AppMode,
    name: { en: 'Melody Mode', ar: 'وضع اللحن', dv: 'މެލޮޑީ މޯޑު' },
    description: { en: 'Make music with keys!', ar: 'اصنع موسيقى بالمفاتيح!', dv: 'ކީތަކުން މިއުޒިކް ހަދާ!' },
    icon: '🎵',
    colors: COLORS.cardMelody,
  },
];

// Animated Mode Card Component
function ModeCard({
  mode,
  language,
  onPress,
  index,
}: {
  mode: typeof MODES[0];
  language: 'en' | 'ar' | 'dv';
  onPress: () => void;
  index: number;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const isTablet = width > 600;

  // Entrance animation
  useEffect(() => {
    translateY.setValue(50);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        { transform: [{ scale: scaleAnim }, { translateY }] },
        isTablet && styles.cardWrapperTablet,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[
          styles.modeCard,
          {
            backgroundColor: mode.colors.bg,
            borderColor: mode.colors.border,
          },
        ]}
      >
        {/* Icon Container */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: mode.colors.accent },
          ]}
        >
          <Text style={styles.icon}>{mode.icon}</Text>
        </View>

        {/* Text Content */}
        <View style={styles.cardContent}>
          <Text style={styles.modeName}>{mode.name[language]}</Text>
          <Text style={styles.modeDesc}>{mode.description[language]}</Text>
        </View>

        {/* Play indicator */}
        <View style={[styles.playIndicator, { backgroundColor: mode.colors.accent }]}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Compact Language Pill
function LanguageButton({
  lang,
  isActive,
  onPress,
}: {
  lang: typeof LANGUAGES[0];
  isActive: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 5,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={[
          styles.langPill,
          isActive && styles.langPillActive,
        ]}
      >
        <Text style={styles.langPillFlag}>{lang.flag}</Text>
        {isActive && (
          <Text style={styles.langPillName}>{lang.nativeName}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Loading Screen Component
function LoadingScreen() {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
        <Animated.Text style={[styles.loadingEmoji, { transform: [{ rotate }] }]}>
          ⭐
        </Animated.Text>
      </Animated.View>
      <Text style={styles.loadingText}>Kids Learn</Text>
      <View style={styles.loadingDots}>
        <Animated.View style={[styles.dot, { opacity: bounceAnim.interpolate({
          inputRange: [-20, 0],
          outputRange: [1, 0.3],
        }) }]} />
        <Animated.View style={[styles.dot, { opacity: bounceAnim.interpolate({
          inputRange: [-20, 0],
          outputRange: [0.3, 1],
        }) }]} />
        <Animated.View style={[styles.dot, { opacity: bounceAnim.interpolate({
          inputRange: [-20, 0],
          outputRange: [0.6, 0.3],
        }) }]} />
      </View>
    </View>
  );
}

// Main App Component
export default function App() {
  const [mode, setMode] = useState<AppMode>('launcherPrompt');
  const [language, setLanguage] = useState<'en' | 'ar' | 'dv'>('en');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDefaultLauncher, setIsDefaultLauncher] = useState(false);
  const [parentPanelVisible, setParentPanelVisible] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const backPressCountRef = useRef(0);
  const backPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width } = useWindowDimensions();
  const isTablet = width > 600;

  // Check launcher status and load settings
  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const [s, defaultLauncher] = await Promise.all([
          loadSettings(),
          NativeModules.KidsLauncher?.isDefaultLauncher?.().catch(() => false),
        ]);
        if (!mounted) return;
        setSettings(s);
        setLanguage(s.language);
        setIsDefaultLauncher(!!defaultLauncher);

        if (!defaultLauncher) {
          setMode('launcherPrompt');
        } else {
          const pinExists = await hasPin();
          setMode(pinExists ? 'pinVerify' : 'pinSetup');
        }
      } catch {
        if (!mounted) return;
        setMode('pinSetup');
      } finally {
        if (mounted) setIsLoaded(true);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  // Re-check launcher status when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        NativeModules.KidsLauncher?.isDefaultLauncher?.()
          .then((isDefault: boolean) => {
            setIsDefaultLauncher(!!isDefault);
            if (!isDefault && mode !== 'launcherPrompt') {
              setMode('launcherPrompt');
            }
          })
          .catch(() => {});
      }
    });
    return () => subscription.remove();
  }, [mode]);

  // Save settings when they change
  useEffect(() => {
    if (!isLoaded) return;
    const updated: GameSettings = {
      ...settings,
      language,
    };
    saveSettings(updated).catch(() => {});
  }, [language, settings, isLoaded]);

  // Handle back button
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (mode === 'pinSetup' || mode === 'pinVerify' || mode === 'launcherPrompt') {
        return true; // Block back on auth screens
      }
      if (mode === 'menu') {
        backPressCountRef.current += 1;
        if (backPressCountRef.current >= 3) {
          // Even 3 presses require PIN verification now
          backPressCountRef.current = 0;
          setMode('pinVerify');
          return true;
        }
        if (backPressTimerRef.current) clearTimeout(backPressTimerRef.current);
        backPressTimerRef.current = setTimeout(() => {
          backPressCountRef.current = 0;
        }, 2000);
        return true;
      }
      setMode('menu');
      return true;
    });

    return () => {
      subscription.remove();
      if (backPressTimerRef.current) clearTimeout(backPressTimerRef.current);
    };
  }, [mode]);

  const handleModeSelect = useCallback((selectedMode: AppMode) => {
    if (selectedMode === 'menu' || selectedMode === 'say' || selectedMode === 'correct' || selectedMode === 'write' || selectedMode === 'melody') {
      setMode(selectedMode);
    }
  }, []);

  const handleBackToMenu = useCallback(() => {
    setMode('menu');
  }, []);

  const handlePinSetupComplete = async (pin: string) => {
    await savePin(pin);
    setMode('menu');
    if (isChangingPin) {
      setIsChangingPin(false);
      setParentPanelVisible(true);
    }
  };

  const handlePinVerifyComplete = async (pin: string) => {
    const storedPin = await loadPin();
    if (pin === storedPin) {
      setPinError('');
      setPinVerified(true);
      setMode('menu');
    } else {
      setPinError('Wrong PIN. Try again.');
    }
  };

  const handleLauncherSetContinue = () => {
    // Parent can continue without setting launcher (e.g., for testing)
    // But we still require PIN
    hasPin().then((exists) => {
      setMode(exists ? 'pinVerify' : 'pinSetup');
    });
  };

  const handleParentTriggerPressIn = () => {
    longPressTimerRef.current = setTimeout(() => {
      setMode('pinVerify');
      // After verify succeeds, parentPanelVisible will open via pinVerified effect
    }, 3000);
  };

  const handleParentTriggerPressOut = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (pinVerified && mode === 'menu') {
      setParentPanelVisible(true);
      setPinVerified(false);
    }
  }, [pinVerified, mode]);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  // Launcher Prompt Screen
  if (mode === 'launcherPrompt') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <SetLauncherPrompt onContinueAnyway={handleLauncherSetContinue} />
      </SafeAreaView>
    );
  }

  // PIN Setup Screen
  if (mode === 'pinSetup') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <PinPad mode="setup" onComplete={handlePinSetupComplete} />
      </SafeAreaView>
    );
  }

  // PIN Verify Screen
  if (mode === 'pinVerify') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <PinPad
          mode="verify"
          onComplete={handlePinVerifyComplete}
          onCancel={() => {
            if (isDefaultLauncher) {
              // Only allow cancel if already set as launcher; go back to menu
              setPinError('');
              setMode('menu');
            }
          }}
          errorMessage={pinError || undefined}
        />
      </SafeAreaView>
    );
  }

  // Game mode screens
  if (mode === 'say') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.sayBg }]}>
        <StatusBar barStyle="dark-content" />
        <SayMode isActive={true} language={language} onBack={handleBackToMenu} />
      </SafeAreaView>
    );
  }

  if (mode === 'correct') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.correctBg }]}>
        <StatusBar barStyle="dark-content" />
        <GameHeader onBack={handleBackToMenu} title="Find the Letter" />
        <CorrectMode isActive={true} language={language} />
      </SafeAreaView>
    );
  }

  if (mode === 'write') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.writeBg }]}>
        <StatusBar barStyle="dark-content" />
        <GameHeader onBack={handleBackToMenu} title="Write Mode" />
        <WriteMode isActive={true} language={language} />
      </SafeAreaView>
    );
  }

  if (mode === 'melody') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.melodyBg }]}>
        <StatusBar barStyle="dark-content" />
        <GameHeader onBack={handleBackToMenu} title="Melody Mode" />
        <MelodyMode isActive={true} language={language} />
      </SafeAreaView>
    );
  }

  // Menu Screen
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[
          styles.menuContainer,
          isTablet && styles.menuContainerTablet,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleEmoji}>🌟</Text>
            <Text style={styles.title}>Kids Learn</Text>
            <Text style={styles.titleEmoji}>🌟</Text>
          </View>
          <Text style={styles.subtitle}>Fun way to learn letters & numbers!</Text>
        </View>

        {/* Compact Language Selector */}
        <View style={styles.langBar}>
          {LANGUAGES.map((lang) => (
            <LanguageButton
              key={lang.id}
              lang={lang}
              isActive={language === lang.id}
              onPress={() => setLanguage(lang.id)}
            />
          ))}
        </View>

        {/* Mode Cards */}
        <View style={[styles.cardsContainer, isTablet && styles.cardsContainerTablet]}>
          {MODES.map((m, index) => (
            <ModeCard
              key={m.id}
              mode={m}
              language={language}
              onPress={() => handleModeSelect(m.id)}
              index={index}
            />
          ))}
        </View>

        {/* Parent Mode Trigger (hidden, long-press) */}
        {Platform.OS === 'android' && (
          <TouchableOpacity
            onPressIn={handleParentTriggerPressIn}
            onPressOut={handleParentTriggerPressOut}
            activeOpacity={1}
            style={styles.parentTrigger}
          >
            <Text style={styles.parentTriggerIcon}>⚙️</Text>
            <Text style={styles.parentTriggerHint}>Hold for parent mode</Text>
          </TouchableOpacity>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Tap a card to start learning! 🎓</Text>
      </ScrollView>

      <ParentModePanel
        visible={parentPanelVisible}
        onClose={() => setParentPanelVisible(false)}
        onChangePin={() => {
          setParentPanelVisible(false);
          setIsChangingPin(true);
          setMode('pinSetup');
        }}
      />
    </SafeAreaView>
  );
}

// Game Header Component
function GameHeader({
  onBack,
  title,
  children,
}: {
  onBack: () => void;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.gameHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonIcon}>←</Text>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      {children ? (
        <View style={styles.gameHeaderCenter}>{children}</View>
      ) : (
        <Text style={styles.gameTitle}>{title}</Text>
      )}
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Loading Screen
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: FONTS.displayFallback,
  },
  loadingDots: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
  },

  // Menu
  menuContainer: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
  menuContainerTablet: {
    paddingHorizontal: SIZES.xxl,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SIZES.md,
    fontFamily: FONTS.displayFallback,
  },
  titleEmoji: {
    fontSize: 40,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    fontFamily: FONTS.bodyFallback,
  },

  // Compact Language Bar
  langBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.lg,
    paddingVertical: SIZES.sm,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: BORDERS.radius.full,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  langPillActive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.secondary,
    ...SHADOWS.small,
  },
  langPillFlag: {
    fontSize: 24,
  },
  langPillName: {
    fontSize: SIZES.caption,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SIZES.xs,
    fontFamily: FONTS.uiFallback,
  },

  // Cards Container
  cardsContainer: {
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  cardsContainerTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  // Mode Card
  cardWrapper: {
    width: '100%',
  },
  cardWrapperTablet: {
    width: '48%',
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderRadius: BORDERS.radius.md,
    borderWidth: 2,
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDERS.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
    ...SHADOWS.small,
  },
  icon: {
    fontSize: 32,
  },
  cardContent: {
    flex: 1,
  },
  modeName: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.xs,
    fontFamily: FONTS.displayFallback,
  },
  modeDesc: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
    fontFamily: FONTS.bodyFallback,
  },
  playIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.sm,
  },
  playIcon: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },

  // Parent Mode Trigger
  parentTrigger: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
    padding: SIZES.sm,
    opacity: 0.35,
  },
  parentTriggerIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  parentTriggerHint: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontFamily: FONTS.uiFallback,
  },

  // Footer
  footer: {
    textAlign: 'center',
    fontSize: SIZES.bodySmall,
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyFallback,
  },

  // Game Header
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: BORDERS.radius.md,
    ...SHADOWS.small,
  },
  backButtonIcon: {
    fontSize: 20,
    marginRight: SIZES.xs,
    color: COLORS.text,
  },
  backButtonText: {
    fontSize: SIZES.bodySmall,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.uiFallback,
  },
  gameTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.displayFallback,
  },
  gameHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 70,
  },
});
