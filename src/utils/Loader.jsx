import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, typography, shadows } from '../theme';

const Loader = () => {
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1,
    );

    scale.value = withRepeat(withTiming(1.05, { duration: 800 }), -1, true);
  }, [rotate, scale]);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }, { scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrap, rotateStyle]}>
        <Ionicons name="fast-food-outline" size={56} color={colors.primary} />
      </Animated.View>

      <Text style={styles.text}>Loading delicious food...</Text>
    </View>
  );
};

export default Loader;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.tintAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.soft,
  },

  text: {
    ...typography.sub,
    color: colors.muted,
  },
});
