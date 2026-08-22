import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  NativeModules,
  Alert,
} from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS, BORDERS } from '../theme';

interface ParentModePanelProps {
  visible: boolean;
  onClose: () => void;
  onChangePin: () => void;
}

export function ParentModePanel({ visible, onClose, onChangePin }: ParentModePanelProps) {
  const handleExitToHome = () => {
    Alert.alert(
      'Exit to Home?',
      'Go back to the device home screen?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            NativeModules.KidsLauncher?.exitToLauncher?.()
              ?.then(() => console.log('Exited to launcher'))
              ?.catch((err: any) => console.error('Exit failed:', err));
          },
        },
      ]
    );
  };

  const handleDeviceSettings = () => {
    NativeModules.KidsLauncher?.openDeviceSettings?.()
      ?.then(() => console.log('Opened device settings'))
      ?.catch((err: any) => console.error('Open settings failed:', err));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Parent Mode</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.panelSubtitle}>Manage device access</Text>

          <TouchableOpacity onPress={handleExitToHome} style={[styles.actionButton, styles.exitButton]}>
            <Text style={styles.actionIcon}>🏠</Text>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: COLORS.danger }]}>Exit to Home</Text>
              <Text style={styles.actionDesc}>Leave kids launcher</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onChangePin} style={styles.actionButton}>
            <Text style={styles.actionIcon}>🔐</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Change PIN</Text>
              <Text style={styles.actionDesc}>Update parent access code</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDeviceSettings} style={styles.actionButton}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Device Settings</Text>
              <Text style={styles.actionDesc}>Open Android system settings</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDERS.radius.xl,
    borderTopRightRadius: BORDERS.radius.xl,
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl,
    ...SHADOWS.large,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  panelTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.displayFallback,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.textLight,
    fontWeight: 'bold',
  },
  panelSubtitle: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textLight,
    fontFamily: FONTS.bodyFallback,
    marginBottom: SIZES.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDERS.radius.md,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  exitButton: {
    borderColor: 'rgba(255,107,107,0.2)',
    backgroundColor: '#FEE2E2',
  },
  actionIcon: {
    fontSize: 28,
    marginRight: SIZES.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.uiFallback,
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    fontFamily: FONTS.bodyFallback,
  },
});
