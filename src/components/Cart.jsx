import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Counter from '../utils/counter';
import { useMemo, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserContext } from '../utils/userContext';
import Icon from 'react-native-vector-icons/Feather';
import { colors, radii, spacing, typography, shadows } from '../theme';

export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;

const EmptyCart = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <Icon name="shopping-cart" size={54} color={colors.muted} />
    </View>
    <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
    <Text style={styles.emptySubtitle}>Add some delicious items to get started</Text>
  </View>
);

const Cart = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { mappedItems, user } = useContext(UserContext);
  const totalItems = mappedItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = useMemo(() => {
    return mappedItems.reduce((sum, item) => {
      const unitPrice = Number(item.offerPrice ?? item.price ?? 0);
      const quantity = Number(item.quantity ?? 0);
      return sum + unitPrice * quantity;
    }, 0);
  }, [mappedItems]);

  const role = String(user?.role || '')
    .toLowerCase()
    .trim();
  const isNonCustomer = Boolean(role) && role !== 'customer';

  if (isNonCustomer) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="shield" size={54} color={colors.muted} />
          </View>
          <Text style={styles.emptyTitle}>Customer Only</Text>
          <Text style={styles.emptySubtitle}>
            Ordering is available only for customer accounts.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Home')}
            style={({ pressed }) => [
              styles.checkoutBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.checkoutText}>Go to Dashboard</Text>
            <Icon name="arrow-right" size={18} color={colors.surface} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() =>
              navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeWithDrawer')
            }
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}
          >
            <Icon name="arrow-left" size={18} color={colors.text} />
          </Pressable>

          <View style={styles.headerContent}>
            <Icon name="shopping-cart" size={22} color={colors.primary} />
            <Text style={styles.headingTxt}>Your Cart</Text>
          </View>
        </View>

        {totalItems > 0 && (
          <View style={styles.itemBadge}>
            <Text style={styles.itemBadgeText}>{totalItems}</Text>
          </View>
        )}
      </View>

      {totalItems === 0 ? (
        <EmptyCart />
      ) : (
        <>
          {/* Cart Items */}
          <FlatList
            data={mappedItems}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Image style={styles.cartImg} source={{ uri: item.image?.url }} />

                <View style={styles.itemDetails}>
                  <Text style={styles.nameTxt} numberOfLines={1}>
                    {item.name}
                  </Text>

                  <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>
                      {'\u20B9'}
                      {item.price}
                    </Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        {item.discountPercent}% OFF
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.offerPrice}>
                    {'\u20B9'}
                    {item.offerPrice}
                  </Text>
                </View>

                <View style={styles.counterContainer}>
                  <Counter item={item} />
                </View>
              </View>
            )}
          />

          {/* Checkout Bar */}
          <View
            style={[styles.checkoutBar, { paddingBottom: insets.bottom + 10 }]}
          >
            <View>
              <Text style={styles.checkoutLabel}>Total</Text>
              <Text style={styles.checkoutPrice}>
                {'\u20B9'}
                {total.toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Icon name="arrow-right" size={18} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default Cart;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  /* Header */
  headerSection: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  headingTxt: {
    ...typography.h1,
    color: colors.text,
  },

  itemBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    minWidth: 30,
    alignItems: 'center',
  },

  itemBadgeText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },

  /* List */
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 140,
  },

  itemContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginVertical: spacing.xs,
    padding: spacing.sm,
    ...shadows.card,
  },

  cartImg: {
    width: screenWidth * 0.22,
    height: screenHeight * 0.1,
    borderRadius: radii.md,
    marginRight: spacing.sm,
  },

  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },

  nameTxt: {
    ...typography.sub,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  originalPrice: {
    ...typography.caption,
    color: colors.muted,
    textDecorationLine: 'line-through',
    marginRight: spacing.sm,
  },

  discountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radii.xs,
  },

  discountText: {
    ...typography.caption,
    color: colors.accent,
  },

  offerPrice: {
    ...typography.body,
    color: colors.accent,
  },

  counterContainer: {
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },

  /* Empty */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  emptyIconContainer: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 50,
    marginBottom: spacing.md,
    ...shadows.soft,
  },

  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  emptySubtitle: {
    ...typography.sub,
    color: colors.muted,
    textAlign: 'center',
  },

  /* Checkout Bar */
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  checkoutLabel: {
    ...typography.caption,
    color: colors.muted,
  },

  checkoutPrice: {
    ...typography.h2,
    color: colors.text,
  },

  checkoutBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  checkoutText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
});
