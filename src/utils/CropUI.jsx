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
import { colors, radii, spacing, typography, shadows } from '../theme';

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
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.title}>Crop Image</Text>

        <View style={{ width: 26 }} />
      </View>

      {!uri && (
        <View style={styles.center}>
          <Ionicons name="image-outline" size={72} color={colors.muted} />
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
            }}
          />

          <View style={styles.footer}>
            <Pressable style={styles.secondaryBtn} onPress={pickImage}>
              <Text style={styles.secondaryText}>Change Image</Text>
            </Pressable>

            <Pressable style={styles.primaryBtn} onPress={saveCropped}>
              {loading ? (
                <ActivityIndicator color={colors.surface} />
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
    backgroundColor: colors.bg,
  },

  header: {
    height: 56,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
  },

  title: {
    ...typography.h3,
    color: colors.text,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },

  emptyText: {
    ...typography.sub,
    color: colors.muted,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },

  cropView: {
    flex: 1,
    margin: spacing.md,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
  },

  primaryText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },

  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.border,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
  },

  secondaryText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
});
