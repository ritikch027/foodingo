import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Animated, { FadeInDown } from 'react-native-reanimated';
import OrderCard from '../components/OrderCard';
import api from '../utils/api';
import Toast from 'react-native-toast-message';
import Loader from '../utils/Loader';
import { colors, radii, spacing, typography, shadows, motion } from '../theme';

const MyOrders = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const filterOptions = ['All', 'Preparing', 'On the way', 'Delivered'];

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/user');
      setOrders(res.data.orders || []);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load orders',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const filteredOrders =
    activeFilter === 'All'
      ? orders
      : orders.filter(order => order.status === activeFilter);

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="package" size={54} color={colors.muted} />
      </View>
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptySubtitle}>
        {activeFilter === 'All'
          ? 'Start ordering your favorite food!'
          : `No ${activeFilter.toLowerCase()} orders`}
      </Text>
      <Pressable
        style={styles.browseButton}
        onPress={() => navigation.navigate('HomeWithDrawer')}
      >
        <Text style={styles.browseButtonText}>Browse Restaurants</Text>
      </Pressable>
    </View>
  );

  if (loading) return <Loader />;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Animated.View
          entering={FadeInDown.duration(motion.fadeDuration)}
          style={styles.headerContent}
        >
          <Icon name="package" size={22} color={colors.primary} />
          <Text style={styles.headingTxt}>My Orders</Text>
        </Animated.View>

        {orders.length > 0 && (
          <View style={styles.orderCountBadge}>
            <Text style={styles.orderCountText}>{orders.length}</Text>
          </View>
        )}
      </View>

      {/* Filter Tabs */}
      <Animated.View
        entering={FadeInDown.duration(motion.fadeDuration).delay(60)}
        style={styles.filterContainer}
      >
        {filterOptions.map(filter => (
          <Pressable
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.filterTabActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </Animated.View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item._id || item.orderId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item, index }) => (
          <OrderCard
            restaurantName={item.restaurantName || 'Restaurant'}
            status={item.status}
            total={item.total}
            orderId={item.orderId || item._id}
            orderDate={new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
            items={item.items?.map(i => i.name) || []}
            onViewDetails={() =>
              navigation.navigate('OrderDetails', { order: item })
            }
            index={index}
          />
        )}
      />

      <Toast />
    </View>
  );
};

export default MyOrders;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  /* Header */
  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  headingTxt: {
    ...typography.h1,
    color: colors.text,
  },

  orderCountBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    minWidth: 30,
    alignItems: 'center',
  },

  orderCountText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },

  /* Filters */
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },

  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterText: {
    ...typography.caption,
    color: colors.muted,
  },

  filterTextActive: {
    color: colors.surface,
  },

  /* List */
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },

  emptyIconContainer: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 50,
    marginBottom: spacing.md,
    ...shadows.soft,
  },

  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  emptySubtitle: {
    ...typography.sub,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  browseButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radii.md,
  },

  browseButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
