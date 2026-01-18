import GenericForm from '../utils/GenericForm';
import { Text, Pressable, View, StyleSheet } from 'react-native';
import api from '../utils/api';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';

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
      <Animated.View entering={FadeInDown} style={styles.header}>
        <View style={styles.logoWrap}>
          <Icon name="user-plus" size={36} color="#4f46e5" />
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
