import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, radii, spacing, typography, shadows, motion } from '../theme';

const OrderCard = ({
  restaurantName,
  status = 'Preparing',
  total,
  orderId,
  orderDate,
  items = [],
  onViewDetails,
  index = 0,
}) => {
  const statusConfig = {
    Preparing: {
      color: colors.warning,
      bg: colors.tintAlt,
      icon: 'clock',
    },
    'On the way': {
      color: colors.info,
      bg: '#DBEAFE',
      icon: 'truck',
    },
    Delivered: {
      color: colors.accent,
      bg: '#DCFCE7',
      icon: 'check-circle',
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.Preparing;

  return (
    <Animated.View
      entering={FadeInDown.duration(motion.fadeDuration).delay(
        index * motion.fadeDelay,
      )}
      style={styles.card}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.restaurantName} numberOfLines={1}>
            {restaurantName}
          </Text>
          <Text style={styles.orderId}>#{orderId}</Text>
        </View>

        <View
          style={[styles.statusBadge, { backgroundColor: currentStatus.bg }]}
        >
          <Icon
            name={currentStatus.icon}
            size={14}
            color={currentStatus.color}
          />
          <Text style={[styles.statusText, { color: currentStatus.color }]}>
            {status}
          </Text>
        </View>
      </View>

      {/* Items Preview */}
      <View style={styles.itemsContainer}>
        <Text style={styles.itemsLabel}>Items:</Text>
        <Text style={styles.itemsText} numberOfLines={2}>
          {items.length > 0 ? items.join(', ') : 'Food items'}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.dateText}>{orderDate}</Text>
          <Text style={styles.totalText}>
            {'\u20B9'}
            {total}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.detailsButton,
            pressed && { opacity: 0.85 },
          ]}
          onPress={onViewDetails}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Icon name="arrow-right" size={16} color={colors.surface} />
        </Pressable>
      </View>
    </Animated.View>
  );
};

export default OrderCard;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  headerLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },

  restaurantName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 2,
  },

  orderId: {
    ...typography.caption,
    color: colors.muted,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    gap: 4,
  },

  statusText: {
    ...typography.caption,
  },

  itemsContainer: {
    marginBottom: spacing.sm,
  },

  itemsLabel: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: spacing.xs,
  },

  itemsText: {
    ...typography.sub,
    color: colors.text,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dateText: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: 2,
  },

  totalText: {
    ...typography.h3,
    color: colors.text,
  },

  detailsButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  detailsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.surface,
  },
});
