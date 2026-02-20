import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../lib/api';
import Toast from 'react-native-toast-message';
import Loader from '../../shared/Loader';
import { colors, radii, spacing, typography, shadows } from '../../theme';

const RestaurantOrders = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('NEW');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/restaurant/orders');
      setOrders(res.data.orders);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Failed to load orders',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Update failed',
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusOf = status => (status || '').toUpperCase();

  const newOrders = orders.filter(order => {
    const status = statusOf(order.status);
    return status !== 'PREPARING' && status !== 'DELIVERED';
  });
  const preparingOrders = orders.filter(
    order => statusOf(order.status) === 'PREPARING',
  );
  const deliveredOrders = orders.filter(
    order => statusOf(order.status) === 'DELIVERED',
  );

  const filteredOrders =
    activeFilter === 'NEW'
      ? newOrders
      : activeFilter === 'PREPARING'
      ? preparingOrders
      : deliveredOrders;

  if (loading) return <Loader />;
  if (orders.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <View style={styles.emptyIconWrap}>
          <Icon name="inbox" size={26} color={colors.muted} />
        </View>
        <Text style={styles.emptyText}>No Remaining Orders</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.sm }]}>
      <View style={styles.headerWrap}>
        <Text style={styles.heading}>Restaurant Orders</Text>
        <Text style={styles.subHeading}>Track and update live order status</Text>
      </View>

      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setActiveFilter('NEW')}
          style={[styles.filterChip, activeFilter === 'NEW' && styles.filterChipActive]}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'NEW' && styles.filterChipTextActive,
            ]}
          >
            New
          </Text>
          <View
            style={[
              styles.countBubble,
              activeFilter === 'NEW' && styles.countBubbleActive,
            ]}
          >
            <Text
              style={[
                styles.countText,
                activeFilter === 'NEW' && styles.countTextActive,
              ]}
            >
              {newOrders.length}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setActiveFilter('PREPARING')}
          style={[
            styles.filterChip,
            activeFilter === 'PREPARING' && styles.filterChipActive,
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'PREPARING' && styles.filterChipTextActive,
            ]}
          >
            Preparing
          </Text>
          <View
            style={[
              styles.countBubble,
              activeFilter === 'PREPARING' && styles.countBubbleActive,
            ]}
          >
            <Text
              style={[
                styles.countText,
                activeFilter === 'PREPARING' && styles.countTextActive,
              ]}
            >
              {preparingOrders.length}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setActiveFilter('DELIVERED')}
          style={[
            styles.filterChip,
            activeFilter === 'DELIVERED' && styles.filterChipActive,
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              activeFilter === 'DELIVERED' && styles.filterChipTextActive,
            ]}
          >
            Delivered
          </Text>
          <View
            style={[
              styles.countBubble,
              activeFilter === 'DELIVERED' && styles.countBubbleActive,
            ]}
          >
            <Text
              style={[
                styles.countText,
                activeFilter === 'DELIVERED' && styles.countTextActive,
              ]}
            >
              {deliveredOrders.length}
            </Text>
          </View>
        </Pressable>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.container}
        ListEmptyComponent={
          <View style={styles.emptyInlineWrap}>
            <Text style={styles.emptyText}>
              {activeFilter === 'NEW'
                ? 'No New Orders'
                : activeFilter === 'PREPARING'
                ? 'No Preparing Orders'
                : 'No Delivered Orders'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('OrderDetails', { order: item })}
            style={({ pressed }) => [
              styles.card,
              styles.clickableCard,
              pressed && {
                opacity: 0.9,
                transform: [{ scale: 0.995 }],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.title}>Order #{item._id.slice(-6)}</Text>
                <Text style={styles.metaText}>
                  {new Date(item.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  statusOf(item.status) === 'DELIVERED'
                    ? styles.deliveredBadge
                    : statusOf(item.status) === 'PREPARING'
                    ? styles.preparingBadge
                    : styles.newBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    statusOf(item.status) === 'DELIVERED'
                      ? styles.deliveredText
                      : statusOf(item.status) === 'PREPARING'
                      ? styles.preparingText
                      : styles.newText,
                  ]}
                >
                  {statusOf(item.status) === 'DELIVERED'
                    ? 'Delivered'
                    : statusOf(item.status) === 'PREPARING'
                    ? 'Preparing'
                    : 'New'}
                </Text>
              </View>
            </View>

            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Order Total</Text>
              <Text style={styles.amountValue}>
                {'\u20B9'}
                {Number(item.totalAmount || item.subtotal || 0).toFixed(2)}
              </Text>
            </View>

            {statusOf(item.status) !== 'DELIVERED' && (
              <View style={styles.actions}>
                {statusOf(item.status) !== 'PREPARING' && (
                  <TouchableOpacity
                    onPress={() => updateStatus(item._id, 'PREPARING')}
                    style={[styles.btn, styles.prepareBtn]}
                  >
                    <Text style={styles.prepareBtnText}>Mark Preparing</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={() => updateStatus(item._id, 'DELIVERED')}
                  style={[styles.btn, styles.deliverBtn]}
                >
                  <Text style={styles.deliverBtnText}>Mark Delivered</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.tapHint}>Tap to view full details</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

export default RestaurantOrders;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerTop: {
    marginBottom: spacing.sm,
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
  heading: {
    ...typography.h1,
    color: colors.text,
  },
  subHeading: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.surface,
  },
  countBubble: {
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.bg,
    alignItems: 'center',
  },
  countBubbleActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  countText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  countTextActive: {
    color: colors.surface,
  },
  container: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  clickableCard: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  metaText: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 999,
  },
  preparingBadge: {
    backgroundColor: colors.tintAlt,
  },
  deliveredBadge: {
    backgroundColor: '#DCFCE7',
  },
  newBadge: {
    backgroundColor: '#FFF4E5',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  preparingText: {
    color: colors.warning,
  },
  deliveredText: {
    color: colors.accent,
  },
  newText: {
    color: '#B45309',
  },
  amountRow: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    ...typography.sub,
    color: colors.muted,
  },
  amountValue: {
    ...typography.h3,
    color: colors.text,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
  },
  prepareBtn: {
    backgroundColor: colors.warning,
  },
  deliverBtn: {
    backgroundColor: colors.info,
  },
  prepareBtnText: {
    color: colors.surface,
    fontWeight: '700',
  },
  deliverBtnText: {
    color: colors.surface,
    fontWeight: '700',
  },
  tapHint: {
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.muted,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.soft,
  },
  emptyInlineWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.sub,
    color: colors.muted,
  },
});
