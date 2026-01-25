import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Dimensions,
  Pressable,
  useWindowDimensions,
} from 'react-native';

import Counter from './counter';
import { useContext, useCallback } from 'react';
import { UserContext } from './userContext';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;

const Items = ({ items }) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const numColumns = isLandscape ? 4 : 2;
  const insets = useSafeAreaInsets();
  const { getCartData, mappedItems } = useContext(UserContext);

  const addToCart = async ({ item }) => {
    if (mappedItems.length && mappedItems[0].restaurant !== item.restaurant) {
      Toast.show({
        type: 'info',
        text1: 'Different Restaurant',
        text2: 'Clear cart to add items from another restaurant',
      });
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');

      const product = {
        productId: item._id,
        quantity: 1,
      };

      const res = await api.post('/cart/add', product, {
        headers: { authorization: token },
      });

      if (res.data.success) {
        getCartData();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to add to cart',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message || 'Error adding to cart',
      });
    }
  };

  const renderItem = useCallback(
    ({ item, index }) => {
      const cartItem = mappedItems.find(cartItem => cartItem._id === item._id);

      return (
        <Animated.View
          entering={FadeInDown.delay(index * 80)}
          layout={Layout.springify()}
          style={styles.card}
        >
          <Image source={{ uri: item.image.url }} style={styles.image} />

          <View style={styles.cardBody}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.oldPrice}>₹{item.price}</Text>
              <Text style={styles.price}>₹{item.offerPrice}</Text>
              <Text style={styles.discount}>{item.discountPercent}% OFF</Text>
            </View>

            {cartItem ? (
              <Counter item={cartItem} />
            ) : (
              <Pressable
                onPress={() => addToCart({ item })}
                style={({ pressed }) => [
                  styles.addBtn,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Text style={styles.addText}>Add</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.vegBadge}>
            <Text style={styles.vegText}>
              {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
            </Text>
          </View>
        </Animated.View>
      );
    },
    [mappedItems],
  );

  return (
    <FlatList
      data={items}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        ...styles.contentContainer,
        paddingBottom: insets.bottom + 160,
      }}
      renderItem={renderItem}
      keyExtractor={item => item._id}
    />
  );
};

export default Items;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  card: {
    width: screenWidth * 0.44,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 18,
    marginHorizontal: 8,
    overflow: 'hidden',
    elevation: 3,
  },

  image: {
    width: '100%',
    height: 150,
  },

  cardBody: {
    padding: 12,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },

  oldPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },

  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16a34a',
  },

  discount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
  },

  addBtn: {
    marginTop: 10,
    backgroundColor: '#4f46e5',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },

  addText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  vegBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
  },

  vegText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
