import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import Counter from './counter';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { colors, radii, spacing, typography, shadows, motion } from '../theme';
import Icon from 'react-native-vector-icons/Feather';

const ItemCard = ({ item, cartItem, onAdd, index = 0 }) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(motion.fadeDuration).delay(
        index * motion.fadeDelay,
      )}
      layout={Layout.springify()}
      style={styles.card}
    >
      <View style={styles.leftContent}>
        <View
          style={[
            styles.vegMarkOuter,
            item.isVeg ? styles.vegMarkOuterVeg : styles.vegMarkOuterNonVeg,
          ]}
        >
          <View
            style={[
              styles.vegMarkInner,
              item.isVeg ? styles.vegMarkInnerVeg : styles.vegMarkInnerNonVeg,
            ]}
          />
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {'\u20B9'}
            {Number(item.offerPrice || item.price || 0).toFixed(2)}
          </Text>
          {Number(item.offerPrice || 0) < Number(item.price || 0) && (
            <Text style={styles.oldPrice}>
              {'\u20B9'}
              {Number(item.price || 0).toFixed(2)}
            </Text>
          )}
        </View>

        <Text style={styles.desc} numberOfLines={3}>
          {item.description || `${item.discountPercent || 0}% off on this item`}
        </Text>

        <View style={styles.metaActions}>
          <Pressable style={styles.metaIconBtn}>
            <Icon name="bookmark" size={16} color={colors.muted} />
          </Pressable>
          <Pressable style={styles.metaIconBtn}>
            <Icon name="corner-up-right" size={16} color={colors.muted} />
          </Pressable>
        </View>
      </View>

      <View style={styles.rightContent}>
        {item?.image?.url ? (
          <Image source={{ uri: item.image.url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <Icon name="image" size={20} color={colors.muted} />
          </View>
        )}

        {cartItem ? (
          <View style={styles.counterSlot}>
            <Counter item={cartItem} compact />
          </View>
        ) : (
          <Pressable
            onPress={() => onAdd?.(item)}
            style={({ pressed }) => [
              styles.addBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.addText}>ADD</Text>
            <Icon name="plus" size={18} color={colors.primaryDark} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
};

export default ItemCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    gap: spacing.md,
  },

  leftContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },

  rightContent: {
    width: 132,
    alignItems: 'center',
  },

  image: {
    width: 132,
    height: 132,
    borderRadius: radii.lg,
    backgroundColor: colors.bg,
  },
  imageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  name: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xs,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  price: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '800',
  },

  oldPrice: {
    ...typography.caption,
    color: colors.muted,
    textDecorationLine: 'line-through',
  },

  desc: {
    ...typography.sub,
    color: colors.muted,
    marginTop: spacing.sm,
    lineHeight: 22,
  },

  addBtn: {
    position: 'absolute',
    bottom: -14,
    width: 116,
    marginTop: spacing.sm,
    backgroundColor: '#E8F5EE',
    borderWidth: 1,
    borderColor: '#3E9C69',
    paddingVertical: 10,
    borderRadius: radii.md,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    alignItems: 'center',
    ...shadows.soft,
  },

  addText: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 18,
  },

  vegMarkOuter: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  vegMarkInner: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  vegMarkOuterVeg: {
    borderColor: '#16A34A',
  },
  vegMarkOuterNonVeg: {
    borderColor: '#DC2626',
  },
  vegMarkInnerVeg: {
    backgroundColor: '#16A34A',
  },
  vegMarkInnerNonVeg: {
    backgroundColor: '#DC2626',
  },

  metaActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  metaIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  counterSlot: {
    position: 'absolute',
    bottom: -14,
  },
});
