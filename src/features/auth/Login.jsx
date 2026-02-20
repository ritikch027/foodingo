import GenericForm from '../../shared/GenericForm';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import api from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, typography, shadows, motion } from '../../theme';

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
      <Animated.View
        entering={FadeInDown.duration(motion.fadeDuration)}
        style={styles.header}
      >
        <View style={styles.logoWrap}>
          <Icon name="shopping-bag" size={32} color={colors.primary} />
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
    backgroundColor: colors.bg,
  },

  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },

  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.tintAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.soft,
  },

  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...typography.sub,
    color: colors.muted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },

  footerText: {
    ...typography.sub,
    marginTop: spacing.lg,
    color: colors.muted,
    textAlign: 'center',
  },

  footerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
