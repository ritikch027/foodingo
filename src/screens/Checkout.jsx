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
import RazorpayCheckout from 'react-native-razorpay';
import { colors, radii, spacing, typography, shadows, motion } from '../theme';

const Checkout = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { mappedItems, user, clearCart, getCartData } = useContext(UserContext);

  const role = String(user?.role || '')
    .toLowerCase()
    .trim();
  const isNonCustomer = Boolean(role) && role !== 'customer';

  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');

  // Calculate totals
  const subtotal = mappedItems.reduce(
    (sum, item) => sum + (item.offerPrice || item.price) * item.quantity,
    0,
  );
  const deliveryFee = 40;
  const tax = subtotal * 0.05;
  const total = subtotal + deliveryFee + tax;

  const finishOrderFlow = order => {
    clearCart();
    getCartData();

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
            params: { orderId: order?._id || order?.id, order },
          },
        ],
      });
    }, 1000);
  };

  const placeCashOnDeliveryOrder = async () => {
    const res = await api.post('/orders/create', { address, phone });
    if (!res?.data?.success) {
      throw new Error(res?.data?.message || 'Failed to place order');
    }
    finishOrderFlow(res.data.order);
  };

  const placeRazorpayOrder = async () => {
    const orderRes = await api.post('/payments/razorpay/order', { address, phone });
    if (!orderRes?.data?.success) {
      throw new Error(orderRes?.data?.message || 'Failed to initialize payment');
    }

    const razorpayOrderId =
      orderRes.data.razorpayOrderId || orderRes.data.razorpay_order_id;
    const amount = orderRes.data.amount;
    const currency = orderRes.data.currency || 'INR';
    const keyId = orderRes.data.keyId || orderRes.data.key;
    const appOrderId = orderRes.data.orderId || orderRes.data.order?._id;

    if (!razorpayOrderId || !amount || !keyId) {
      throw new Error('Incomplete payment configuration from server');
    }

    const options = {
      key: keyId,
      amount: String(amount),
      currency,
      name: 'Foodingo',
      description: 'Food order payment',
      order_id: razorpayOrderId,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: phone || user?.phone || '',
      },
      theme: { color: colors.primary },
    };

    const payment = await RazorpayCheckout.open(options);

    const verifyRes = await api.post('/payments/razorpay/verify', {
      orderId: appOrderId,
      razorpay_payment_id: payment.razorpay_payment_id,
      razorpay_order_id: payment.razorpay_order_id,
      razorpay_signature: payment.razorpay_signature,
    });

    if (!verifyRes?.data?.success) {
      throw new Error(verifyRes?.data?.message || 'Payment verification failed');
    }

    finishOrderFlow(verifyRes.data.order || orderRes.data.order || { _id: appOrderId });
  };

  const handlePlaceOrder = async () => {
    if (isNonCustomer) {
      Toast.show({
        type: 'error',
        text1: 'Customer Only',
        text2: 'Ordering is available only for customer accounts.',
      });
      return;
    }

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
      if (paymentMethod === 'COD') {
        await placeCashOnDeliveryOrder();
      } else {
        await placeRazorpayOrder();
      }
    } catch (error) {
      const errorMessage =
        error?.description ||
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong';

      const isPaymentCancelled =
        String(errorMessage).toLowerCase().includes('cancel') ||
        String(error?.code) === 'PAYMENT_CANCELLED';

      if (isPaymentCancelled) {
        Toast.show({
          type: 'info',
          text1: 'Payment Cancelled',
          text2: 'You can try placing the order again',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Order Failed',
          text2: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (isNonCustomer) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() =>
              navigation.canGoBack()
                ? navigation.goBack()
                : navigation.navigate('Home')
            }
          >
            <Icon name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.nonCustomerWrap}>
          <Text style={styles.sectionTitle}>Customer Only</Text>
          <Text style={styles.nonCustomerText}>
            Owner/Admin accounts can’t place orders. Switch to a customer account to
            checkout.
          </Text>
        </View>
      </View>
    );
  }

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
                  {(item.offerPrice || item.price) * item.quantity}
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

        <Animated.View
          entering={FadeInDown.duration(motion.fadeDuration).delay(160)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <View style={styles.card}>
            <Pressable
              onPress={() => setPaymentMethod('ONLINE')}
              style={[
                styles.paymentOption,
                paymentMethod === 'ONLINE' && styles.paymentOptionActive,
              ]}
            >
              <View style={styles.paymentLeft}>
                <Icon
                  name={paymentMethod === 'ONLINE' ? 'check-circle' : 'circle'}
                  size={18}
                  color={
                    paymentMethod === 'ONLINE' ? colors.primaryDark : colors.muted
                  }
                />
                <View>
                  <Text style={styles.paymentTitle}>Online (Razorpay)</Text>
                  <Text style={styles.paymentSub}>UPI, cards, netbanking, wallet</Text>
                </View>
              </View>
              <Icon name="credit-card" size={16} color={colors.muted} />
            </Pressable>

            <Pressable
              onPress={() => setPaymentMethod('COD')}
              style={[
                styles.paymentOption,
                paymentMethod === 'COD' && styles.paymentOptionActive,
              ]}
            >
              <View style={styles.paymentLeft}>
                <Icon
                  name={paymentMethod === 'COD' ? 'check-circle' : 'circle'}
                  size={18}
                  color={paymentMethod === 'COD' ? colors.primaryDark : colors.muted}
                />
                <View>
                  <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                  <Text style={styles.paymentSub}>Pay when your order arrives</Text>
                </View>
              </View>
              <Icon name="dollar-sign" size={16} color={colors.muted} />
            </Pressable>
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
            {loading
              ? paymentMethod === 'ONLINE'
                ? 'Processing Payment...'
                : 'Placing Order...'
              : paymentMethod === 'ONLINE'
                ? 'Pay & Place Order'
                : 'Place Order (COD)'}
          </Text>
          <Icon name="check-circle" size={18} color={colors.surface} />
        </Pressable>
      </View>

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

  nonCustomerWrap: {
    padding: spacing.lg,
  },

  nonCustomerText: {
    ...typography.sub,
    color: colors.muted,
    marginTop: 8,
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

  paymentOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  paymentOptionActive: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.tint,
  },

  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },

  paymentTitle: {
    ...typography.sub,
    color: colors.text,
  },

  paymentSub: {
    ...typography.caption,
    color: colors.muted,
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
