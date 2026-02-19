import { FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Toast from 'react-native-toast-message';
import api from '../utils/api';
import { UserContext } from '../utils/userContext';
import ItemCard from '../utils/ItemCard';
import { spacing } from '../theme';

const getItemId = item =>
  item?._id || item?.id || item?.productId?._id || item?.productId || null;

const getRestaurantId = item =>
  item?.restaurant?._id ||
  item?.restaurantId ||
  item?.restaurant_id ||
  item?.restaurant ||
  null;

const ItemsGrid = ({ items, contentPaddingBottom = 160, navigation }) => {
  const insets = useSafeAreaInsets();
  const { getCartData, mappedItems } = useContext(UserContext);
  const [restaurantNameById, setRestaurantNameById] = useState({});

  const restaurantIds = useMemo(() => {
    const ids = new Set();
    (items || []).forEach(i => {
      const id = getRestaurantId(i);
      if (id) ids.add(String(id));
    });
    return Array.from(ids);
  }, [items]);

  useEffect(() => {
    let mounted = true;

    const loadRestaurantNames = async () => {
      if (restaurantIds.length === 0) return;

      try {
        const res = await api.get('/restaurants');
        const restaurants = res?.data?.restaurants || [];
        const map = restaurants.reduce((acc, r) => {
          if (r?._id && r?.name) acc[String(r._id)] = r.name;
          return acc;
        }, {});

        if (mounted) setRestaurantNameById(map);
      } catch {
        // non-blocking; cards can still render without restaurant names
      }
    };

    loadRestaurantNames();
    return () => {
      mounted = false;
    };
  }, [restaurantIds]);

  const addToCart = useCallback(async item => {
    try {
      const productId = getItemId(item);
      if (!productId) {
        Toast.show({ type: 'error', text1: 'Invalid item', text2: 'Missing item id' });
        return;
      }

      const product = {
        productId,
        quantity: 1,
      };

      const res = await api.post('/cart/add', product);

      if (res.data.success) {
        getCartData();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to add to cart',
        });
      }
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;
      const isRestaurantConflict =
        status === 409 ||
        (typeof message === 'string' &&
          message.toLowerCase().includes('restaurant'));

      Toast.show({
        type: isRestaurantConflict ? 'info' : 'error',
        text1: message || 'Error adding to cart',
        ...(isRestaurantConflict && {
          text2: 'Clear cart to add items from another restaurant',
        }),
      });
    }
  }, [getCartData]);

  const renderItem = useCallback(
    ({ item, index }) => {
      const itemId = getItemId(item);
      const restaurantId = getRestaurantId(item);
      const restaurantName = restaurantId
        ? restaurantNameById[String(restaurantId)]
        : null;
      const cartItem = mappedItems.find(ci => ci._id === itemId);

      return (
        <ItemCard
          item={item}
          restaurantName={restaurantName}
          cartItem={cartItem}
          onAdd={addToCart}
          index={index}
          onPress={() => navigation?.navigate?.('ItemDetails', { item })}
        />
      );
    },
    [mappedItems, addToCart, navigation, restaurantNameById],
  );

  return (
    <FlatList
      data={items}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + contentPaddingBottom },
      ]}
      renderItem={renderItem}
      keyExtractor={item => String(getItemId(item))}
    />
  );
};

export default ItemsGrid;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
});
