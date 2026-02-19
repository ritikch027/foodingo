import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, radii, spacing, typography, shadows } from '../theme';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const resolverRef = useRef(null);
  const [state, setState] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    destructive: false,
    icon: 'help-circle',
  });

  const close = useCallback(result => {
    setState(prev => ({ ...prev, visible: false }));
    const resolver = resolverRef.current;
    resolverRef.current = null;
    resolver?.(result);
  }, []);

  const confirm = useCallback(options => {
    const {
      title = 'Confirm',
      message = '',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      destructive = false,
      icon = destructive ? 'alert-triangle' : 'help-circle',
    } = options || {};

    setState({
      visible: true,
      title,
      message,
      confirmText,
      cancelText,
      destructive,
      icon,
    });

    return new Promise(resolve => {
      resolverRef.current = resolve;
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <Modal
        visible={state.visible}
        transparent
        animationType="fade"
        onRequestClose={() => close(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => close(false)} />

        <View style={styles.sheetWrap}>
          <View style={styles.card}>
            <View style={styles.iconRow}>
              <View
                style={[
                  styles.iconWrap,
                  state.destructive && styles.iconWrapDanger,
                ]}
              >
                <Icon
                  name={state.icon}
                  size={18}
                  color={state.destructive ? colors.error : colors.primary}
                />
              </View>
              <Text style={styles.title}>{state.title}</Text>
            </View>

            {!!state.message && <Text style={styles.message}>{state.message}</Text>}

            <View style={styles.actions}>
              <Pressable
                onPress={() => close(false)}
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnGhost,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text style={styles.btnGhostText}>{state.cancelText}</Text>
              </Pressable>

              <Pressable
                onPress={() => close(true)}
                style={({ pressed }) => [
                  styles.btn,
                  state.destructive ? styles.btnDanger : styles.btnPrimary,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
                ]}
              >
                <Text style={styles.btnText}>{state.confirmText}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error('useConfirm must be used within ConfirmProvider');
  }
  return confirm;
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  sheetWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.tintAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDanger: {
    backgroundColor: '#FEF2F2',
  },
  title: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  message: {
    marginTop: spacing.sm,
    ...typography.sub,
    color: colors.muted,
  },
  actions: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnGhostText: {
    ...typography.sub,
    color: colors.text,
    fontWeight: '800',
  },
  btnPrimary: {
    backgroundColor: colors.primary,
  },
  btnDanger: {
    backgroundColor: colors.error,
  },
  btnText: {
    ...typography.sub,
    color: colors.surface,
    fontWeight: '900',
  },
});
