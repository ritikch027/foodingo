import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';
import api from '../utils/api';
import { UserContext } from '../utils/userContext';
import { colors, radii, spacing, typography, shadows } from '../theme';

const getOwnerId = restaurant => {
  const rawOwner = restaurant?.owner;
  if (typeof rawOwner === 'string') return rawOwner;
  if (rawOwner && typeof rawOwner === 'object') return rawOwner?._id;
  return null;
};

const RestaurantDetails = ({ route, navigation }) => {
  const { user: currentUser } = React.useContext(UserContext);
  const [restaurant, setRestaurant] = useState(route?.params?.restaurant || null);
  const [loading, setLoading] = useState(false);
  const [ownerUser, setOwnerUser] = useState(null);

  useEffect(() => {
    setRestaurant(route?.params?.restaurant || null);
  }, [route?.params?.restaurant]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('AdminManagement');
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [navigation]),
  );

  useEffect(() => {
    const ownerId = getOwnerId(restaurant);
    if (!ownerId) {
      setOwnerUser(null);
      return;
    }

    const loadOwner = async () => {
      try {
        const res = await api.get('/admin/users');
        const users = res?.data?.users || [];
        const matched = users.find(u => u?._id === ownerId) || null;
        setOwnerUser(matched);
      } catch {
        setOwnerUser(null);
      }
    };

    loadOwner();
  }, [restaurant]);

  const ownerName = useMemo(
    () =>
      restaurant?.ownerNameResolved ||
      restaurant?.owner?.name ||
      restaurant?.ownerName ||
      ownerUser?.name ||
      '-',
    [restaurant, ownerUser],
  );

  const ownerPhone = useMemo(
    () =>
      restaurant?.ownerPhoneResolved ||
      restaurant?.owner?.phone ||
      restaurant?.ownerPhone ||
      restaurant?.phone ||
      ownerUser?.phone ||
      '-',
    [restaurant, ownerUser],
  );

  const handleDelete = () => {
    if (!restaurant?._id) return;

    Alert.alert(
      'Delete Restaurant',
      `Delete "${restaurant?.name || 'this restaurant'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/admin/restaurants/${restaurant._id}`);
              Toast.show({
                type: 'success',
                text1: 'Restaurant deleted',
              });
              navigation.navigate('AdminManagement');
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Delete failed',
                text2: error?.response?.data?.message || 'Please try again',
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  if (currentUser?.role !== 'admin') {
    return (
      <View style={styles.centerWrap}>
        <Icon name="lock" size={28} color={colors.muted} />
        <Text style={styles.centerText}>Only admins can access this page</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.centerWrap}>
        <Text style={styles.centerText}>Restaurant details not available</Text>
      </View>
    );
  }

  const initial = String(restaurant?.name || 'R').trim().charAt(0).toUpperCase();

  return (
    <View style={styles.screen}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => navigation.navigate('AdminManagement')}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}
        >
          <Icon name="arrow-left" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.heading}>Restaurant Details</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.restaurantHeader}>
          <View style={styles.restaurantAvatar}>
            <Text style={styles.restaurantAvatarText}>{initial}</Text>
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>{restaurant?.name || 'Unnamed restaurant'}</Text>
            <View style={styles.typeChip}>
              <Text style={styles.typeChipText}>Restaurant</Text>
            </View>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Icon name="map-pin" size={14} color={colors.primary} />
          <Text style={styles.metaText}>{restaurant?.location || '-'}</Text>
        </View>

        <View style={styles.metaRow}>
          <Icon name="user" size={14} color={colors.primary} />
          <Text style={styles.metaText}>{ownerName}</Text>
        </View>

        <View style={styles.metaRow}>
          <Icon name="phone" size={14} color={colors.primary} />
          <Text style={styles.metaText}>{ownerPhone}</Text>
        </View>

        <Pressable
          onPress={handleDelete}
          disabled={loading}
          style={({ pressed }) => [
            styles.deleteBtn,
            (pressed || loading) && { opacity: 0.85 },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <Text style={styles.deleteText}>Delete Restaurant</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default RestaurantDetails;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  heading: {
    ...typography.h2,
    color: colors.text,
  },
  card: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.soft,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  restaurantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.tintAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantAvatarText: {
    ...typography.sub,
    color: colors.primary,
    fontWeight: '800',
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  typeChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: colors.tint,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  typeChipText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  metaText: {
    ...typography.sub,
    color: colors.muted,
    flex: 1,
  },
  deleteBtn: {
    marginTop: spacing.lg,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: colors.tintAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 14,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
  },
  centerText: {
    ...typography.sub,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
