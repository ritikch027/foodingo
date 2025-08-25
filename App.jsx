import { ActivityIndicator, View, StatusBar, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
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
import RestaurantItems from './src/components/RestaurantItems';
import Toast from 'react-native-toast-message';
import { UserProvider, UserContext } from './src/utils/userContext';
import { useContext } from 'react';

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(UserContext);

  useEffect(() => {
    const checkLogin = async () => {
      const val = await AsyncStorage.getItem('isLoggedIn');
      const token = await AsyncStorage.getItem('token');

      if (val === 'true' && token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, []);

  if (isLoggedIn === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#D86C4E" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
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
            <Stack.Screen name="RestaurantItems" component={RestaurantItems} />
            <Stack.Screen name="Cart" component={Cart} />
          </>
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
};

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

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default App;
