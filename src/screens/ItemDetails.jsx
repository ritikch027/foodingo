import React, { useCallback, useContext, useMemo } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import api from '../utils/api';
import Counter from '../utils/counter';
import { UserContext } from '../utils/userContext';
import { colors, radii, spacing, typography, shadows } from '../theme';

const getItemId = item =>
  item?._id || item?.id || item?.productId?._id || item?.productId || null;

const getRestaurantName = item =>
  item?.restaurantName ||
  item?.restaurant?.name ||
  item?.restaurant?.restaurantName ||
  item?.restaurant?.title ||
  null;

const ItemDetails = ({ route, navigation }) => {
  const item = route?.params?.item;
  const { mappedItems, getCartData } = useContext(UserContext);

  const restaurantName = useMemo(() => getRestaurantName(item), [item]);
  const itemId = useMemo(() => getItemId(item), [item]);
  const cartItem = useMemo(() => mappedItems.find(ci => ci._id === itemId), [itemId, mappedItems]);

  const price = Number(item?.price ?? 0);
  const offerPrice = Number(item?.offerPrice ?? price ?? 0);
  const hasDiscount = offerPrice > 0 && price > 0 && offerPrice < price;

  const addToCart = useCallback(async () => {
    try {
      if (!itemId) {
        Toast.show({ type: 'error', text1: 'Invalid item', text2: 'Missing item id' });
        return;
      }

      const res = await api.post('/cart/add', { productId: itemId, quantity: 1 });
      if (res.data?.success) {
        await getCartData();
        Toast.show({ type: 'snackbar', text1: 'Added to cart' });
        return;
      }

      Toast.show({ type: 'error', text1: res.data?.message || 'Failed to add to cart' });
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;
      const isRestaurantConflict =
        status === 409 ||
        (typeof message === 'string' && message.toLowerCase().includes('restaurant'));

      Toast.show({
        type: isRestaurantConflict ? 'info' : 'error',
        text1: message || 'Error adding to cart',
        ...(isRestaurantConflict && {
          text2: 'Clear cart to add items from another restaurant',
        }),
      });
    }
  }, [getCartData, itemId]);

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.muted}>Item not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar} />

        <View style={styles.card}>
          {item?.image?.url ? (
            <Image source={{ uri: item.image.url }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imageFallback]}>
              <Icon name="image" size={28} color={colors.muted} />
            </View>
          )}

          <View style={styles.body}>
            <Text style={styles.title}>{item?.name || 'Item'}</Text>
            {!!restaurantName && <Text style={styles.subTitle}>{restaurantName}</Text>}

            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item?.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}</Text>
              </View>
              {!!item?.category && (
                <View style={styles.badgeAlt}>
                  <Text style={styles.badgeAltText}>{item.category}</Text>
                </View>
              )}
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {'\u20B9'}
                {offerPrice.toFixed(2)}
              </Text>
              {hasDiscount && (
                <Text style={styles.oldPrice}>
                  {'\u20B9'}
                  {price.toFixed(2)}
                </Text>
              )}
              {!!item?.discountPercent && (
                <View style={styles.discountPill}>
                  <Text style={styles.discountText}>{item.discountPercent}% OFF</Text>
                </View>
              )}
            </View>

            {!!item?.description && (
              <Text style={styles.desc}>{item.description}</Text>
            )}

            <View style={styles.actionRow}>
              {cartItem ? (
                <View style={styles.counterWrap}>
                  <Counter item={cartItem} compact={false} />
                </View>
              ) : (
                <Pressable
                  onPress={addToCart}
                  style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.9 }]}
                >
                  <Icon name="plus" size={18} color={colors.surface} />
                  <Text style={styles.addText}>Add to cart</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ItemDetails;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    paddingBottom: spacing.xl,
  },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  muted: {
    ...typography.sub,
    color: colors.muted,
  },
  card: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  image: {
    width: '100%',
    height: 240,
    backgroundColor: colors.bg,
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  body: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subTitle: {
    ...typography.sub,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: colors.tintAlt,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '800',
  },
  badgeAlt: {
    backgroundColor: colors.tint,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeAltText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  price: {
    ...typography.h2,
    color: colors.text,
  },
  oldPrice: {
    ...typography.sub,
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  discountPill: {
    backgroundColor: colors.tintAlt,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  discountText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  desc: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  actionRow: {
    marginTop: spacing.lg,
  },
  addBtn: {
    height: 46,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addText: {
    ...typography.sub,
    color: colors.surface,
    fontWeight: '900',
  },
  counterWrap: {
    alignSelf: 'flex-start',
  },
});
