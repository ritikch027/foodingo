import { FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCallback, useContext } from 'react';
import Toast from 'react-native-toast-message';
import api from '../utils/api';
import { UserContext } from '../utils/userContext';
import ItemCard from '../utils/ItemCard';
import { spacing } from '../theme';

const ItemsGrid = ({ items, contentPaddingBottom = 160 }) => {
  const insets = useSafeAreaInsets();
  const { getCartData, mappedItems } = useContext(UserContext);

  const addToCart = async item => {
    try {
      const product = {
        productId: item._id,
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
  };

  const renderItem = useCallback(
    ({ item, index }) => {
      const cartItem = mappedItems.find(cartItem => cartItem._id === item._id);

      return (
        <ItemCard
          item={item}
          cartItem={cartItem}
          onAdd={addToCart}
          index={index}
        />
      );
    },
    [mappedItems],
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
      keyExtractor={item => item._id}
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
