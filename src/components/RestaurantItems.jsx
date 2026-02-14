import { StyleSheet, Text, View, Pressable } from 'react-native';
import ItemsGrid from '../components/ItemsGrid';
import { useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../utils/api';
import Toast from 'react-native-toast-message';
import Loader from '../utils/Loader';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, typography } from '../theme';

const RestaurantItems = ({ navigation }) => {
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
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Pressable
          onPress={() =>
            navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeWithDrawer')
          }
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}
        >
          <Icon name="arrow-left" size={18} color={colors.text} />
        </Pressable>
      </View>

      {/* Header */}
      <View style={styles.header}>
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
