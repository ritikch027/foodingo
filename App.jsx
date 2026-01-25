import {
  ActivityIndicator,
  View,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
import { useEffect, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Login from './src/auth components/Login';
import Register from './src/auth components/Register';
import CategoryItem from './src/components/CategoryItem';
import Cart from './src/components/Cart';
import HomewithDrawer from './src/navigators/HomewithDrawer';
import Toast from 'react-native-toast-message';
import { UserProvider, UserContext } from './src/utils/userContext';
import Animated, { FadeIn } from 'react-native-reanimated';
import Checkout from './src/screens/Checkout';
import MyOrders from './src/screens/MyOrders';
import OrderSuccess from './src/screens/OrderSuccess';
import RestaurantOrders from './src/screens/RestaurantOrders';

const Stack = createNativeStackNavigator();

/* -------------------- APP NAVIGATION -------------------- */

const AppNavigation = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(UserContext);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const val = await AsyncStorage.getItem('isLoggedIn');
        const token = await AsyncStorage.getItem('token');

        if (val === 'true' && token) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setBooting(false);
      }
    };

    checkLogin();
  }, []);

  // Smooth splash loader
  if (booting || isLoggedIn === null) {
    return (
      <Animated.View entering={FadeIn} style={styles.loader}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loaderText}>Starting Foodingo...</Text>
      </Animated.View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        ) : (
          <>
            <Stack.Screen name="HomeWithDrawer" component={HomewithDrawer} />
            <Stack.Screen name="CategoryItem" component={CategoryItem} />
            <Stack.Screen name="Checkout" component={Checkout} />
            <Stack.Screen name="MyOrders" component={MyOrders} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccess} />
            <Stack.Screen
              name="RestaurantOrders"
              component={RestaurantOrders}
            />
            <Stack.Screen name="Cart" component={Cart} />
          </>
        )}
      </Stack.Navigator>

      <Toast />
    </NavigationContainer>
  );
};

/* -------------------- ROOT APP -------------------- */

const App = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UserProvider>
          <AppNavigation />
        </UserProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderText: {
    marginTop: 14,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});
