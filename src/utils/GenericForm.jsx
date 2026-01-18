import React, { useState } from 'react';
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

import ImagePickerComponent from './ImagePicker';

const AnimatedView = Animated.createAnimatedComponent(View);

const GenericForm = ({ fields, onSubmit, submitLabel, headingTxt }) => {
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState(() =>
    fields.reduce((acc, field) => {
      acc[field.name] = field.type === 'image' ? null : '';
      return acc;
    }, {}),
  );

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};

    fields.forEach(field => {
      const value = formData[field.name];
      if (field.required && (!value || value === '')) {
        newErrors[field.name] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill all required fields',
      });
      return;
    }

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
          entering={FadeInDown.delay(index * 80)}
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
          entering={FadeInDown.delay(index * 80)}
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
        entering={FadeInDown.delay(index * 80)}
        layout={Layout.springify()}
        style={styles.fieldCard}
      >
        <Text style={styles.label}>{field.label}</Text>

        <View
          style={[
            styles.inputRow,
            focusedField === field.name && styles.inputFocused,
          ]}
        >
          <Icon name="edit-3" size={18} color="#6b7280" />

          <TextInput
            placeholder={field.placeholder || field.label}
            value={formData[field.name]}
            onChangeText={value => handleChange(field.name, value)}
            secureTextEntry={field.type === 'password'}
            style={styles.input}
            onFocus={() => setFocusedField(field.name)}
            onBlur={() => setFocusedField(null)}
            placeholderTextColor="#9ca3af"
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
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>{headingTxt}</Text>

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
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default GenericForm;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  heading: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
    color: '#111827',
  },

  fieldCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 18,
    marginBottom: 14,
    elevation: 2,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#374151',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
  },

  inputFocused: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },

  inputBox: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },

  error: {
    marginTop: 6,
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },

  submitBtn: {
    marginTop: 30,
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
