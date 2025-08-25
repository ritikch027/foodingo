import { StyleSheet, Text, View } from 'react-native';
import Items from '../utils/ItemCard';
import { useRoute } from '@react-navigation/native';
import { React, useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../utils/api';
import Toast from 'react-native-toast-message';
import Loader from '../utils/Loader';

const RestaurantItems = () => {
  const route = useRoute();
  const { restaurant } = route.params;

  const insets = useSafeAreaInsets();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantItems = async () => {
      try {
        const res = await api.get(`/items/restaurant/${restaurant._id}`);
        setItems(res.data.items);
      } catch (error) {
        console.error('Error fetching items:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to load items',
          text2: error?.response?.data?.message || 'Something went wrong',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantItems();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!restaurant) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Restaurant not found</Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={{ ...styles.heading, paddingTop: insets.top }}>
        More from {restaurant.name}
      </Text>
      <Items items={items} />
      <Toast />
    </View>
  );
};

export default RestaurantItems;

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'flex-start',
    marginLeft: '8%',
    fontFamily: 'fantasy',
    color: 'rgb(84, 79, 59)',
  },
});
