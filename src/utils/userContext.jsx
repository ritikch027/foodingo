import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* ---------------- CATEGORIES ---------------- */

  const [foodItems, setFoodItems] = useState([]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories');
      setFoodItems(res.data.categories);

      // cache
      // await AsyncStorage.setItem('categories', JSON.stringify(res.data));
    } catch (error) {
      console.log('Category API error:', error.message);

      // fallback to cache
      // const cached = await AsyncStorage.getItem('categories');
      // if (cached) {
      //   setFoodItems(JSON.parse(cached));
      // }
    }
  }, []);

  /* ---------------- CART ---------------- */

  const [cartItems, setCartItems] = useState([]);

  const getCartData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/cart');
      const items = res.data.cart?.items || [];
      setCartItems(items);
    } catch (error) {
      console.log('Cart API error:', error.message);
    }
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'isLoggedIn']);
    } catch {
      // ignore storage failures; still clear in-memory state
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      setCartItems([]);
    }
  }, []);

  // Map cart items for UI
  const mappedItems = useMemo(() => {
    return cartItems.map(cartItem => ({
      ...cartItem.productId,
      quantity: cartItem.quantity,
    }));
  }, [cartItems]);

  /* ---------------- OPTIMISTIC CART ---------------- */

  const increaseQuantity = async ({ item }) => {
    const id = item._id || item.productId;

    // Optimistic UI
    setCartItems(prev =>
      prev.map(i =>
        i.productId._id === id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    );

    try {
      await api.post('/cart/increment', { productId: id });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Could not update cart',
      });
      getCartData(); // rollback
    }
  };

  const decreaseQuantity = async ({ item }) => {
    const id = item._id || item.productId;

    // Optimistic UI
    setCartItems(prev =>
      prev
        .map(i =>
          i.productId._id === id ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter(i => i.quantity > 0),
    );

    try {
      await api.post('/cart/decrement', { productId: id });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Could not update cart',
      });
      getCartData(); // rollback
    }
  };

  /* ---------------- SESSION ---------------- */

  const checkSession = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    const loggedFlag = await AsyncStorage.getItem('isLoggedIn');

    if (token && loggedFlag === 'true') {
      setIsLoggedIn(true);
      getCartData();
    } else {
      setIsLoggedIn(false);
      setCartItems([]);
    }
  }, [getCartData]);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    checkSession();
    // fetchCategories();
  }, [checkSession]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn,
        setIsLoggedIn,
        logout,

        foodItems,
        fetchCategories,

        cartItems,
        mappedItems,
        getCartData,
        clearCart,

        increaseQuantity,
        decreaseQuantity,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
