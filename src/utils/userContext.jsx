import React, { createContext, useState, useEffect, useMemo } from 'react';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null); // NEW
  
  //fetching category
  
  const [foodItems, setFoodItems] = useState([]);
  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setFoodItems(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  //fetching cart items
  const [cartItems, setCartItems] = useState([]);
  const getCartData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await api.get('/cart', {
        headers: {
          authorization: token,
        },
      });
      const items = res.data.cart?.items || [];
      setCartItems(items);
    } catch (error) {
      const msg1 = error?.data.message;
      Toast.show({
        type: 'error',
        text1: 'Some Error Occured',
        text2: msg1,
      });
    }
  };
  const mappedItems = useMemo(() => {
    return cartItems.map(cartItem => ({
      ...cartItem.productId,
      quantity: cartItem.quantity,
    }));
  }, [cartItems]);
  
  //increase cart quantity
  
  const increaseQuantity = async ({ item }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await api.post(
        '/cart/increment',
        { productId: item._id || item.productId }, // support both keys
        {
          headers: {
            authorization: token,
          },
        },
      );
      if (res.data.success) {
        setTimeout(async () => {
          await getCartData();
        }, 10);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to increase quantity',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1:
        err.response?.data?.message || err.message || 'Something went wrong',
      });
    }
  };
  //decrease cart quantity
  const decreaseQuantity = async ({ item }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const res = await api.post(
        '/cart/decrement',
        { productId: item._id || item.productId },
        {
          headers: {
            authorization: token,
          },
        },
      );
      
      if (res.data.success) {
        setTimeout(async () => {
          await getCartData();
        }, 10);
        // Refresh cart
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to decrease quantity',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1:
        err.response?.data?.message || err.message || 'Something went wrong',
      });
    }
  };
  
  useEffect(() => {
    const checkIfLoggedIn = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // Don't call getData or show any toast
        return;
      }
      // Safe to fetch user
      await getCartData();
    };
    
    checkIfLoggedIn();
    fetchCategories();
  }, []);
  
  return (
    <UserContext.Provider
    value={{
      user,
      setUser,
      fetchCategories,
      isLoggedIn,
      setIsLoggedIn,
      foodItems,
      mappedItems,
      getCartData,
      cartItems,
      setCartItems,
      increaseQuantity,
      decreaseQuantity,
    }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserContext = createContext();