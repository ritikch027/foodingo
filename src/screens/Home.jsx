import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  Pressable,
} from 'react-native';

import api from '../utils/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import RenderCategories from '../components/RenderCategories';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import RenderOffer from './components/RenderOffer';
import { UserContext } from '../utils/userContext';
import HomeSkeleton from '../utils/HomeSkeleton';

import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { colors, radii, spacing, typography, shadows, motion } from '../theme';

const FILTERS = ['Fast Delivery', 'Top Rated', 'Nearby'];

const HomeHeader = ({
  insetsTop,
  navigation,
  totalItems,
  firstName,
  activeFilter,
  onSelectFilter,
}) => {
  const headerTopRowStyle = useMemo(() => {
    return [styles.headerTopRow, { marginTop: insetsTop }];
  }, [insetsTop]);

  return (
    <View>
      <View style={headerTopRowStyle}>
        <Pressable
          onPress={() => navigation.openDrawer()}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
        >
          <Fontisto name="nav-icon-list-a" size={18} color={colors.text} />
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart" size={26} color={colors.text} />
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <Text style={styles.greet}>
        Hi {firstName} {'\uD83D\uDC4B'}
      </Text>
      <Text style={styles.heading}>Find your favorite food fast</Text>

      <View style={styles.searchBar}>
        <Fontisto name="search" size={18} color={colors.muted} />
        <TextInput
          style={styles.input}
          placeholder="Search for restaurants or food"
          placeholderTextColor={colors.muted}
        />
      </View>

      <View style={styles.chipsRow}>
        {FILTERS.map(filter => {
          const isActive = activeFilter === filter;
          return (
            <Pressable
              key={filter}
              onPress={() => onSelectFilter(filter)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>What are you craving?</Text>
      <RenderCategories />

      <Text style={[styles.sectionTitle, styles.sectionTitleAlt]}>
        Grab from your favorite restaurant...
      </Text>
    </View>
  );
};

const Home = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, setUser, mappedItems, fetchCategories } =
    useContext(UserContext);
  const firstName = user?.name?.trim()?.split(/\s+/)?.[0] || 'Guest';

  const totalItems = mappedItems.reduce((sum, item) => sum + item.quantity, 0);

  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState([]);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);

  /* ---------------- API ---------------- */

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await api.get('/restaurants');
      setRestaurants(res.data.restaurants);
    } catch (err) {
      console.log('Restaurants API error:', err.message);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/userdata');
      if (res.data?.user) {
        setUser(res.data?.user);
      }
    } catch (err) {
      console.log('User API error:', err.message);
    }
  }, [setUser]);

  /* ---------------- BOOT ---------------- */

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      try {
        await fetchRestaurants();
        await fetchUser();
        await fetchCategories();
      } catch (err) {
        console.log('Boot error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    boot();
    return () => (mounted = false);
  }, [fetchCategories, fetchRestaurants, fetchUser]);

  const listContentStyle = useMemo(() => {
    return { paddingBottom: insets.bottom + spacing.xl };
  }, [insets.bottom]);

  const renderItem = useCallback(
    ({ item, index }) => (
      <Animated.View
        entering={FadeInDown.duration(motion.fadeDuration).delay(
          index * motion.fadeDelay,
        )}
        layout={Layout.springify()}
        style={styles.card}
      >
        <Pressable
          onPress={() =>
            navigation.navigate('RestaurantItems', { restaurant: item })
          }
          style={({ pressed }) => [
            styles.cardInner,
            pressed && { opacity: 0.9 },
          ]}
        >
          <View style={styles.cardOverlay}>
            <View style={styles.leftBlock}>
              <View style={styles.titleRow}>
                <Text style={styles.nameText} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.ratingBadge}>
                  <FontAwesome name="star" size={12} color={colors.warning} />
                  <Text style={styles.ratingText}>
                    {Number(item.rating || 0).toFixed(1)}
                  </Text>
                </View>
              </View>

              <Text style={styles.locationText} numberOfLines={1}>
                {item.location || 'Location unavailable'}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.deliveryBadge}>
                  <Ionicons name="time" size={12} color={colors.primaryDark} />
                  <Text style={styles.deliveryText}>
                    {item.deliveryTime || 30} mins
                  </Text>
                </View>
              </View>

              <View style={styles.ctaWrap}>
                <Text style={styles.ctaText}>View Menu</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primaryDark} />
              </View>
            </View>

            {item?.image?.url ? (
              <Image source={{ uri: item.image.url }} style={styles.listImg} />
            ) : (
              <View style={[styles.listImg, styles.imgFallback]}>
                <Ionicons name="image-outline" size={22} color={colors.muted} />
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    ),
    [navigation],
  );

  if (loading && restaurants.length === 0) return <HomeSkeleton />;

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        ListHeaderComponent={
          <HomeHeader
            insetsTop={insets.top}
            navigation={navigation}
            totalItems={totalItems}
            firstName={firstName}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
          />
        }
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        contentContainerStyle={listContentStyle}
        renderItem={renderItem}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  /* ---------- HEADER ---------- */

  headerTopRow: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },

  greet: {
    ...typography.h1,
    color: colors.text,
    marginTop: spacing.lg,
    marginLeft: spacing.lg,
  },

  heading: {
    ...typography.sub,
    color: colors.muted,
    marginTop: spacing.xs,
    marginLeft: spacing.lg,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    marginLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitleAlt: {
    marginTop: spacing.lg,
  },

  /* ---------- SEARCH ---------- */

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    height: 52,
  },

  input: {
    ...typography.body,
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.text,
  },

  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
  },

  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  chipText: {
    ...typography.caption,
    color: colors.muted,
  },

  chipTextActive: {
    color: colors.surface,
  },

  /* ---------- RESTAURANT CARD ---------- */

  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardInner: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
  },

  listImg: {
    width: 108,
    height: 108,
    borderRadius: radii.lg,
    backgroundColor: colors.border,
  },
  imgFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardOverlay: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  leftBlock: {
    flex: 1,
  },

  infoContainer: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  nameText: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },

  locationText: {
    ...typography.sub,
    color: colors.muted,
    marginTop: spacing.xs,
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tint,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },

  ratingText: {
    ...typography.caption,
    color: colors.primaryDark,
    marginLeft: 4,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tintAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    gap: 6,
  },

  deliveryText: {
    ...typography.caption,
    color: colors.primaryDark,
  },

  ctaWrap: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tintAlt,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },

  ctaText: {
    ...typography.caption,
    color: colors.primaryDark,
  },

  /* ---------- CART BADGE ---------- */

  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 12,
  },
});
