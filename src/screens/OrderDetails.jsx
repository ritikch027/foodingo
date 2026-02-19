import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography, shadows } from '../theme';

const OrderDetails = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const order = route?.params?.order || {};

  const status = order.status || 'Preparing';
  const orderId = order.orderId || order._id || 'N/A';
  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'N/A';

  const restaurantName =
    order.restaurantName || order.restaurant?.name || 'Restaurant';
  const address = order.deliveryAddress?.address || 'Not available';

  const subtotal = Number(order.subtotal || 0);
  const deliveryFee = Number(order.deliveryFee || 0);
  const total = Number(order.totalAmount ?? order.total ?? subtotal + deliveryFee);

  const statusColor =
    status === 'Delivered'
      ? colors.accent
      : status === 'On the way'
      ? colors.info
      : colors.warning;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.backButton} />
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{restaurantName}</Text>
          <Text style={styles.metaText}>Order #{orderId}</Text>
          <Text style={styles.metaText}>{orderDate}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <Text style={styles.bodyText}>{address}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
          {(order.items || []).map((item, idx) => {
            const linePrice = Number(item.price || 0) * Number(item.quantity || 0);
            return (
              <View key={`${item._id || item.productId || idx}`} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name || 'Item'}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity || 0}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  {'\u20B9'}
                  {linePrice.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {'\u20B9'}
              {subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {'\u20B9'}
              {deliveryFee.toFixed(2)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {'\u20B9'}
              {total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  placeholder: {
    width: 36,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.soft,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  bodyText: {
    ...typography.sub,
    color: colors.text,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    ...typography.sub,
    color: colors.text,
    marginBottom: 2,
  },
  itemQty: {
    ...typography.caption,
    color: colors.muted,
  },
  itemPrice: {
    ...typography.sub,
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.sub,
    color: colors.muted,
  },
  summaryValue: {
    ...typography.sub,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  totalValue: {
    ...typography.h3,
    color: colors.primaryDark,
  },
});
