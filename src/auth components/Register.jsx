import GenericForm from '../utils/GenericForm';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import api from '../utils/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { colors, spacing, typography, shadows, motion } from '../theme';

const Register = ({ navigation }) => {
  const fields = [
    {
      name: 'name',
      label: 'Full Name',
      placeholder: 'Enter your name',
      required: true,
    },
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
      placeholder: 'Create a password',
      type: 'password',
      required: true,
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      type: 'password',
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone Number',
      placeholder: 'Enter phone number',
      required: true,
      keyboardType: 'numeric',
    },
  ];

  const handleSubmit = async data => {
    try {
      if (data.password !== data.confirmPassword) {
        Toast.show({
          type: 'error',
          text1: 'Passwords do not match',
        });
        return;
      }

      const res = await api.post('/register', data);

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Account created successfully!',
        });

        navigation.replace('Login');
      } else {
        Toast.show({
          type: 'error',
          text1: res.data.message || 'Registration failed',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Registration Error',
        text2: 'Something went wrong. Please try again.',
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
          <Icon name="user-plus" size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Sign up to start ordering delicious food
        </Text>
      </Animated.View>

      {/* Form */}
      <GenericForm
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel="Register"
        headingTxt=""
        footerLink={
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.footerLink}>Sign In</Text>
            </Text>
          </Pressable>
        }
      />
    </View>
  );
};

export default Register;

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
