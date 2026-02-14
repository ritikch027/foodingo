import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useEffect, useState, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Login from './src/auth components/Login';
import RestaurantItems from './src/components/RestaurantItems';
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
import OrderDetails from './src/screens/OrderDetails';
import Settings from './src/screens/Settings';
import { colors, spacing, typography } from './src/theme';
import api from './src/utils/api';

const Stack = createNativeStackNavigator();

/* -------------------- APP NAVIGATION -------------------- */

const ServerErrorScreen = ({ onRetry }) => (
  <View style={styles.serverErrorContainer}>
    <Text style={styles.serverErrorTitle}>Server is waking up</Text>
    <Text style={styles.serverErrorText}>
      Foodingo backend is not responding yet. Please retry in a few seconds.
    </Text>
    <Text style={styles.serverErrorSubText}>Try after sometime.</Text>

    <Pressable
      onPress={onRetry}
      style={({ pressed }) => [
        styles.retryBtn,
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={styles.retryBtnText}>Retry</Text>
    </Pressable>
  </View>
);

const AppNavigation = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(UserContext);
  const [booting, setBooting] = useState(true);
  const [serverReady, setServerReady] = useState(false);
  const [serverError, setServerError] = useState(false);

  const verifyServer = useCallback(async () => {
    setServerError(false);
    setServerReady(false);
    try {
      await api.get('/offers', { timeout: 25000 });
      setServerReady(true);
    } catch (err) {
      setServerError(true);
    }
  }, []);

  const checkLogin = useCallback(async () => {
    setBooting(true);
    try {
      const val = await AsyncStorage.getItem('isLoggedIn');
      const token = await AsyncStorage.getItem('token');

      if (val === 'true' && token) {
        setIsLoggedIn(true);
        await verifyServer();
      } else {
        setIsLoggedIn(false);
        setServerReady(false);
        setServerError(false);
      }
    } catch (err) {
      setIsLoggedIn(false);
      setServerReady(false);
      setServerError(false);
    } finally {
      setBooting(false);
    }
  }, [setIsLoggedIn, verifyServer]);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  // Smooth splash loader
  if (booting || isLoggedIn === null || (isLoggedIn && !serverReady && !serverError)) {
    return (
      <Animated.View entering={FadeIn} style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loaderText}>
          {isLoggedIn ? 'Connecting to Foodingo server...' : 'Starting Foodingo...'}
        </Text>
      </Animated.View>
    );
  }

  if (isLoggedIn && serverError) {
    return <ServerErrorScreen onRetry={checkLogin} />;
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />

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
            <Stack.Screen name="OrderDetails" component={OrderDetails} />
            <Stack.Screen name="OrderSuccess" component={OrderSuccess} />
            <Stack.Screen name="RestaurantItems" component={RestaurantItems} />
            <Stack.Screen
              name="RestaurantOrders"
              component={RestaurantOrders}
            />
            <Stack.Screen name="Settings" component={Settings} />
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
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderText: {
    marginTop: spacing.sm,
    ...typography.sub,
    color: colors.muted,
  },

  serverErrorContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  serverErrorTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },

  serverErrorText: {
    marginTop: spacing.sm,
    ...typography.sub,
    color: colors.muted,
    textAlign: 'center',
  },

  serverErrorSubText: {
    marginTop: spacing.xs,
    ...typography.caption,
    color: colors.muted,
    textAlign: 'center',
  },

  retryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
  },

  retryBtnText: {
    color: colors.surface,
    ...typography.sub,
    fontWeight: '700',
  },
});
