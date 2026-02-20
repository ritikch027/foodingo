import React, { useContext, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import api from '../../lib/api';
import { UserContext } from '../../context/userContext';
import ImagePickerComponent from '../../shared/ImagePicker';
import { colors, radii, spacing, typography, shadows } from '../../theme';

const Settings = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);

  const [name, setName] = useState(user?.name || '');
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const initialImageUrl = useMemo(
    () => image?.url || user?.image_url || null,
    [image, user?.image_url],
  );

  const updateProfile = async payload => {
    let lastError;
    try {
      const res = await api.put('/update-profile', payload);
      return res;
    } catch (error) {
      lastError = error;
    }
    throw lastError;
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Toast.show({
        type: 'error',
        text1: 'Name is required',
      });
      return;
    }

    const payload = {
      name: trimmedName,
      image_url: image?.url || user?.image_url || '',
      ...(user?.email ? { email: user.email } : {}),
      ...(user?.phone ? { phone: user.phone } : {}),
    };

    try {
      setSaving(true);
      const res = await updateProfile(payload);
      const incomingUser =
        res?.data?.user ||
        res?.data?.updatedUser ||
        (res?.data && typeof res.data === 'object' ? res.data : null);

      if (incomingUser && incomingUser._id) {
        setUser(incomingUser);
      } else {
        setUser(prev => ({ ...prev, ...payload }));
      }

      Toast.show({
        type: 'success',
        text1: 'Profile updated',
      });
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Update failed',
        text2:
          error?.response?.data?.message ||
          'Could not update profile right now',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.backBtnPlaceholder} />
          <Text style={styles.title}>Settings</Text>
          <View style={styles.backBtnPlaceholder} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Update Profile</Text>

          <ImagePickerComponent
            label="Profile Photo"
            shape="square"
            initialImageUrl={initialImageUrl}
            onImageUploaded={img => setImage(img)}
            onImageRemoved={() => setImage(null)}
          />

          <Text style={styles.label}>Name</Text>
          <View style={styles.inputWrap}>
            <Icon name="user" size={18} color={colors.muted} />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.muted}
              style={styles.input}
              maxLength={60}
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveBtn,
              (pressed || saving) && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  backBtnPlaceholder: {
    width: 36,
    height: 36,
  },
  pressed: {
    opacity: 0.8,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.sub,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  input: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  saveBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  saveBtnText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  loadingText: {
    ...typography.sub,
    color: colors.muted,
  },
});
