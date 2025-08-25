import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

// Inside your component

import Counter from './counter';
import { useState, useContext } from 'react';
import { UserContext } from './userContext';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const screenWidth = Dimensions.get('window').width;
const Items = ({ items }) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const numColumns = isLandscape ? 4 : 2;
  const insets = useSafeAreaInsets();
  const { getCartData, mappedItems } = useContext(UserContext);
  const addToCart = async ({ item }) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const product = {
        productId: item._id,
        quantity: 1,
      };

      const res = await api.post('/cart/add', product, {
        headers: {
          authorization: token,
        },
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

  return (
    <View>
      <FlatList
        data={items}
        numColumns={numColumns}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          ...styles.contentContainer,
          paddingBottom: insets.bottom + 160,
        }}
        renderItem={({ item }) => (
          <View style={styles.ItemCard}>
            <Image source={{ uri: item.image.url }} style={styles.imgCard} />

            <Text style={styles.cardText} numberOfLines={1}>
              {item.name}
            </Text>

            <Text
              style={{
                ...styles.cardText,
                fontSize: 12,
                color: 'green',
                fontWeight: 'bold',
              }}
            >
              <Text
                style={{
                  ...styles.cardText,
                  fontWeight: 'bold',
                  fontSize: 9,
                  color: 'gray',
                  textDecorationLine: 'line-through',
                }}
              >
                ₹{item.price}
              </Text>{' '}
              ₹{item.offerPrice} ({item.discountPercent}% OFF)
            </Text>
            {(() => {
              const cartItem = mappedItems.find(
                cartItem => cartItem._id === item._id,
              );
              return cartItem ? (
                <Counter item={cartItem} />
              ) : (
                <TouchableOpacity
                  onPress={() => addToCart({ item })}
                  style={styles.button}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>
                    Add
                  </Text>
                </TouchableOpacity>
              );
            })()}

            <Text style={styles.isVeg}>
              {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
            </Text>
          </View>
        )}
        keyExtractor={item => item._id}
      />
    </View>
  );
};

export default Items;

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'flex-start',
    marginLeft: '8%',
    fontFamily: 'fantasy',
    color: 'rgb(84, 79, 59)',
  },
  contentContainer: {
    paddingHorizontal: '3%',
    paddingTop: 20,
  },
  ItemCard: {
    width: screenWidth * 0.42,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgb(84, 79, 59)',
    borderWidth: 1,
    borderRadius: 12,
    marginVertical: '3%',
    marginHorizontal: '3%',
    elevation: 4,
  },
  imgCard: {
    width: screenWidth * 0.41,
    height: 150,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardText: {
    fontWeight: '700',
    fontSize: 15,
    fontFamily: 'sans-serif',
    alignSelf: 'flex-start',
    marginLeft: '4%',
    lineHeight: '15%',
  },
  button: {
    backgroundColor: 'red',
    borderRadius: 6,
    color: 'white',
    padding: 7,
    margin: 10,
    width: '50%',
    alignItems: 'center',
  },
  isVeg: {
    fontSize: 10,
    top: 0,
    margin: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    position: 'absolute',
    borderRadius: 10,
    padding: 5,
  },
});
