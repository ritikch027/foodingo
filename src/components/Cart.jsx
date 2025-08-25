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
import { React, useEffect, useState, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserContext } from '../utils/userContext';
import Icon from 'react-native-vector-icons/Feather';

export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;

const Cart = () => {
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

  const CartSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Icon name="shopping-bag" size={24} color="#4b0082" />
          <Text style={styles.summaryTitle}>Order Summary</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items ({totalItems})</Text>
          <Text style={styles.summaryValue}>₹{total.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Delivery Fee</Text>
          <Text style={styles.summaryValue}>Free</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <Icon name="shopping-cart" size={24} color="#4b0082" />
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
        <FlatList
          data={mappedItems}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListFooterComponent={<CartSummary />}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Image style={styles.cartImg} source={{ uri: item.image.url }} />

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
      )}
    </View>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(255, 250, 245)',
  },
  headerSection: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
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
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 12,
  },
  itemBadge: {
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 30,
    alignItems: 'center',
  },
  itemBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgb(248, 241, 227)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginVertical: 6,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cartImg: {
    width: screenWidth * 0.22,
    height: screenHeight * 0.1,
    borderRadius: 10,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameTxt: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  offerPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  counterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
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
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  summaryContainer: {
    marginTop: 20,
  },
  summaryCard: {
    backgroundColor: 'rgb(248, 241, 227)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#d1d5db',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
});
