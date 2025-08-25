import Toast from 'react-native-toast-message';
import GenericForm from '../utils/GenericForm';
import api from '../utils/api';
import { useContext } from 'react';
import { UserContext } from '../utils/userContext';
import React from 'react';

const AddCategory = ({ navigation }) => {
  const { fetchCategories } = useContext(UserContext);
  const fields = [
    {
      name: 'category',
      label: 'Enter Category',
      placeholder: 'Category',
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

    if (!image.url || typeof image.url !== 'string') {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select an image.',
      });
      return;
    }

    try {
      const categoryData = {
        category: category.trim(),
        image: image,
      };

      const res = await api.post('/categories', categoryData);

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Category added successfully.',
        });
        fetchCategories();
        setTimeout(() => {
          navigation.replace('HomeWithDrawer');
        }, 300);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: res.data.message || 'Category addition failed.',
        });
      }
    } catch (error) {
      console.log('API error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Something went wrong.',
      });
    }
  };

  return (
    <GenericForm
      fields={fields}
      onSubmit={onSubmit}
      submitLabel="Add Category"
      headingTxt="Add a New Category"
      footerLink={null}
    />
  );
};

export default AddCategory;
