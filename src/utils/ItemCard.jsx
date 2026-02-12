import { StyleSheet, Text, View, Image, Pressable, Dimensions } from 'react-native';
import Counter from './counter';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { colors, radii, spacing, typography, shadows, motion } from '../theme';

const screenWidth = Dimensions.get('window').width;

const ItemCard = ({ item, cartItem, onAdd, index = 0 }) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(motion.fadeDuration).delay(
        index * motion.fadeDelay,
      )}
      layout={Layout.springify()}
      style={styles.card}
    >
      <Image source={{ uri: item.image.url }} style={styles.image} />

      <View style={styles.cardBody}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.oldPrice}>{'\u20B9'}{item.price}</Text>
          <Text style={styles.price}>{'\u20B9'}{item.offerPrice}</Text>
        </View>

        <Text style={styles.discount}>{item.discountPercent}% OFF</Text>

        {cartItem ? (
          <Counter item={cartItem} />
        ) : (
          <Pressable
            onPress={() => onAdd?.(item)}
            style={({ pressed }) => [
              styles.addBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.vegBadge}>
        <Text style={styles.vegText}>
          {item.isVeg ? '\uD83D\uDFE2 Veg' : '\uD83D\uDD34 Non-Veg'}
        </Text>
      </View>
    </Animated.View>
  );
};

export default ItemCard;

const styles = StyleSheet.create({
  card: {
    width: screenWidth * 0.44,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    marginHorizontal: spacing.xs,
    overflow: 'hidden',
    ...shadows.card,
  },

  image: {
    width: '100%',
    height: 132,
  },

  cardBody: {
    padding: spacing.sm,
  },

  name: {
    ...typography.sub,
    color: colors.text,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },

  oldPrice: {
    ...typography.caption,
    color: colors.muted,
    textDecorationLine: 'line-through',
  },

  price: {
    ...typography.body,
    color: colors.accent,
  },

  discount: {
    ...typography.caption,
    color: colors.primaryDark,
    marginTop: spacing.xs,
  },

  addBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: radii.md,
    alignItems: 'center',
  },

  addText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 14,
  },

  vegBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 999,
    ...shadows.soft,
  },

  vegText: {
    ...typography.caption,
    color: colors.text,
  },
});
