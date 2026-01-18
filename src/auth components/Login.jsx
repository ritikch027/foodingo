import GenericForm from '../utils/GenericForm';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import api from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useContext } from 'react';
import { UserContext } from '../utils/userContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';

const Login = ({ navigation }) => {
  const { setIsLoggedIn, getCartData } = useContext(UserContext);

  const fields = [
    {
      name: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      required: true,
      keyboardType: 'email-address',
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
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
          text1: 'Welcome back!',
        });

        setTimeout(() => {
          setIsLoggedIn(true);
        }, 100);
      } else {
        Toast.show({
          type: 'error',
          text1: res.data.message || 'Login failed',
        });
      }
    } catch (error) {
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
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <View style={styles.logoWrap}>
          <Icon name="shopping-bag" size={36} color="#4f46e5" />
        </View>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Login to continue ordering delicious food
        </Text>
      </Animated.View>

      {/* Form */}
      <GenericForm
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel="Login"
        headingTxt=""
        footerLink={
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.footerLink}>Sign Up</Text>
            </Text>
          </Pressable>
        }
      />
    </View>
  );
};

export default Login;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  footerText: {
    fontSize: 14,
    marginTop: 20,
    color: '#6b7280',
    textAlign: 'center',
  },

  footerLink: {
    color: '#4f46e5',
    fontWeight: '700',
  },
});
