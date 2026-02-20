import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserContext } from '../utils/userContext';
import { colors, radii, spacing, typography, shadows } from '../theme';

const MENU_ITEMS = [
  {
    id: 'add_items',
    title: 'Add Items',
    subtitle: 'Add new food items to your menu',
    icon: 'plus-circle',
    screen: 'AddItem',
    color: '#10B981',
  },
  {
    id: 'manage_items',
    title: 'Manage Items',
    subtitle: 'Edit or remove menu items',
    icon: 'edit-3',
    screen: 'OwnerItemsDashboard',
    color: '#3B82F6',
  },
  {
    id: 'orders',
    title: 'Orders',
    subtitle: 'View incoming customer orders',
    icon: 'shopping-bag',
    screen: 'RestaurantOrders',
    color: '#F59E0B',
  },
  {
    id: 'add_restaurant',
    title: 'Add Restaurant',
    subtitle: 'Register a new restaurant',
    icon: 'plus-square',
    screen: 'AddRestaurant',
    color: '#8B5CF6',
  },
];

const OwnerHome = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = React.useContext(UserContext);

  const handleMenuPress = screen => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + spacing.xl,
        }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greet}>
                Welcome back, {user?.name?.split(' ')[0] || 'Owner'} 👋
              </Text>
              <Text style={styles.subGreet}>Manage your restaurant</Text>
            </View>
            <Pressable
              onPress={() => navigation.openDrawer()}
              style={({ pressed }) => [
                styles.profileBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Image
                source={{
                  uri:
                    user?.image_url ||
                    'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                }}
                style={styles.profileImage}
              />
            </Pressable>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <Icon name="shopping-bag" size={20} color="#10B981" />
            </View>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Pending Orders</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#DBEAFE' }]}>
              <Icon name="eye" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          {MENU_ITEMS.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => handleMenuPress(item.screen)}
              style={({ pressed }) => [
                styles.menuCard,
                pressed && styles.menuCardPressed,
              ]}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: item.color + '20' },
                ]}
              >
                <Icon name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        {/* Recent Orders Preview */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <Pressable onPress={() => navigation.navigate('RestaurantOrders')}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          <View style={styles.emptyState}>
            <Icon name="inbox" size={40} color={colors.muted} />
            <Text style={styles.emptyText}>No new orders</Text>
            <Text style={styles.emptySubtext}>Orders will appear here</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default OwnerHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.tintAlt,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greet: {
    ...typography.h2,
    color: colors.text,
  },
  subGreet: {
    ...typography.sub,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.surface,
    ...shadows.soft,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.soft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statNumber: {
    ...typography.h2,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  menuCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  menuTitle: {
    ...typography.sub,
    color: colors.text,
    fontWeight: '700',
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.muted,
    marginTop: 2,
  },
  recentSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    ...typography.sub,
    color: colors.primary,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    ...typography.sub,
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});
