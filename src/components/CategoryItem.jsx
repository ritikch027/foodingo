import { StyleSheet, Text, View, Pressable } from 'react-native';
import ItemsGrid from '../components/ItemsGrid';
import { useRoute } from '@react-navigation/native';
import { useState, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../utils/api';
import Loader from '../utils/Loader';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, typography } from '../theme';

const CategoryItem = ({ navigation }) => {
  const route = useRoute();
  const { category } = route.params;
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItemByCategory = useCallback(async () => {
    setLoading(true);
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
  }, [category]);

  useEffect(() => {
    fetchItemByCategory();
  }, [fetchItemByCategory]);

  if (loading) return <Loader />;

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
        <Text style={styles.subtitle}>Showing results for</Text>
        <Text style={styles.title}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Text>
      </View>

      {/* Items Grid */}
      <ItemsGrid items={items} />
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
});
