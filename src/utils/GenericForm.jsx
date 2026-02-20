import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Platform,
} from 'react-native';

import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import { colors, radii, spacing, typography, shadows, motion } from '../theme';

import ImagePickerComponent from './ImagePicker';

const AnimatedView = Animated.createAnimatedComponent(View);

const GenericForm = ({
  fields,
  onSubmit,
  submitLabel,
  headingTxt,
  footerLink,
  initialValues,
}) => {
  const insets = useSafeAreaInsets();
  const scrollContentStyle = useMemo(() => {
    return [styles.container, { paddingBottom: insets.bottom + 120 }];
  }, [insets.bottom]);

  const buildInitialFormData = useCallback(() => {
    return fields.reduce((acc, field) => {
      const provided = initialValues?.[field.name];
      acc[field.name] =
        provided !== undefined ? provided : field.type === 'image' ? null : '';
      return acc;
    }, {});
  }, [fields, initialValues]);

  const [formData, setFormData] = useState(() => buildInitialFormData());

  useEffect(() => {
    if (!initialValues) return;
    setFormData(buildInitialFormData());
  }, [buildInitialFormData, initialValues]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};

    fields.forEach(field => {
      const value = formData[field.name];

      if (field.required && (!value || value === '')) {
        newErrors[field.name] = 'Required field';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Submit Failed',
        text2: err?.message || 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field, index) => {
    if (field.type === 'dropdown') {
      return (
        <AnimatedView
          key={field.name}
          entering={FadeInDown.duration(motion.fadeDuration).delay(
            index * motion.fadeDelay,
          )}
          layout={Layout.springify()}
          style={styles.fieldCard}
        >
          <Text style={styles.label}>{field.label}</Text>
          <View style={styles.inputBox}>
            <Picker
              selectedValue={formData[field.name]}
              onValueChange={value => handleChange(field.name, value)}
            >
              <Picker.Item label={`Select ${field.label}`} value="" />
              {field.options?.map(option => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
          {errors[field.name] && (
            <Text style={styles.error}>{errors[field.name]}</Text>
          )}
        </AnimatedView>
      );
    }

    if (field.type === 'image') {
      return (
        <AnimatedView
          key={field.name}
          entering={FadeInDown.duration(motion.fadeDuration).delay(
            index * motion.fadeDelay,
          )}
          layout={Layout.springify()}
          style={styles.fieldCard}
        >
          <Text style={styles.label}>{field.label}</Text>

          <ImagePickerComponent
            onImageUploaded={image => handleChange(field.name, image)}
            onImageRemoved={() => handleChange(field.name, null)}
            initialImageUrl={formData[field.name]?.url}
          />

          {errors[field.name] && (
            <Text style={styles.error}>{errors[field.name]}</Text>
          )}
        </AnimatedView>
      );
    }

    return (
      <AnimatedView
        key={field.name}
        entering={FadeInDown.duration(motion.fadeDuration).delay(
          index * motion.fadeDelay,
        )}
        layout={Layout.springify()}
        style={styles.fieldCard}
      >
        <Text style={styles.label}>{field.label}</Text>

        <View style={styles.inputRow}>
          <Icon name="edit-3" size={18} color={colors.muted} />
          <TextInput
            placeholder={field.placeholder || field.label}
            value={formData[field.name]}
            onChangeText={value => handleChange(field.name, value)}
            secureTextEntry={field.type === 'password'}
            keyboardType={field.keyboardType || 'default'}
            style={styles.input}
            placeholderTextColor={colors.muted}
          />
        </View>

        {errors[field.name] && (
          <Text style={styles.error}>{errors[field.name]}</Text>
        )}
      </AnimatedView>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.fullFlex}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={scrollContentStyle}
        >
          {headingTxt ? <Text style={styles.heading}>{headingTxt}</Text> : null}

          {fields.map(renderField)}

          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.submitBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.submitText}>
              {isSubmitting ? 'Submitting...' : submitLabel}
            </Text>
          </Pressable>

          {/* Footer link (Login/Register switch) */}
          {footerLink && <View style={styles.footer}>{footerLink}</View>}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default GenericForm;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  fullFlex: {
    flex: 1,
  },
  container: {
    padding: spacing.lg,
    backgroundColor: colors.bg,
    flexGrow: 1,
  },

  heading: {
    ...typography.h1,
    marginBottom: spacing.lg,
    color: colors.text,
  },

  fieldCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    ...shadows.soft,
  },

  label: {
    ...typography.sub,
    marginBottom: spacing.xs,
    color: colors.text,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },

  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },

  inputBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },

  error: {
    marginTop: spacing.xs,
    color: colors.error,
    fontSize: 12,
  },

  submitBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radii.lg,
    alignItems: 'center',
  },

  submitText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: '700',
  },

  footer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
});
