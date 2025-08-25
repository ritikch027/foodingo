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
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';

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
      // ✅ Send both URL and public_id back to the form
      onImageUploaded?.(image);

      return { cloudinaryUrl, cloudinaryPublicId };
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

      // Upload to Cloudinary
      await uploadImage(imageData);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', `Failed to open ${source}. Please try again.`);
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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={{ color: 'red' }}> *</Text>}
          </Text>

          <Pressable
            style={[styles.imageBtn, buttonStyle]}
            onPress={showImagePicker}
            disabled={isUploading}
          >
            {isUploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color="#666" />
                <Text style={styles.uploadingText}>Uploading...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>
                {selectedImage ? 'Change Image' : 'Select Image'}
              </Text>
            )}
          </Pressable>

          {selectedImage && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={[styles.preview, previewStyle]}
              />
              <Pressable style={styles.removeBtn} onPress={handleRemoveImage}>
                <Text style={styles.removeText}>×</Text>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: '5%',
    fontSize: 16,
    color: '#3E3E3E',
    marginBottom: 10,
  },
  imageBtn: {
    width: '90%',
    height: 50,
    backgroundColor: '#E6E6E6',
    borderWidth: 1,
    borderColor: '#A3B18A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#444',
    fontSize: 16,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  uploadingText: {
    color: '#666',
    fontSize: 16,
  },
  imageContainer: {
    position: 'relative',
    marginTop: 15,
  },
  preview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#A3B18A',
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ImagePickerComponent;
