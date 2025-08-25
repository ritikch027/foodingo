import GenericForm from '../utils/GenericForm';
import { Text, Pressable } from 'react-native';
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useContext } from 'react';
import { UserContext } from '../utils/userContext';

const Login = ({ navigation }) => {
  const { setIsLoggedIn, getCartData } = useContext(UserContext);

  const fields = [
    {
      name: 'email',
      label: 'Enter Email',
      placeholder: 'E-mail',
      required: true,
      keyboardType: 'email-address',
    },
    {
      name: 'password',
      label: 'Enter Password',
      placeholder: 'Password',
      type: 'password',
      required: true,
    },
  ];

  const handleSubmit = async ({ email, password }) => {
    try {
      const res = await api.post('/login-user', { email, password });

      if (res.data.success) {
        await AsyncStorage.setItem('token', res.data.token);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await getCartData();
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
        });

        // Add delay before navigation change
        setTimeout(() => {
          setIsLoggedIn(true);
        }, 50); // Give time for success message to show
      } else {
        Toast.show({
          type: 'error',
          text1: res.data.message || 'Login failed',
        });
      }
    } catch (error) {
      console.log('Login error:', error);

      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2:
          error?.response?.data?.message ||
          error.message ||
          'Something went wrong',
      });
    }
  };
  return (
    <GenericForm
      fields={fields}
      onSubmit={handleSubmit}
      submitLabel="Login"
      headingTxt="Login"
      footerLink={
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={{ fontSize: 14, marginTop: 10, color: '#3E3E3E' }}>
            Don't have an account?{' '}
            <Text style={{ color: '#D86C4E', fontSize: 14, fontWeight: '500' }}>
              Sign Up
            </Text>
          </Text>
        </Pressable>
      }
    />
  );
};

export default Login;
