import React, { useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import GenericForm from '../utils/GenericForm';
import api from '../utils/api';
import { UserContext } from '../utils/userContext';

const AddItem = ({ navigation }) => {
  const { user, foodItems } = useContext(UserContext);
  const categories = foodItems.map(item => item.category);
  const fields = [
    {
      name: 'name',
      label: 'Enter Name of item',
      placeholder: 'Name',
      required: true,
    },
    {
      name: 'price',
      label: 'Enter Price (₹)',
      placeholder: 'Enter item price',
      required: true,
      keyboardType: 'decimal-pad',
    },
    {
      name: 'discountPercent',
      label: 'Enter Discount Percent (0-100)',
      placeholder: 'Enter discount percentage',
      required: true,
      keyboardType: 'decimal-pad',
    },
    {
      name: 'image',
      type: 'image', // ✅ this enables the picker logic
      required: true,
      shape: 'square',
    },
    {
      name: 'category',
      label: ' Category',
      type: 'dropdown',
      required: true,
      options: categories, // replace with dynamic or static options
    },
    {
      name: 'checkVeg',
      label: 'Veg or non-Veg',
      type: 'dropdown',
      required: true,
      options: ['Veg', 'Non-Veg'], // replace with dynamic or static options
    },
  ];

  const onSubmit = async formData => {
    const { name, price, category, checkVeg, discountPercent, image } =
      formData;

    if (!name?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter item name',
      });
      return;
    }

    if (!price || price.toString().trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter item price',
      });
      return;
    }
    if (!discountPercent || discountPercent.toString().trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter discount percentage',
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
    // Validate numeric fields
    const isVeg = checkVeg === 'Veg' ? true : false;
    const priceNum = parseFloat(price.toString().replace(/[^0-9.]/g, ''));
    const discountNum = parseFloat(
      discountPercent.toString().replace(/[^0-9.]/g, ''),
    );

    if (isNaN(priceNum) || priceNum <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Price',
        text2: 'Please enter a valid price greater than 0',
      });
      return;
    }

    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Discount',
        text2: 'Please enter a discount between 0 and 100',
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
        navigation.replace('Login'); // Adjust route name as needed
        return;
      }

      if (!user?.restaurant) {
        Toast.show({
          type: 'error',
          text1: 'Restaurant Error',
          text2: 'Restaurant information not found',
        });
        return;
      }

      const itemData = {
        name: name.trim(),
        price: priceNum,
        category,
        isVeg,
        discountPercent: discountNum,
        image: image, // ✅ this should be a Cloudinary image URL string
      };

      const res = await api.post(`/items/${user.restaurant}`,itemData, {
        headers: {
          authorization: token,
        },
      });

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Item added successfully',
        });

        // Navigate back after a short delay
        setTimeout(() => {
          navigation.replace('HomeWithDrawer');
        }, 500);
      } else {
        const msg1 = res.data.message || 'Item addition failed';
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: msg1,
        });
      }
    } catch (error) {
      let errorMessage = 'Something went wrong';

      if (error?.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
        // Optionally navigate to login
        // navigation.replace('Login');
      } else if (error?.response?.status === 403) {
        errorMessage = 'You are not authorized to perform this action.';
      } else if (error?.response?.status === 400) {
        errorMessage =
          error?.response?.data?.message || 'Invalid data provided.';
      } else if (error?.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error?.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Something went wrong';
      }

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    }
  };

  return (
    <GenericForm
      fields={fields}
      onSubmit={onSubmit}
      submitLabel="Add Item"
      headingTxt="Add Item to Your Restaurant"
      footerLink={null}
    />
  );
};

export default AddItem;
