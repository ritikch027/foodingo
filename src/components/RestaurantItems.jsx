import { StyleSheet, Text, View } from 'react-native';
import ItemsGrid from '../components/ItemsGrid';
import { useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../utils/api';
import Toast from 'react-native-toast-message';
import Loader from '../utils/Loader';
import { colors, spacing, typography } from '../theme';

const RestaurantItems = () => {
  const route = useRoute();
  const { restaurant } = route.params;

  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurantItems = async () => {
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
  };

  useEffect(() => {
    fetchRestaurantItems();
  }, []);

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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.subtitle}>More from</Text>
        <Text style={styles.title}>{restaurant.name}</Text>
      </View>

      {/* Items Grid */}
      <ItemsGrid items={items} />

      <Toast />
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
