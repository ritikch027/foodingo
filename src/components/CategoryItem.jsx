import { StyleSheet, Text, View } from 'react-native';
import ItemsGrid from '../components/ItemsGrid';
import { useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../utils/api';
import Loader from '../utils/Loader';
import Toast from 'react-native-toast-message';
import { colors, spacing, typography } from '../theme';

const CategoryItem = () => {
  const route = useRoute();
  const { category } = route.params;
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItemByCategory = async () => {
    try {
      const res = await api.get(
        `/items/category/${encodeURIComponent(category)}`,
      );

      setItems(res.data.items || []);
    } catch (error) {
      console.log('Category API error:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Failed to load items',
        text2: 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemByCategory();
  }, []);

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.subtitle}>Showing results for</Text>
        <Text style={styles.title}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Text>
      </View>

      {/* Items Grid */}
      <ItemsGrid items={items} />

      <Toast />
    </View>
  );
};

export default CategoryItem;

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
});
