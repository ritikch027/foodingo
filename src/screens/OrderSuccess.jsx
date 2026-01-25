import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OrderSuccess = ({ route, navigation }) => {
  const { order } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.big}>🎉 Order Confirmed</Text>

      <Text style={styles.id}>Order #{order._id.slice(-6)}</Text>

      <Text>Status: {order.status}</Text>
      <Text>Total: ₹{order.totalAmount}</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.replace('HomeWithDrawer')}
      >
        <Text style={styles.btnText}>Back Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OrderSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  big: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },

  id: {
    marginBottom: 10,
  },

  btn: {
    marginTop: 40,
    backgroundColor: '#4f46e5',
    padding: 14,
    borderRadius: 12,
  },

  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
