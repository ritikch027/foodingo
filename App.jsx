import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { useEffect, useState, useContext, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Login from './src/features/auth/Login';
import RestaurantItems from './src/features/browse/RestaurantItems';
import Register from './src/features/auth/Register';
import CategoryItem from './src/features/browse/CategoryItem';
import Cart from './src/features/cart/Cart';
import HomewithDrawer from './src/navigators/HomewithDrawer';
import Toast from 'react-native-toast-message';
import { UserProvider, UserContext } from './src/context/userContext';
import Animated, { FadeIn } from 'react-native-reanimated';
import Checkout from './src/features/cart/Checkout';
import MyOrders from './src/features/orders/MyOrders';
import OrderSuccess from './src/features/orders/OrderSuccess';
import RestaurantOrders from './src/features/orders/RestaurantOrders';
import OrderDetails from './src/features/orders/OrderDetails';
import ItemDetails from './src/features/browse/ItemDetails';
import Settings from './src/features/profile/Settings';
import { colors, spacing, typography } from './src/theme';
import api from './src/lib/api';
import Loader from './src/shared/Loader';
import { toastConfig } from './src/lib/toastConfig';
import { ConfirmProvider } from './src/shared/confirm';

const Stack = createNativeStackNavigator();

/* -------------------- APP NAVIGATION -------------------- */

const ServerErrorScreen = ({ onRetry }) => (
  <View style={styles.serverErrorContainer}>
    <Text style={styles.serverErrorTitle}>Hang tight - our kitchen is warming up</Text>
    <Text style={styles.serverErrorText}>
      The Foodingo server is waking up from a quick nap. Give it a moment, then tap
      retry.
    </Text>
    <Text style={styles.serverErrorSubText}>
      If it takes longer, it's probably dreaming about biryani.
    </Text>

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
  const [serverStatus, setServerStatus] = useState('idle');
  const ensureInFlight = useRef(false);
  const ensureReqId = useRef(0);

  const ensureServerReady = useCallback(async ({ force = false } = {}) => {
    if (!isLoggedIn) return;

    if (ensureInFlight.current && !force) return;
    ensureInFlight.current = true;
    const reqId = ++ensureReqId.current;

    setServerStatus('checking');

    try {
      const timeoutMs = 30000;
      await Promise.race([
        api.get('/offers', { timeout: 25000 }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Server check timeout')), timeoutMs),
        ),
      ]);

      if (ensureReqId.current === reqId) setServerStatus('ready');
    } catch (err) {
      if (ensureReqId.current === reqId) setServerStatus('error');
    } finally {
      if (ensureReqId.current === reqId) ensureInFlight.current = false;
    }
  }, [isLoggedIn]);

  const checkLogin = useCallback(async () => {
    setBooting(true);
    try {
      const val = await AsyncStorage.getItem('isLoggedIn');
      const token = await AsyncStorage.getItem('token');

      if (val === 'true' && token) {
        setIsLoggedIn(true);
      } else {
        ensureReqId.current += 1;
        ensureInFlight.current = false;
        setIsLoggedIn(false);
        setServerStatus('idle');
      }
    } catch (err) {
      ensureReqId.current += 1;
      ensureInFlight.current = false;
      setIsLoggedIn(false);
      setServerStatus('idle');
    } finally {
      setBooting(false);
    }
  }, [setIsLoggedIn]);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  useEffect(() => {
    if (!isLoggedIn) {
      ensureReqId.current += 1;
      ensureInFlight.current = false;
      setServerStatus('idle');
      return;
    }

    if (serverStatus === 'idle') {
      ensureServerReady();
    }
  }, [ensureServerReady, isLoggedIn, serverStatus]);

  // Smooth splash loader
  if (
    booting ||
    isLoggedIn === null ||
    (isLoggedIn && (serverStatus === 'idle' || serverStatus === 'checking'))
  ) {
    return (
      <Animated.View entering={FadeIn} style={styles.fullFlex}>
        <Loader />
      </Animated.View>
    );
  }

  if (isLoggedIn && serverStatus === 'error') {
    return <ServerErrorScreen onRetry={() => ensureServerReady({ force: true })} />;
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
            <Stack.Screen name="ItemDetails" component={ItemDetails} />
            <Stack.Screen
              name="RestaurantOrders"
              component={RestaurantOrders}
            />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Cart" component={Cart} />
          </>
        )}
      </Stack.Navigator>

      <Toast config={toastConfig} topOffset={56} bottomOffset={70} />
    </NavigationContainer>
  );
};

/* -------------------- ROOT APP -------------------- */

const App = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.fullFlex}>
        <UserProvider>
          <ConfirmProvider>
            <AppNavigation />
          </ConfirmProvider>
        </UserProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  fullFlex: {
    flex: 1,
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
