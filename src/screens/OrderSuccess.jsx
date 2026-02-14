import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { colors, radii, spacing, typography, shadows } from '../theme';

const OrderSuccess = ({ route, navigation }) => {
  const { order, orderId } = route.params || {};
  const displayId = order?._id?.slice(-6) || orderId || 'N/A';
  const displayStatus = order?.status || 'Confirmed';
  const displayTotal = order?.totalAmount;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() =>
            navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeWithDrawer')
          }
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}
        >
          <Icon name="arrow-left" size={18} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>{'\uD83C\uDF89'}</Text>
      </View>

      <Text style={styles.big}>Order Confirmed</Text>

      <Text style={styles.id}>Order #{displayId}</Text>

      <Text style={styles.metaText}>Status: {displayStatus}</Text>
      {displayTotal != null && (
        <Text style={styles.metaText}>
          Total: {'\u20B9'}
          {displayTotal}
        </Text>
      )}

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.replace('HomeWithDrawer')}
      >
        <Text style={styles.btnText}>Back Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  topBar: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.tintAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.soft,
  },

  iconText: {
    fontSize: 36,
  },

  big: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  id: {
    ...typography.sub,
    color: colors.muted,
    marginBottom: spacing.sm,
  },

  metaText: {
    ...typography.sub,
    color: colors.text,
  },

  btn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },

  btnText: {
    color: colors.surface,
    fontWeight: '700',
  },
});
