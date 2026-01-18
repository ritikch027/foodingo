import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Counter from '../utils/counter';
import { useEffect, useState, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserContext } from '../utils/userContext';
import Icon from 'react-native-vector-icons/Feather';

export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;

const Cart = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { mappedItems, cartItems } = useContext(UserContext);
  const totalItems = mappedItems.reduce((sum, item) => sum + item.quantity, 0);

  const [total, setTotal] = useState(0);

  const getTotal = () => {
    let tempTotal = 0;
    mappedItems.forEach(element => {
      tempTotal += element.offerPrice * element.quantity;
    });
    setTotal(tempTotal);
  };

  useEffect(() => {
    getTotal();
  }, [cartItems]);

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="shopping-cart" size={60} color="#9ca3af" />
      </View>
      <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptySubtitle}>
        Add some delicious items to get started
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Icon name="shopping-cart" size={24} color="#4f46e5" />
          <Text style={styles.headingTxt}>Your Cart</Text>
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
            contentContainerStyle={[
              styles.listContainer,
              { paddingBottom: 140 },
            ]}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Image
                  style={styles.cartImg}
                  source={{ uri: item.image.url }}
                />

                <View style={styles.itemDetails}>
                  <Text style={styles.nameTxt}>{item.name}</Text>

                  <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>₹{item.price}</Text>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        {item.discountPercent}% OFF
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.offerPrice}>₹{item.offerPrice}</Text>
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
              <Text style={styles.checkoutPrice}>₹{total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              <Icon name="arrow-right" size={20} color="#fff" />
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
    backgroundColor: '#f9fafb',
  },

  /* Header */
  headerSection: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headingTxt: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginLeft: 12,
  },

  itemBadge: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 30,
    alignItems: 'center',
  },

  itemBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  /* List */
  listContainer: {
    paddingHorizontal: 20,
  },

  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    padding: 12,
    elevation: 2,
  },

  cartImg: {
    width: screenWidth * 0.22,
    height: screenHeight * 0.1,
    borderRadius: 12,
    marginRight: 12,
  },

  itemDetails: {
    flex: 1,
    justifyContent: 'center',
  },

  nameTxt: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },

  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  originalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },

  discountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  discountText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '700',
  },

  offerPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#22c55e',
  },

  counterContainer: {
    justifyContent: 'center',
    marginLeft: 12,
  },

  /* Empty */
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  emptyIconContainer: {
    backgroundColor: '#f3f4f6',
    padding: 30,
    borderRadius: 50,
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },

  /* Checkout Bar */
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  checkoutLabel: {
    fontSize: 14,
    color: '#6b7280',
  },

  checkoutPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },

  checkoutBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
