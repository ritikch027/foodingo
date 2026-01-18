import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import GenericForm from '../utils/GenericForm';
import api from '../utils/api';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';

const AddRestaurant = ({ navigation }) => {
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
      };

      const res = await api.post('/restaurants', restaurantData, {
        headers: {
          authorization: token,
        },
      });

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
      <Animated.View entering={FadeInDown} style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon name="home" size={32} color="#4f46e5" />
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
    backgroundColor: '#f9fafb',
  },

  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  iconWrap: {
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
});
