import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  Alert,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radii, spacing, typography, shadows } from '../theme';

const CLOUDINARY_CONFIG = {
  uploadPreset: 'unsigned_preset',
  cloudName: 'dv07xog2t',
};

const ImagePickerComponent = ({
  onImageUploaded,
  onImageRemoved,
  label = 'Upload Image',
  required = false,
  shape = 'square', // 'square' or 'banner'
  buttonStyle,
  previewStyle,
  initialImageUrl = null,
}) => {
  const [selectedImage, setSelectedImage] = useState(
    initialImageUrl ? { uri: initialImageUrl } : null,
  );
  const [isUploading, setIsUploading] = useState(false);

  /* ---------------- UPLOAD ---------------- */

  const uploadImage = async imageData => {
    try {
      setIsUploading(true);

      const formDataUpload = new FormData();
      formDataUpload.append('file', {
        uri: imageData.path || imageData.uri,
        type: imageData.mime || 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      });
      formDataUpload.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        formDataUpload,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        },
      );

      const cloudinaryUrl = response.data.secure_url;
      const cloudinaryPublicId = response.data.public_id;

      setSelectedImage({ uri: cloudinaryUrl });

      const image = {
        url: cloudinaryUrl,
        public_id: cloudinaryPublicId,
      };

      onImageUploaded?.(image);
      return image;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: error?.message || 'Failed to upload image',
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /* ---------------- PICK IMAGE ---------------- */

  const pickImage = async source => {
    try {
      let width = 800;
      let height = 800;

      if (shape === 'banner') {
        width = 1200;
        height = 700;
      }

      const pickerMethod =
        source === 'camera' ? ImagePicker.openCamera : ImagePicker.openPicker;

      const image = await pickerMethod({
        width,
        height,
        cropping: true,
        compressImageQuality: 0.8,
        mediaType: 'photo',
      });

      const imageData = {
        uri:
          Platform.OS === 'android' && !image.path.startsWith('file://')
            ? `file://${image.path}`
            : image.path,
        width: image.width,
        height: image.height,
        mime: image.mime,
        path: image.path,
      };

      await uploadImage(imageData);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to open image picker. Please try again.');
      }
    }
  };

  const showImagePicker = () => {
    Alert.alert('Select Image', 'Choose an option', [
      { text: 'Camera', onPress: () => pickImage('camera') },
      { text: 'Gallery', onPress: () => pickImage('gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    onImageRemoved?.();
  };

  /* ---------------- UI ---------------- */

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <Pressable
        style={[styles.imageBtn, buttonStyle]}
        onPress={showImagePicker}
        disabled={isUploading}
      >
        {isUploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        ) : (
          <View style={styles.btnRow}>
            <Ionicons
              name="cloud-upload-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.buttonText}>
              {selectedImage ? 'Change Image' : 'Select Image'}
            </Text>
          </View>
        )}
      </Pressable>

      {selectedImage && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: selectedImage.uri }}
            style={[styles.preview, previewStyle]}
          />

          <Pressable style={styles.removeBtn} onPress={handleRemoveImage}>
            <Ionicons name="close" size={16} color={colors.surface} />
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default ImagePickerComponent;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: spacing.lg,
  },

  label: {
    ...typography.sub,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  required: {
    color: colors.error,
  },

  imageBtn: {
    width: '100%',
    height: 52,
    backgroundColor: colors.tintAlt,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },

  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  uploadingText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },

  imageContainer: {
    position: 'relative',
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },

  preview: {
    width: 120,
    height: 120,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.bg,
  },

  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.soft,
  },
});
