import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import api from '../../lib/api';
import GenericForm from '../../shared/GenericForm';
import { UserContext } from '../../context/userContext';
import { colors, spacing, typography, shadows } from '../../theme';

const normalizeImage = image => {
  if (!image) return null;
  if (typeof image === 'string') return { url: image };
  if (typeof image === 'object' && image.url) return image;
  return null;
};

const tryRestaurantUpdate = async ({ restaurantId, payload }) => {
  const attempts = [
    { method: 'patch', url: `/restaurants/${restaurantId}` },
    { method: 'put', url: `/restaurants/${restaurantId}` },
    { method: 'patch', url: `/restaurant/update/${restaurantId}` },
    { method: 'put', url: `/restaurant/update/${restaurantId}` },
  ];

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const res = await api[attempt.method](attempt.url, payload);
      return res;
    } catch (err) {
      lastError = err;
      const code = err?.response?.status;
      if (code === 404 || code === 405) continue;
    }
  }

  throw lastError || new Error('Update failed');
};

const OwnerRestaurantEdit = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(UserContext);
  const restaurantId = user?.restaurant;

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = useCallback(async () => {
    if (!restaurantId) {
      setRestaurant(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/restaurants');
      const found =
        res?.data?.restaurants?.find(r => r?._id === restaurantId) || null;
      setRestaurant(found);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load restaurant',
        text2: err?.response?.data?.message || 'Please try again',
      });
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const fields = useMemo(
    () => [
      {
        name: 'name',
        label: 'Restaurant Name',
        placeholder: 'Enter restaurant name',
        required: true,
      },
      {
        name: 'location',
        label: 'Restaurant Location',
        placeholder: 'Enter restaurant location',
        required: true,
      },
      {
        name: 'image',
        label: 'Restaurant Banner',
        type: 'image',
        required: true,
        shape: 'banner',
      },
    ],
    [],
  );

  const initialValues = useMemo(() => {
    if (!restaurant) return null;
    return {
      name: String(restaurant?.name || ''),
      location: String(restaurant?.location || ''),
      image: normalizeImage(restaurant?.image),
    };
  }, [restaurant]);

  const onSubmit = useCallback(
    async formData => {
      if (!restaurantId) {
        Toast.show({ type: 'error', text1: 'No restaurant found for owner' });
        return;
      }

      const name = String(formData?.name || '').trim();
      const location = String(formData?.location || '').trim();
      const image = normalizeImage(formData?.image);

      if (!name) {
        Toast.show({ type: 'error', text1: 'Please enter restaurant name' });
        return;
      }

      if (!location) {
        Toast.show({ type: 'error', text1: 'Please enter restaurant location' });
        return;
      }

      if (!image?.url) {
        Toast.show({
          type: 'error',
          text1: 'Please upload restaurant banner image',
        });
        return;
      }

      try {
        const payload = { name, location, image };
        await tryRestaurantUpdate({ restaurantId, payload });
        Toast.show({ type: 'success', text1: 'Restaurant updated' });
        navigation.goBack();
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Update failed',
          text2: err?.response?.data?.message || err?.message || 'Please try again',
        });
      }
    },
    [navigation, restaurantId],
  );

  if (!restaurantId) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
          >
            <Icon name="arrow-left" size={18} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.emptyWrap}>
          <Icon name="home" size={30} color={colors.muted} />
          <Text style={styles.emptyTitle}>No restaurant yet</Text>
          <Text style={styles.emptyText}>
            Create your restaurant first, then you can edit details here.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('AddRestaurant')}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}
          >
            <Text style={styles.primaryBtnText}>Create Restaurant</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.topRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
          >
            <Icon name="arrow-left" size={18} color={colors.text} />
          </Pressable>
          <Text style={styles.heading}>Restaurant Details</Text>
          <Pressable
            onPress={fetchRestaurant}
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
          >
            <Icon name="refresh-cw" size={18} color={colors.text} />
          </Pressable>
        </View>
        <Text style={styles.subHeading}>Update name, location and banner</Text>
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading restaurant...</Text>
        </View>
      ) : (
        <GenericForm
          fields={fields}
          initialValues={initialValues}
          onSubmit={onSubmit}
          submitLabel="Save Changes"
          headingTxt=""
          footerLink={null}
        />
      )}
    </View>
  );
};

export default OwnerRestaurantEdit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  subHeading: {
    ...typography.sub,
    color: colors.muted,
    marginTop: 2,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  loaderText: {
    marginTop: spacing.sm,
    ...typography.sub,
    color: colors.muted,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    marginTop: spacing.sm,
    ...typography.h2,
    color: colors.text,
  },
  emptyText: {
    marginTop: spacing.xs,
    ...typography.sub,
    color: colors.muted,
    textAlign: 'center',
  },
  primaryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 999,
  },
  primaryBtnText: {
    ...typography.sub,
    color: colors.surface,
    fontWeight: '800',
  },
});
