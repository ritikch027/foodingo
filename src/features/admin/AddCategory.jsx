import Toast from 'react-native-toast-message';
import GenericForm from '../../shared/GenericForm';
import api from '../../lib/api';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { colors, spacing, typography, shadows, motion } from '../../theme';

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
      <View style={styles.topBar} />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(motion.fadeDuration)}
        style={styles.header}
      >
        <View style={styles.iconWrap}>
          <Icon name="tag" size={30} color={colors.primary} />
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
    backgroundColor: colors.bg,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
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
