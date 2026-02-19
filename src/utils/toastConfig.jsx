import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, radii, spacing, typography, shadows } from '../theme';

const ToastCard = ({ text1, text2, iconName, accentColor }) => {
  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: `${accentColor}14` }]}>
          <Icon name={iconName} size={18} color={accentColor} />
        </View>

        <View style={styles.textWrap}>
          {!!text1 && <Text style={styles.title}>{text1}</Text>}
          {!!text2 && <Text style={styles.subtitle}>{text2}</Text>}
        </View>
      </View>
    </View>
  );
};

const SimpleToast = ({ text1, text2 }) => {
  const content = text2 || text1;
  if (!content) return null;

  return (
    <View style={styles.simpleWrap}>
      <Text style={styles.simpleText}>{content}</Text>
    </View>
  );
};

const SnackbarToast = ({ text1, text2 }) => {
  const content = text2 || text1;
  if (!content) return null;

  return (
    <View style={styles.snack}>
      <Text style={styles.snackText}>{content}</Text>
    </View>
  );
};

export const toastConfig = {
  success: props => (
    <ToastCard
      text1={props.text1}
      text2={props.text2}
      iconName="check-circle"
      accentColor={colors.accent}
    />
  ),
  error: props => (
    <ToastCard
      text1={props.text1}
      text2={props.text2}
      iconName="alert-triangle"
      accentColor={colors.error}
    />
  ),
  info: props => (
    <ToastCard
      text1={props.text1}
      text2={props.text2}
      iconName="info"
      accentColor={colors.info}
    />
  ),
  simple: props => <SimpleToast text1={props.text1} text2={props.text2} />,
  snackbar: props => <SnackbarToast text1={props.text1} text2={props.text2} />,
};

const styles = StyleSheet.create({
  card: {
    width: '92%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...typography.sub,
    color: colors.text,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },

  simpleWrap: {
    maxWidth: '92%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    ...shadows.soft,
  },
  simpleText: {
    ...typography.sub,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '700',
  },

  snack: {
    width: '92%',
    backgroundColor: colors.text,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    ...shadows.card,
  },
  snackText: {
    ...typography.sub,
    color: colors.surface,
    textAlign: 'center',
    fontWeight: '700',
  },
});

