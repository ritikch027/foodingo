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
import { useState, useEffect, useContext } from 'react';
import RenderCategories from './components/RenderCategories';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RenderOffer from './components/RenderOffer';
import { UserContext } from './utils/userContext';
import Loader from './utils/Loader';
import Toast from 'react-native-toast-message';

const screenWidth = Dimensions.get('window').width;

const Home = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, setUser, mappedItems, isLoggedIn } = useContext(UserContext);
  const totalItems = mappedItems.reduce((sum, item) => sum + item.quantity, 0);
  const [loadingUser, setLoadingUser] = useState(true);

  const [offers, setOffers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  const getData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await api.post('/userdata', { token });

      if (res.data && res.data.userData) {
        setUser(res.data.userData);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const res = await api.get('/offers');
      setOffers(res.data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const res = await api.get('/restaurants');
      setRestaurants(res.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: error,
        text2: 'Failed to fetch restaurants',
      });
    }
  };

  useEffect(() => {
    const checkIfLoggedIn = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // Don't call getData or show any toast
        return;
      }
      // Safe to fetch user
      getData();
    };

    checkIfLoggedIn();
    fetchOffers();
    fetchRestaurants();
  }, []);

  const HeaderTop = () => (
    <View>
      <View style={{ ...styles.headerTopRow, marginTop: insets.top }}>
        <Fontisto
          onPress={() => navigation.openDrawer()}
          name="nav-icon-list-a"
          size={19}
          color="rgb(2, 2, 2)"
        />
        <Pressable onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart" size={30} color="rgb(0, 0, 0)" />
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </Pressable>
      </View>
      <Text style={styles.greet}>
        Hii {user?.name || 'Guest'}.....
        <Text style={styles.greetHighlight}>Welcome to Foodingo</Text>
      </Text>
      <Text style={styles.heading}>Find Your Favourites</Text>
      <View style={styles.searchBar}>
        <TextInput style={styles.input} placeholder="Search" />
        <Fontisto
          name="search"
          style={styles.searchIcon}
          size={30}
          color="#900"
        />
      </View>
      <Text style={styles.heading}>What's on your mind?</Text>
    </View>
  );

  const HeaderSticky = () => <RenderCategories />;

  const HeaderBottom = () => (
    <View>
      <Text style={styles.subHeading}>Best Offers</Text>
      <RenderOffer items={offers} />
      <Text style={styles.subHeading}>Restaurants Near You</Text>
    </View>
  );

  if (loadingUser) return <Loader />;

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        ListHeaderComponent={() => (
          <View>
            <HeaderTop />
            <HeaderSticky />
            <HeaderBottom />
          </View>
        )}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          ...styles.flatListContent,
          paddingBottom: insets.bottom,
        }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card1}
            onPress={() =>
              navigation.navigate('RestaurantItems', { restaurant: item })
            }
          >
            <View style={styles.itemContainer}>
              <Image source={{ uri: item.image.url }} style={styles.listImg} />
              <View style={styles.deliveryTime}>
                <Ionicons name="time" size={17} color="rgb(113, 109, 93)" />
                <Text style={styles.deliveryText}>
                  {item.deliveryTime} mins
                </Text>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.nameText}>{item.name}</Text>
                <View style={styles.location}>
                  <Text>{item.location} | </Text>
                  <Entypo name="location" size={14} color="rgb(84, 79, 59)" />
                  <Text style={styles.rating}>
                    <FontAwesome
                      name="star"
                      size={14}
                      color="rgb(193, 169, 65)"
                    />
                    {item.rating}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'rgb(255, 250, 245)',
  },
  headerTopRow: {
    marginLeft: '5%',
    flexDirection: 'row',
    width: screenWidth * 0.9,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#D9D9D9',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  greet: {
    fontSize: 26,
    color: '#5A3E36',
    marginTop: '4%',
    fontFamily: 'cursive',
    marginLeft: '5%',
    fontWeight: '600',
  },
  greetHighlight: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 20,
    color: '#333333',
    alignSelf: 'flex-start',
    marginTop: '5%',
    fontWeight: '600',
    marginLeft: '5%',
  },
  subHeading: {
    fontSize: 18,
    color: '#3E3E3E',
    fontWeight: 'bold',
    marginTop: 10,
    marginLeft: '5%',
  },
  searchBar: {
    flexDirection: 'row',
    width: screenWidth * 0.9,
    alignItems: 'center',
    marginTop: '2%',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginLeft: '5%',
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  input: {
    fontSize: 16,
    flex: 1,
    height: 50,
    borderRightColor: '#DDD',
    borderRightWidth: 1,
    paddingRight: 10,
  },
  searchIcon: {
    paddingLeft: 10,
  },
  flatListContent: {
    width: screenWidth,
    alignItems: 'center',
  },
  itemContainer: {
    width: screenWidth * 0.9,
    borderWidth: 1,
    borderColor: '#F0ECE3',
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#FFF7F0',
    overflow: 'hidden',
    elevation: 1,
  },
  listImg: {
    width: '100%',
    height: 180,
  },
  deliveryTime: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 5,
    borderRadius: 15,
  },
  deliveryText: {
    fontSize: 14,
    marginLeft: 5,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 10,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4E342E',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  rating: {
    marginLeft: 5,
    fontSize: 14,
    color: '#444',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
