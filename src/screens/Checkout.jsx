import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import api from '../utils/api';
import { UserContext } from '../utils/userContext';
import Toast from 'react-native-toast-message';

const Checkout = ({ navigation }) => {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const placeOrder = async () => {
    if (!address.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Address Required',
      });
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/orders', {
        address: address.trim(),
      });

      navigation.replace('OrderSuccess', { order: res.data.order });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: err.response?.data?.message || 'Order failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Delivery Address</Text>

      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Enter your full address"
        multiline
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.btn}
        disabled={loading}
        onPress={placeOrder}
      >
        <Text style={styles.btnText}>
          {loading ? 'Placing Order...' : 'Confirm Order'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Checkout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },

  heading: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 30,
  },

  btn: {
    backgroundColor: '#4f46e5',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
