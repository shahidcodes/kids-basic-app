import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  NativeModules,
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS, BORDERS } from '../theme';

interface SetLauncherPromptProps {
  onContinueAnyway?: () => void;
}

export function SetLauncherPrompt({ onContinueAnyway }: SetLauncherPromptProps) {
  const handleOpenSettings = () => {
    NativeModules.KidsLauncher?.openLauncherSettings?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.emoji}>🏠</Text>
        <Text style={styles.title}>Set as Default Launcher</Text>
        <Text style={styles.description}>
          To prevent kids from accessing other apps and keep them focused on learning, please set this app as your default home screen.
        </Text>

        <TouchableOpacity onPress={handleOpenSettings} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Open Launcher Settings</Text>
        </TouchableOpacity>

        {onContinueAnyway && (
          <TouchableOpacity onPress={onContinueAnyway} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Continue Anyway</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footer}>
          You can change this anytime in your device settings.
        </Text>
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDERS.radius.lg,
    padding: SIZES.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
    ...SHADOWS.medium,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SIZES.md,
  },
  title: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.displayFallback,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
    fontFamily: FONTS.bodyFallback,
    textAlign: 'center',
    marginBottom: SIZES.xl,
    lineHeight: 26,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: BORDERS.radius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
    ...SHADOWS.small,
  },
  primaryButtonText: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.textInverse,
    fontFamily: FONTS.uiFallback,
  },
  secondaryButton: {
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: BORDERS.radius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: SIZES.md,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  secondaryButtonText: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.textLight,
    fontFamily: FONTS.uiFallback,
  },
  footer: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyFallback,
    textAlign: 'center',
  },
});
