import React, { useContext, useMemo } from 'react';
import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { UserContext } from '../utils/userContext';
import api from '../utils/api';
import Toast from 'react-native-toast-message';
import { colors, radii, spacing, typography, shadows } from '../theme';

const OwnerHome = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useContext(UserContext);
  const firstName = user?.name?.trim()?.split(/\s+/)?.[0] || 'Owner';

  const handleDeleteRestaurant = () => {
    if (!user?.restaurant) return;

    Alert.alert(
      'Delete Restaurant',
      'Are you sure you want to delete your restaurant? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/restaurant/delete/${user.restaurant}`);
              Toast.show({
                type: 'success',
                text1: 'Restaurant deleted successfully',
              });
              navigation.replace('HomeWithDrawer');
            } catch (err) {
              Toast.show({
                type: 'error',
                text1: 'Delete failed',
                text2: 'Could not delete restaurant',
              });
            }
          },
        },
      ],
    );
  };

  const cards = useMemo(() => {
    const hasRestaurant = Boolean(user?.restaurant);
    const base = [
      {
        key: 'orders',
        title: 'Orders',
        subtitle: 'Track and update live orders',
        icon: 'clipboard',
        onPress: () => navigation.navigate('RestaurantOrders'),
        disabled: !hasRestaurant,
      },
      {
        key: 'manage',
        title: 'Manage Items',
        subtitle: 'Edit prices, discounts, photos',
        icon: 'edit-3',
        onPress: () => navigation.navigate('OwnerItemsDashboard'),
        disabled: !hasRestaurant,
      },
      {
        key: 'addItem',
        title: 'Add Item',
        subtitle: 'Add a new menu item',
        icon: 'plus-square',
        onPress: () => navigation.navigate('AddItem'),
        disabled: !hasRestaurant,
      },
    ];

    if (!hasRestaurant) {
      base.unshift({
        key: 'createRestaurant',
        title: 'Create Restaurant',
        subtitle: 'Set up your restaurant first',
        icon: 'home',
        onPress: () => navigation.navigate('AddRestaurant'),
        disabled: false,
      });
    }

    return base;
  }, [navigation, user?.restaurant]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topRow}>
        <Pressable
          onPress={() => navigation.openDrawer()}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
        >
          <Icon name="menu" size={18} color={colors.text} />
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Profile')}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
        >
          <Icon name="user" size={18} color={colors.text} />
        </Pressable>
      </View>

      <Text style={styles.greet}>Hi {firstName}</Text>
      <Text style={styles.heading}>Owner Dashboard</Text>

      {!user?.restaurant && (
        <View style={styles.notice}>
          <Icon name="info" size={16} color={colors.primaryDark} />
          <Text style={styles.noticeText}>
            Create your restaurant to start adding items and receiving orders.
          </Text>
        </View>
      )}

      <View style={styles.cardsWrap}>
        {cards.map(card => (
          <Pressable
            key={card.key}
            onPress={card.onPress}
            disabled={card.disabled}
            style={({ pressed }) => [
              styles.card,
              card.disabled && styles.cardDisabled,
              pressed && !card.disabled && { transform: [{ scale: 0.99 }] },
            ]}
          >
            <View style={styles.cardIcon}>
              <Icon name={card.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardSub}>{card.subtitle}</Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </View>

      {Boolean(user?.restaurant) && (
        <Pressable
          onPress={handleDeleteRestaurant}
          style={({ pressed }) => [
            styles.dangerBtn,
            pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
          ]}
        >
          <Icon name="trash-2" size={18} color={colors.error} />
          <Text style={styles.dangerText}>Delete Restaurant</Text>
        </Pressable>
      )}
    </View>
  );
};

export default OwnerHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
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
  greet: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.sm,
  },
  heading: {
    ...typography.sub,
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.tintAlt,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeText: {
    ...typography.sub,
    color: colors.primaryDark,
    flex: 1,
  },
  cardsWrap: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.soft,
  },
  cardDisabled: {
    opacity: 0.55,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
  },
  cardSub: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  dangerBtn: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    borderRadius: radii.lg,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerText: {
    ...typography.sub,
    color: colors.error,
    fontWeight: '800',
  },
});
