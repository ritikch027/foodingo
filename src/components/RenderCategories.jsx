import React, { useContext } from 'react';
import { UserContext } from '../utils/userContext';
import { useNavigation } from '@react-navigation/native';
import { FlatList, View, Text, Image, StyleSheet, Pressable } from 'react-native';

import Animated, { FadeInRight, Layout } from 'react-native-reanimated';
import { colors, radii, spacing, typography, shadows, motion } from '../theme';

const RenderCategories = () => {
  const navigation = useNavigation();
  const { foodItems } = useContext(UserContext);

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInRight.duration(motion.fadeDuration).delay(
        index * motion.fadeDelay,
      )}
      layout={Layout.springify()}
      style={styles.card}
    >
      <Pressable
        onPress={() =>
          navigation.navigate('CategoryItem', { category: item.category })
        }
        style={({ pressed }) => [styles.cardInner, pressed && styles.pressed]}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: item.image.url }} style={styles.image} />
        </View>

        <Text style={styles.text} numberOfLines={2}>
          {item.category}
        </Text>
      </Pressable>
    </Animated.View>
  );

  if (!foodItems.length) {
    return (
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <FlatList
        horizontal
        data={foodItems}
        keyExtractor={item => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        renderItem={renderItem}
      />
    </View>
  );
};

export default RenderCategories;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  wrapper: {
    height: 110,
    marginTop: spacing.sm,
  },

  flatListContent: {
    paddingHorizontal: spacing.lg,
  },

  card: {
    width: 92,
    marginRight: spacing.md,
    alignItems: 'center',
  },

  cardInner: {
    alignItems: 'center',
  },

  pressed: {
    opacity: 0.8,
  },

  imageWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.tintAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.soft,
  },

  image: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  text: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
  },

  loadingWrap: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    ...typography.caption,
    color: colors.muted,
  },
});
