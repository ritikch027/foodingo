import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import api from '../utils/api';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../utils/Loader';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const res = await api.get('/restaurant/orders', { token });
      setOrders(res.data.orders);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Failed to load orders',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}`, { status });
      fetchOrders();
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Update failed',
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <Loader />;
  if (orders.length == 0) {
    return (
      <View>
        <Text>No Remaining Orders</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={orders}
      keyExtractor={item => item._id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>Order #{item._id.slice(-6)}</Text>

          <Text>Status: {item.status}</Text>
          <Text>Total: ₹{item.total}</Text>

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => updateStatus(item._id, 'preparing')}
              style={styles.btn}
            >
              <Text style={styles.btnText}>Prepare</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => updateStatus(item._id, 'delivered')}
              style={[styles.btn, styles.green]}
            >
              <Text style={styles.btnText}>Deliver</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

export default RestaurantOrders;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  btn: {
    backgroundColor: '#4f46e5',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  green: {
    backgroundColor: '#10b981',
  },
  btnText: {
    color: '#fff',
  },
});
