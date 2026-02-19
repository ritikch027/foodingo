import { useCallback, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';
import { UserContext } from '../utils/userContext';

export const useBanDetection = () => {
  const navigation = useNavigation();
  const { logout } = useContext(UserContext);
  const handleUserBanned = useCallback(async () => {
    try {
      await logout();

      Alert.alert('Account Suspended', 'Your account has been suspended.', [
        { text: 'OK' },
      ]);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.log('Error handling ban:', error);
    }
  }, [logout, navigation]);

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
  }, [handleUserBanned]);
};
