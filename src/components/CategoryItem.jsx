import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Items from '../utils/ItemCard';
import { useRoute } from '@react-navigation/native';
import { React, useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../utils/api';
import Loader from '../utils/Loader';

const CategoryItems = () => {
  const route = useRoute();
  const { category } = route.params;
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItemByCategory = async () => {
      try {
        const res = await api.get(`/items/category/${category}`);
        setItems(res.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItemByCategory();
  }, []);
  if (loading) {
    return <Loader />;
  }
  return (
    <View>
      <Text style={{ ...styles.heading, paddingTop: insets.top }}>
        Yayyy we got your favourites
      </Text>
      <Items items={items}></Items>
    </View>
  );
};

export default CategoryItems;

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'flex-start',
    marginLeft: '8%',
    fontFamily: 'fantasy',
    color: 'rgb(84, 79, 59)',
    marginBottom: 5,
  },
});
