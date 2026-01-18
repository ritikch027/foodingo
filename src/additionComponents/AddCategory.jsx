import Toast from 'react-native-toast-message';
import GenericForm from '../utils/GenericForm';
import api from '../utils/api';
import { useContext } from 'react';
import { UserContext } from '../utils/userContext';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';

const AddCategory = ({ navigation }) => {
  const { fetchCategories } = useContext(UserContext);

  const fields = [
    {
      name: 'category',
      label: 'Category Name',
      placeholder: 'Enter category name',
      required: true,
    },
    {
      name: 'image',
      label: 'Category Image',
      type: 'image',
      required: true,
      shape: 'square',
    },
  ];

  const onSubmit = async formData => {
    const { category, image } = formData;

    if (!category?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a category name.',
      });
      return;
    }

    if (!image?.url) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please upload a category image.',
      });
      return;
    }

    try {
      const categoryData = {
        category: category.trim(),
        image,
      };

      const res = await api.post('/categories', categoryData);

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Category Added',
          text2: 'Your category has been created successfully.',
        });

        fetchCategories();

        setTimeout(() => {
          navigation.replace('HomeWithDrawer');
        }, 400);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: res.data.message || 'Category addition failed.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong.',
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View entering={FadeInDown} style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon name="tag" size={32} color="#4f46e5" />
        </View>
        <Text style={styles.title}>Add New Category</Text>
        <Text style={styles.subtitle}>
          Create a new food category for your platform
        </Text>
      </Animated.View>

      {/* Form */}
      <GenericForm
        fields={fields}
        onSubmit={onSubmit}
        submitLabel="Add Category"
        headingTxt=""
        footerLink={null}
      />
    </View>
  );
};

export default AddCategory;

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
