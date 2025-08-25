import { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';
import { useContext } from 'react';
import { UserContext } from '../utils/userContext';

export const useBanDetection = () => {
  const navigation = useNavigation();
  const setIsLoggedIn = useContext(UserContext);
  const handleUserBanned = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await setIsLoggedIn(false);

      Alert.alert('Account Suspended', 'Your account has been suspended.', [
        { text: 'OK' },
      ]);

      navigation.reset({
        index: 0,
        routes: [{ name: 'login' }],
      });
    } catch (error) {
      console.log('Error handling ban:', error);
    }
  };

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      response => response,
      async error => {
        if (
          error.response?.status === 403 &&
          error.response?.data?.reason === 'user_banned'
        ) {
          await handleUserBanned(error.response.data);
        }
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);
};
