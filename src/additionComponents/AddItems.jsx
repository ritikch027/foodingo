import React, { useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import GenericForm from '../utils/GenericForm';
import api from '../utils/api';
import { UserContext } from '../utils/userContext';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, typography, shadows, motion } from '../theme';

const AddItem = ({ navigation }) => {
  const { user, foodItems } = useContext(UserContext);
  const categories = foodItems.map(item => item.category);

  const fields = [
    {
      name: 'name',
      label: 'Item Name',
      placeholder: 'Enter item name',
      required: true,
    },
    {
      name: 'price',
      label: `Price (${'\u20B9'})`,
      placeholder: 'Enter item price',
      required: true,
      keyboardType: 'decimal-pad',
    },
    {
      name: 'discountPercent',
      label: 'Discount Percentage (0 - 100)',
      placeholder: 'Enter discount percentage',
      required: true,
      keyboardType: 'decimal-pad',
    },
    {
      name: 'image',
      label: 'Item Image',
      type: 'image',
      required: true,
      shape: 'square',
    },
    {
      name: 'category',
      label: 'Category',
      type: 'dropdown',
      required: true,
      options: categories,
    },
    {
      name: 'checkVeg',
      label: 'Veg or Non-Veg',
      type: 'dropdown',
      required: true,
      options: ['Veg', 'Non-Veg'],
    },
  ];

  const onSubmit = async formData => {
    const { name, price, category, checkVeg, discountPercent, image } = formData;

    if (!name?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter item name',
      });
      return;
    }

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

    if (!image?.url) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please upload an item image',
      });
      return;
    }

    const isVeg = checkVeg === 'Veg';

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
        image,
      };

      const res = await api.post(`/items/${user.restaurant}`, itemData);

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Item Added Successfully',
        });

        setTimeout(() => {
          navigation.replace('HomeWithDrawer');
        }, 500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: res.data.message || 'Item addition failed',
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
          <Icon name="package" size={30} color={colors.primary} />
        </View>
        <Text style={styles.title}>Add New Item</Text>
        <Text style={styles.subtitle}>
          Add delicious food items to your restaurant menu
        </Text>
      </Animated.View>

      {/* Form */}
      <GenericForm
        fields={fields}
        onSubmit={onSubmit}
        submitLabel="Add Item"
        headingTxt=""
        footerLink={null}
      />
    </View>
  );
};

export default AddItem;

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
