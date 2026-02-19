import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';
import api from '../utils/api';
import { UserContext } from '../utils/userContext';
import { colors, radii, spacing, typography, shadows } from '../theme';

const TABS = {
  USERS: 'USERS',
  RESTAURANTS: 'RESTAURANTS',
};

const USER_FILTERS = ['ALL', 'CUSTOMER', 'OWNER', 'ADMIN'];

const normalize = value =>
  String(value || '')
    .toLowerCase()
    .trim();

const getUserRole = user => normalize(user?.role) || 'customer';

const isUserBanned = user =>
  Boolean(user?.isBanned || user?.banned || user?.status === 'banned');

const getOwnerId = restaurant => {
  const rawOwner = restaurant?.owner;
  if (typeof rawOwner === 'string') return rawOwner;
  if (rawOwner && typeof rawOwner === 'object') return rawOwner?._id;
  return null;
};

const AdminManagement = () => {
  const navigation = useNavigation();
  const { user } = React.useContext(UserContext);
  const [activeTab, setActiveTab] = useState(TABS.USERS);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [usersQuery, setUsersQuery] = useState('');
  const [restaurantsQuery, setRestaurantsQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async () => {
    const res = await api.get('/admin/users');
    setUsers(res?.data?.users || []);
  }, []);

  const fetchRestaurants = useCallback(async () => {
    const res = await api.get('/admin/restaurants');
    setRestaurants(res?.data?.restaurants || []);
  }, []);

  const loadAll = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      await Promise.all([fetchUsers(), fetchRestaurants()]);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load admin data',
        text2: error?.response?.data?.message || 'Please try again',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchRestaurants, fetchUsers]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.role !== 'admin') return;
      Promise.all([fetchUsers(), fetchRestaurants()]).catch(error => {
        Toast.show({
          type: 'error',
          text1: 'Failed to refresh admin data',
          text2: error?.response?.data?.message || 'Please try again',
        });
      });
    }, [fetchRestaurants, fetchUsers, user?.role]),
  );

  const filteredUsers = useMemo(() => {
    const q = normalize(usersQuery);
    return users.filter(item => {
      const role = getUserRole(item);
      if (userRoleFilter !== 'ALL' && role !== userRoleFilter.toLowerCase()) {
        return false;
      }

      if (!q) return true;

      const name = normalize(item?.name);
      const email = normalize(item?.email);
      const phone = normalize(item?.phone);
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [users, usersQuery, userRoleFilter]);

  const filteredRestaurants = useMemo(() => {
    const q = normalize(restaurantsQuery);
    if (!q) return restaurants;
    return restaurants.filter(restaurant => {
      const name = normalize(restaurant?.name);
      const location = normalize(restaurant?.location);
      return name.includes(q) || location.includes(q);
    });
  }, [restaurants, restaurantsQuery]);

  const usersById = useMemo(() => {
    const map = {};
    users.forEach(u => {
      if (u?._id) map[u._id] = u;
    });
    return map;
  }, [users]);

  const renderUserItem = ({ item }) => {
    const role = getUserRole(item);
    const banned = isUserBanned(item);
    return (
      <Pressable
        onPress={() => navigation.navigate('UserDetails', { user: item })}
        style={({ pressed }) => [
          styles.card,
          pressed && {
            opacity: 0.9,
          },
        ]}
      >
        <View style={styles.rowSpace}>
          <Text style={styles.cardTitle}>{item?.name || 'Unnamed user'}</Text>
          <View
            style={[styles.badge, banned ? styles.badgeDanger : styles.badgeOk]}
          >
            <Text style={styles.badgeText}>{banned ? 'Banned' : 'Active'}</Text>
          </View>
        </View>

        <Text style={styles.cardMeta}>Email: {item?.email || '-'}</Text>
        <Text style={styles.cardMeta}>Phone: {item?.phone || '-'}</Text>
        <Text style={styles.cardMeta}>Role: {role}</Text>

        <View style={styles.detailsRow}>
          <Text style={styles.detailsText}>Open details</Text>
          <Icon name="chevron-right" size={16} color={colors.muted} />
        </View>
      </Pressable>
    );
  };

  const renderRestaurantItem = ({ item }) => {
    const initial = String(item?.name || 'R')
      .trim()
      .charAt(0)
      .toUpperCase();
    const ownerId = getOwnerId(item);
    const ownerFromUsers = ownerId ? usersById[ownerId] : null;
    const ownerName = ownerFromUsers?.name || '-';
    const ownerPhone = ownerFromUsers?.phone || '-';

    return (
      <Pressable
        onPress={() =>
          navigation.navigate('RestaurantDetails', {
            restaurant: {
              ...item,
              ownerNameResolved: ownerName,
              ownerPhoneResolved: ownerPhone,
            },
          })
        }
        style={({ pressed }) => [
          styles.card,
          styles.restaurantCard,
          pressed && { opacity: 0.92 },
        ]}
      >
        <View style={styles.restaurantHeader}>
          <View style={styles.restaurantAvatar}>
            <Text style={styles.restaurantAvatarText}>{initial}</Text>
          </View>
          <View style={styles.restaurantHeaderTextWrap}>
            <Text style={styles.cardTitle}>
              {item?.name || 'Unnamed restaurant'}
            </Text>
            <View style={styles.restaurantTypeChip}>
              <Text style={styles.restaurantTypeChipText}>Restaurant</Text>
            </View>
          </View>
        </View>

        <View style={styles.restaurantMetaRow}>
          <Icon name="map-pin" size={14} color={colors.primary} />
          <Text style={styles.restaurantMetaText}>{item?.location || '-'}</Text>
        </View>

        <View style={styles.restaurantMetaRow}>
          <Icon name="user" size={14} color={colors.primary} />
          <Text style={styles.restaurantMetaText}>{ownerName}</Text>
        </View>

        <View style={styles.restaurantMetaRow}>
          <Icon name="phone" size={14} color={colors.primary} />
          <Text style={styles.restaurantMetaText}>{ownerPhone}</Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailsText}>Open details</Text>
          <Icon name="chevron-right" size={16} color={colors.muted} />
        </View>
      </Pressable>
    );
  };

  const isUsersTab = activeTab === TABS.USERS;

  if (user?.role !== 'admin') {
    return (
      <View style={styles.unauthorizedWrap}>
        <Icon name="lock" size={28} color={colors.muted} />
        <Text style={styles.unauthorizedText}>
          Only admins can access this page
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.heading}>Admin Panel</Text>
        </View>
        <Text style={styles.subHeading}>Manage users and restaurants</Text>
      </View>

      <View style={styles.tabsRow}>
        <Pressable
          style={[styles.tabBtn, isUsersTab && styles.tabBtnActive]}
          onPress={() => setActiveTab(TABS.USERS)}
        >
          <Text style={[styles.tabText, isUsersTab && styles.tabTextActive]}>
            Users
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, !isUsersTab && styles.tabBtnActive]}
          onPress={() => setActiveTab(TABS.RESTAURANTS)}
        >
          <Text style={[styles.tabText, !isUsersTab && styles.tabTextActive]}>
            Restaurants
          </Text>
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <Icon name="search" size={16} color={colors.muted} />
        <TextInput
          value={isUsersTab ? usersQuery : restaurantsQuery}
          onChangeText={isUsersTab ? setUsersQuery : setRestaurantsQuery}
          placeholder={
            isUsersTab
              ? 'Search by name, email or phone'
              : 'Search restaurant by name or location'
          }
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>

      {isUsersTab && (
        <View style={styles.filtersRow}>
          {USER_FILTERS.map(filter => {
            const active = userRoleFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => setUserRoleFilter(filter)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading admin data...</Text>
        </View>
      ) : (
        <FlatList
          data={isUsersTab ? filteredUsers : filteredRestaurants}
          keyExtractor={(item, index) => item?._id || String(index)}
          renderItem={isUsersTab ? renderUserItem : renderRestaurantItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={ListSeparator}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadAll({ silent: true });
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                {isUsersTab ? 'No users found' : 'No restaurants found'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default AdminManagement;

const ListSeparator = () => <View style={styles.separator} />;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  tabBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.sub,
    color: colors.muted,
    fontWeight: '700',
  },
  tabTextActive: {
    color: colors.surface,
  },
  searchWrap: {
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    height: 48,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.surface,
  },
  searchInput: {
    ...typography.body,
    marginLeft: spacing.sm,
    flex: 1,
    color: colors.text,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  filterTextActive: {
    color: colors.surface,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  separator: {
    height: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.soft,
  },
  restaurantCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  restaurantAvatar: {
    width: 42,
    height: 42,
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
  restaurantHeaderTextWrap: {
    flex: 1,
  },
  restaurantTypeChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: colors.tint,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  restaurantTypeChipText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  restaurantMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  restaurantMetaText: {
    ...typography.sub,
    color: colors.muted,
    flex: 1,
  },
  rowSpace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  cardMeta: {
    ...typography.sub,
    color: colors.muted,
    marginTop: 4,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeOk: {
    backgroundColor: '#DCFCE7',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  detailsRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  detailsText: {
    ...typography.caption,
    color: colors.muted,
    fontWeight: '700',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    ...typography.sub,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.sub,
    color: colors.muted,
  },
  unauthorizedWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bg,
  },
  unauthorizedText: {
    ...typography.sub,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
