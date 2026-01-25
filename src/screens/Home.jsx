import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';

import api from './utils/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useContext, useCallback } from 'react';
import RenderCategories from './components/RenderCategories';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import RenderOffer from './components/RenderOffer';
import { UserContext } from './utils/userContext';
import Loader from './utils/Loader';
import HomeSkeleton from './utils/HomeSkeleton';

import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;

const Home = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, setUser, mappedItems, fetchCategories } =
    useContext(UserContext);

  const totalItems = mappedItems.reduce((sum, item) => sum + item.quantity, 0);

  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  /* ---------------- CACHE ---------------- */

  // const cacheSet = async (key, data) => {
  //   try {
  //     await AsyncStorage.setItem(key, JSON.stringify(data));
  //   } catch (err) {
  //     console.log('Cache write error:', err);
  //   }
  // };

  // const cacheGet = async key => {
  //   try {
  //     const value = await AsyncStorage.getItem(key);
  //     return value ? JSON.parse(value) : null;
  //   } catch {
  //     return null;
  //   }
  // };

  /* ---------------- API ---------------- */

  const fetchOffers = async () => {
    try {
      const res = await api.get('/offers');
      // console.log(res.data);
      setOffers(res.data);
      // cacheSet('offers', res.data);
    } catch (err) {
      console.log('Offers API error:', err.message);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await api.get('/restaurants');
      setRestaurants(res.data);
      // cacheSet('restaurants', res.data);
    } catch (err) {
      console.log('Restaurants API error:', err.message);
    }
  };

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/userdata', { token });
      if (res.data?.user) {
        setUser(res.data?.user);
      }
    } catch (err) {
      console.log('User API error:', err.message);
    }
  };

  /* ---------------- BOOT ---------------- */

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      try {
        // Load cached data instantly
        // const cachedOffers = await cacheGet('offers');
        // const cachedRestaurants = await cacheGet('restaurants');

        // if (cachedOffers) setOffers(cachedOffers);
        // if (cachedRestaurants) setRestaurants(cachedRestaurants);

        // Fetch fresh data without crashing UI
        await fetchOffers();
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
  }, []);

  /* ---------------- UI ---------------- */

  const HeaderTop = () => (
    <View>
      <View style={[styles.headerTopRow, { marginTop: insets.top }]}>
        <Fontisto
          onPress={() => navigation.openDrawer()}
          name="nav-icon-list-a"
          size={20}
          color="#111827"
        />

        <Pressable onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart" size={28} color="#111827" />
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <Text style={styles.greet}>Hi {user?.name || 'Guest'} 👋</Text>
      <Text style={styles.heading}>Find your favourite food</Text>

      <View style={styles.searchBar}>
        <Fontisto name="search" size={18} color="#6b7280" />
        <TextInput
          style={styles.input}
          placeholder="Search for restaurants or food"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <Text style={styles.sectionTitle}>What's on your mind?</Text>
    </View>
  );

  const HeaderSticky = () => <RenderCategories />;

  // const HeaderBottom = () => (
  //   <View>
  //     <Text style={styles.sectionTitle}>Best Offers</Text>
  //     <RenderOffer items={offers} />
  //     <Text style={styles.sectionTitle}>Restaurants Near You</Text>
  //   </View>
  // );

  const renderItem = useCallback(
    ({ item, index }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 80)}
        layout={Layout.springify()}
        style={styles.card}
      >
        <Pressable
          onPress={() =>
            navigation.navigate('RestaurantItems', { restaurant: item })
          }
        >
          <Image source={{ uri: item.image.url }} style={styles.listImg} />

          <View style={styles.deliveryBadge}>
            <Ionicons name="time" size={14} color="#fff" />
            <Text style={styles.deliveryText}>{item.deliveryTime} mins</Text>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.nameText}>{item.name}</Text>

            <View style={styles.location}>
              <Text style={styles.locationText}>{item.location}</Text>
              <View style={styles.ratingBadge}>
                <FontAwesome name="star" size={12} color="#facc15" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    ),
    [],
  );

  if (loading && restaurants.length === 0) return <HomeSkeleton />;

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        ListHeaderComponent={() => (
          <View>
            <HeaderTop />
            <HeaderSticky />
            <Text style={styles.sectionTitle}>
              Grab from your favourite restaurant...
            </Text>
            {/* <HeaderBottom /> */}
          </View>
        )}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
        }}
        renderItem={renderItem}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  /* ---------- HEADER ---------- */

  headerTopRow: {
    marginHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
  },

  greet: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 20,
    marginLeft: 20,
  },

  heading: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 6,
    marginLeft: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 24,
    marginLeft: 20,
    marginBottom: 10,
  },

  /* ---------- SEARCH ---------- */

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 52,
  },

  input: {
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
    color: '#111827',
  },

  /* ---------- RESTAURANT CARD ---------- */

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 18,
    overflow: 'hidden',
    elevation: 3,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  listImg: {
    width: '100%',
    height: 180,
  },

  deliveryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  deliveryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 6,
  },

  infoContainer: {
    padding: 14,
  },

  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  location: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  locationText: {
    color: '#6b7280',
    fontSize: 14,
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    marginLeft: 4,
  },

  /* ---------- CART BADGE ---------- */

  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});
