import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { CropView } from 'react-native-image-crop-tools';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function MyCropScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const cropRef = useRef(null);
  const [uri, setUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, res => {
      if (res.assets?.[0]?.uri) setUri(res.assets[0].uri);
    });
  };

  const saveCropped = () => {
    if (!cropRef.current) return;
    setLoading(true);
    cropRef.current.saveImage(true, 90);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#111827" />
        </Pressable>

        <Text style={styles.title}>Crop Image</Text>

        <View style={{ width: 26 }} />
      </View>

      {!uri && (
        <View style={styles.center}>
          <Ionicons name="image-outline" size={80} color="#9ca3af" />
          <Text style={styles.emptyText}>Choose an image to crop</Text>

          <Pressable style={styles.primaryBtn} onPress={pickImage}>
            <Text style={styles.primaryText}>Pick Image</Text>
          </Pressable>
        </View>
      )}

      {uri && (
        <>
          <CropView
            sourceUrl={uri}
            style={styles.cropView}
            ref={cropRef}
            keepAspectRatio
            aspectRatio={{ width: 1, height: 1 }}
            onImageCrop={res => {
              setLoading(false);
              console.log('cropped URI:', res.uri);
              // You can navigate back or upload here
            }}
          />

          <View style={styles.footer}>
            <Pressable style={styles.secondaryBtn} onPress={pickImage}>
              <Text style={styles.secondaryText}>Change Image</Text>
            </Pressable>

            <Pressable style={styles.primaryBtn} onPress={saveCropped}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>Crop & Save</Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  header: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 24,
  },

  cropView: {
    flex: 1,
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  secondaryBtn: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  secondaryText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 16,
  },
});
