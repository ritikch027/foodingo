import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import GenericForm from '../utils/GenericForm';
import api from '../utils/api';
import React from 'react';

const AddRestaurant = ({ navigation }) => {
  const fields = [
    {
      name: 'name',
      label: 'Enter Name of Restaurant',
      placeholder: 'Name',
      required: true,
    },
    {
      name: 'location',
      label: 'Enter Location',
      placeholder: 'Location',
      required: true,
    },
    {
      name: 'image',
      type: 'image', // ✅ this enables the picker logic
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
        text2: 'Please enter item name',
      });
      return;
    }
    if (!location?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter Location',
      });
      return;
    }
    if (!image.url || (typeof image.url === 'string' && !image.url.trim())) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select an image',
      });
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const restaurantData = {
        name: name.trim(),
        location: location.trim(),
        image: image,
      };
      const res = await api.post('/restaurants', restaurantData, {
        headers: {
          authorization: token,
        },
      });

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Restaurant created successfully',
        });
        setTimeout(() => {
          navigation.replace('HomeWithDrawer');
        }, 50);
      } else {
        const msg1 = res.data.message || 'Restaurant creation failed';
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: msg1,
        });
      }
    } catch (error) {
      const msg = error?.response?.data?.message || 'Something went wrong';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: msg,
      });
    }
  };

  return (
    <GenericForm
      fields={fields}
      onSubmit={onSubmit}
      submitLabel="Add"
      headingTxt="Add Your Restaurant"
      footerLink={null}
    />
  );
};

export default AddRestaurant;
