import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { UserContext } from '../utils/userContext';
import api from '../utils/api';
import Toast from 'react-native-toast-message';
import { colors, radii, spacing, typography, shadows, motion } from '../theme';

const Checkout = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { mappedItems, user } = useContext(UserContext);

  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);

  // Calculate totals
  const subtotal = mappedItems.reduce(
    (sum, item) => sum + item.offerPrice * item.quantity,
    0,
  );
  const deliveryFee = 40;
  const tax = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax;

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Address Required',
        text2: 'Please enter your delivery address',
      });
      return;
    }

    if (!phone.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Phone Required',
        text2: 'Please enter your phone number',
      });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: mappedItems.map(item => ({
          itemId: item._id,
          quantity: item.quantity,
          price: item.offerPrice,
        })),
        deliveryAddress: address,
        phone,
        subtotal,
        deliveryFee,
        tax,
        total,
      };

      const res = await api.post('/orders/create', orderData);

      if (res.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Order Placed!',
          text2: 'Your order has been confirmed',
        });

        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [
              { name: 'HomeWithDrawer' },
              {
                name: 'OrderSuccess',
                params: { orderId: res.data.orderId },
              },
            ],
          });
        }, 1000);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: error?.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
      >
        {/* Delivery Details */}
        <Animated.View
          entering={FadeInDown.duration(motion.fadeDuration)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Delivery Details</Text>

          <View style={styles.inputCard}>
            <Icon name="map-pin" size={18} color={colors.muted} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Delivery Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your full address"
                placeholderTextColor={colors.muted}
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.inputCard}>
            <Icon name="phone" size={18} color={colors.muted} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.muted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </Animated.View>

        {/* Order Items */}
        <Animated.View
          entering={FadeInDown.duration(motion.fadeDuration).delay(60)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Order Items</Text>

          <View style={styles.card}>
            {mappedItems.map(item => (
              <View key={item._id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  {'\u20B9'}
                  {item.offerPrice * item.quantity}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Order Summary */}
        <Animated.View
          entering={FadeInDown.duration(motion.fadeDuration).delay(120)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.card}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {'\u20B9'}
                {subtotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                {'\u20B9'}
                {deliveryFee.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (5%)</Text>
              <Text style={styles.summaryValue}>
                {'\u20B9'}
                {tax.toFixed(2)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {'\u20B9'}
                {total.toFixed(2)}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.totalContainer}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalValue}>
            {'\u20B9'}
            {total.toFixed(2)}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.placeOrderButton,
            pressed && { opacity: 0.85 },
            loading && { opacity: 0.6 },
          ]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text style={styles.placeOrderText}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </Text>
          <Icon name="check-circle" size={18} color={colors.surface} />
        </Pressable>
      </View>

      <Toast />
    </KeyboardAvoidingView>
  );
};

export default Checkout;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },

  placeholder: {
    width: 36,
  },

  /* Content */
  content: {
    flex: 1,
  },

  scrollContent: {
    padding: spacing.lg,
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  /* Input Cards */
  inputCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...shadows.soft,
  },

  inputContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },

  inputLabel: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: spacing.xs,
  },

  input: {
    ...typography.body,
    color: colors.text,
    paddingVertical: 0,
  },

  textArea: {
    minHeight: 64,
  },

  /* Cards */
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadows.soft,
  },

  /* Item Rows */
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },

  itemName: {
    ...typography.sub,
    color: colors.text,
    marginBottom: 2,
  },

  itemQuantity: {
    ...typography.caption,
    color: colors.muted,
  },

  itemPrice: {
    ...typography.sub,
    color: colors.text,
  },

  /* Summary */
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },

  summaryLabel: {
    ...typography.sub,
    color: colors.muted,
  },

  summaryValue: {
    ...typography.sub,
    color: colors.text,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },

  totalLabel: {
    ...typography.h3,
    color: colors.text,
  },

  totalValue: {
    ...typography.h3,
    color: colors.primaryDark,
  },

  /* Bottom Bar */
  bottomBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalContainer: {},

  bottomTotalLabel: {
    ...typography.caption,
    color: colors.muted,
  },

  bottomTotalValue: {
    ...typography.h2,
    color: colors.text,
  },

  placeOrderButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  placeOrderText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
