import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import GenericForm from '../utils/GenericForm';
import api from '../utils/api';
import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { UserContext } from '../utils/userContext';
import { colors, radii, spacing, typography, shadows, motion } from '../theme';

const AddRestaurant = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const fields = [
    {
      name: 'name',
      label: 'Restaurant Name',
      placeholder: 'Enter restaurant name',
      required: true,
    },
    {
      name: 'location',
      label: 'Restaurant Location',
      placeholder: 'Enter restaurant location',
      required: true,
    },
    {
      name: 'image',
      label: 'Restaurant Banner',
      type: 'image',
      required: true,
      shape: 'banner',
    },
  ];

  const onSubmit = async formData => {
    const { name, location, image } = formData;

    if (!name?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter restaurant name',
      });
      return;
    }

    if (!location?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter restaurant location',
      });
      return;
    }

    if (!image?.url) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please upload restaurant banner image',
      });
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Authentication Error',
          text2: 'Please login again',
        });
        navigation.replace('Login');
        return;
      }

      const restaurantData = {
        name: name.trim(),
        location: location.trim(),
        image,
        owner: user._id,
      };

      const res = await api.post('/restaurants', restaurantData);

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Restaurant Created Successfully',
        });

        setTimeout(() => {
          navigation.replace('HomeWithDrawer');
        }, 400);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: res.data.message || 'Restaurant creation failed',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error?.response?.data?.message ||
          error?.message ||
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
        <View style={styles.iconWrap}>
          <Icon name="home" size={30} color={colors.primary} />
        </View>
        <Text style={styles.title}>Add Your Restaurant</Text>
        <Text style={styles.subtitle}>
          Create your restaurant profile and start selling food
        </Text>
      </Animated.View>

      {/* Form */}
      <GenericForm
        fields={fields}
        onSubmit={onSubmit}
        submitLabel="Create Restaurant"
        headingTxt=""
        footerLink={null}
      />
    </View>
  );
};

export default AddRestaurant;

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

  iconWrap: {
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
});
