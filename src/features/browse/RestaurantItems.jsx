import { StyleSheet, Text, View } from 'react-native';
import ItemsGrid from './ItemsGrid';
import { useRoute } from '@react-navigation/native';
import { useState, useEffect, useContext, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../lib/api';
import Toast from 'react-native-toast-message';
import Loader from '../../shared/Loader';
import Icon from 'react-native-vector-icons/Feather';
import { UserContext } from '../../context/userContext';
import { colors, spacing, typography } from '../../theme';

const RestaurantItems = ({ navigation }) => {
  const route = useRoute();
  const { restaurant } = route.params;
  const { user } = useContext(UserContext);

  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = String(user?.role || '')
    .toLowerCase()
    .trim();
  const isNonCustomer = Boolean(role) && role !== 'customer';

  const fetchRestaurantItems = useCallback(async () => {
    if (!restaurant?._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/items/restaurant/${restaurant._id}`);
      setItems(res.data.items);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load items',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  }, [restaurant?._id]);

  useEffect(() => {
    fetchRestaurantItems();
  }, [fetchRestaurantItems]);

  if (isNonCustomer) {
    return (
      <View style={styles.center}>
        <Icon name="shield" size={28} color={colors.muted} />
        <Text style={[styles.errorText, { marginTop: spacing.sm }]}>
          Customer Only
        </Text>
      </View>
    );
  }

  if (loading) {
    return <Loader />;
  }

  if (!restaurant) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Restaurant not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>More from</Text>
        <Text style={styles.title}>{restaurant.name}</Text>
      </View>

      {/* Items Grid */}
      <ItemsGrid items={items} navigation={navigation} />
    </View>
  );
};

export default RestaurantItems;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
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

  subtitle: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: spacing.xs,
  },

  title: {
    ...typography.h1,
    color: colors.text,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    ...typography.sub,
    color: colors.error,
  },
});
