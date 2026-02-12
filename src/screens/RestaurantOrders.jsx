import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import api from '../utils/api';
import Toast from 'react-native-toast-message';
import Loader from '../utils/Loader';
import { colors, radii, spacing, typography, shadows } from '../theme';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
      await api.patch(`/orders/${id}`, { status });
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

  if (loading) return <Loader />;
  if (orders.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No Remaining Orders</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={orders}
      keyExtractor={item => item._id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>Order #{item._id.slice(-6)}</Text>

          <Text style={styles.meta}>Status: {item.status}</Text>
          <Text style={styles.meta}>
            Total: {'\u20B9'}
            {item.total}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => updateStatus(item._id, 'preparing')}
              style={styles.btn}
            >
              <Text style={styles.btnText}>Prepare</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => updateStatus(item._id, 'delivered')}
              style={[styles.btn, styles.green]}
            >
              <Text style={styles.btnText}>Deliver</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

export default RestaurantOrders;

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.sub,
    color: colors.muted,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    marginRight: spacing.sm,
  },
  green: {
    backgroundColor: colors.accent,
  },
  btnText: {
    color: colors.surface,
    fontWeight: '700',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  emptyText: {
    ...typography.sub,
    color: colors.muted,
  },
});
