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
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';
import ImagePickerComponent from '../utils/ImagePicker';

const GenericForm = ({
  fields,
  onSubmit,
  submitLabel,
  headingTxt,
  footerLink,
}) => {
  const [formData, setFormData] = useState(() =>
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]: field.type === 'image' ? null : '',
      }),
      {},
    ),
  );

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};

    fields.forEach(field => {
      const value = formData[field.name];

      if (
        field.required &&
        (!value ||
          (field.type === 'image' ? !value?.url : !value.toString().trim()))
      ) {
        newErrors[field.name] =
          field.type === 'image'
            ? 'Please select an image'
            : 'This field is required';
      }

      if (
        field.name === 'email' &&
        value?.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        newErrors.email = 'Invalid email format';
      }

      if (
        field.name === 'phone' &&
        value?.trim() &&
        !/^[6-9]\d{9}$/.test(value)
      ) {
        newErrors.phone = 'Invalid phone number';
      }

      if (field.name === 'confirmPassword' && value !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const dataToSubmit = { ...formData };
      await onSubmit(dataToSubmit);
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

  const handleImageUploaded = (fieldName, imageData) => {
    // imageData = { url, public_id }
    handleChange(fieldName, imageData);
  };

  const handleImageRemoved = fieldName => {
    handleChange(fieldName, null);
  };

  const renderField = (field, index) => {
    if (field.type === 'image') {
      return (
        <View key={field.name} style={styles.fieldBlock}>
          <Text style={styles.label}>
            {field.label || 'Upload Image'}
            {field.required && <Text style={styles.required}> *</Text>}
          </Text>
          <View style={styles.imageContainer}>
            <ImagePickerComponent
              onImageUploaded={imageData =>
                handleImageUploaded(field.name, imageData)
              }
              onImageRemoved={() => handleImageRemoved(field.name)}
              label={field.label || 'Upload Image'}
              required={field.required}
              shape={field.shape || 'square'}
              initialImageUrl={formData[field.name]?.url}
              previewStyle={field.previewStyle}
              buttonStyle={field.buttonStyle}
            />
          </View>
          {errors[field.name] && (
            <Text style={styles.error}>{errors[field.name]}</Text>
          )}
        </View>
      );
    }

    if (field.type === 'dropdown') {
      return (
        <View key={field.name} style={styles.fieldBlock}>
          <Text style={styles.label}>
            {field.label}
            {field.required && <Text style={styles.required}> *</Text>}
          </Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Icon
                name="chevron-down"
                size={20}
                color="#4b0082"
                style={styles.inputIcon}
              />
              <Picker
                selectedValue={formData[field.name]}
                onValueChange={value => handleChange(field.name, value)}
                style={styles.picker}
              >
                <Picker.Item label={`Select ${field.label}`} value="" />
                {field.options?.map(option => (
                  <Picker.Item key={option} label={option} value={option} />
                ))}
              </Picker>
            </View>
          </View>
          {errors[field.name] && (
            <Text style={styles.error}>{errors[field.name]}</Text>
          )}
        </View>
      );
    }

    const getFieldIcon = type => {
      switch (type) {
        case 'email':
          return 'mail';
        case 'password':
          return 'lock';
        case 'phone':
          return 'phone';
        default:
          return 'edit-3';
      }
    };

    return (
      <View key={index} style={styles.fieldBlock}>
        <Text style={styles.label}>
          {field.label}
          {field.required && <Text style={styles.required}> *</Text>}
        </Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Icon
              name={getFieldIcon(field.type)}
              size={20}
              color="#4b0082"
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={field.placeholder}
              style={styles.input}
              placeholderTextColor="#9ca3af"
              keyboardType={field.keyboardType || 'default'}
              secureTextEntry={
                field.type === 'password' && !showPassword[field.name]
              }
              value={formData[field.name]}
              onChangeText={text => handleChange(field.name, text)}
            />
            {field.type === 'password' && (
              <Pressable
                onPress={() =>
                  setShowPassword(prev => ({
                    ...prev,
                    [field.name]: !prev[field.name],
                  }))
                }
                style={styles.passwordToggle}
              >
                <Icon
                  name={showPassword[field.name] ? 'eye' : 'eye-off'}
                  size={20}
                  color="#4b0082"
                />
              </Pressable>
            )}
          </View>
        </View>
        {errors[field.name] && (
          <Text style={styles.error}>{errors[field.name]}</Text>
        )}
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.heading}>{headingTxt}</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>{fields.map(renderField)}</View>

          {/* Footer Link */}
          {footerLink && (
            <View style={styles.footerLinkSection}>{footerLink}</View>
          )}

          {/* Submit Button */}
          <View style={styles.buttonSection}>
            <Pressable
              style={[
                styles.submitButton,
                isSubmitting && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Icon
                name={isSubmitting ? 'loader' : 'check-circle'}
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Submitting...' : submitLabel}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerSection: {
    backgroundColor: 'rgb(245, 230, 215)',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4b0082',
    textAlign: 'center',
  },
  formSection: {
    flex: 1,
  },
  fieldBlock: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b0082',
    marginBottom: 8,
    marginLeft: 4,
  },
  required: {
    color: '#ef4444',
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    minHeight: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
  },
  passwordToggle: {
    padding: 4,
  },
  picker: {
    flex: 1,
    color: '#333',
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  footerLinkSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonSection: {
    marginTop: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4b0082',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GenericForm;
