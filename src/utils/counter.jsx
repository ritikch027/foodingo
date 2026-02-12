import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import React, { useContext, useEffect } from 'react';
import { UserContext } from './userContext';
import Entypo from 'react-native-vector-icons/Entypo';
import { colors, radii, spacing, typography } from '../theme';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;

const Counter = ({ item }) => {
  const { decreaseQuantity, increaseQuantity } = useContext(UserContext);

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1.2, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
  }, [item.quantity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.counter}>
        <Pressable
          onPress={() => decreaseQuantity({ item })}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <Entypo name="minus" size={18} color={colors.primary} />
        </Pressable>

        <Animated.Text style={[styles.quantity, animatedStyle]}>
          {item.quantity}
        </Animated.Text>

        <Pressable
          onPress={() => increaseQuantity({ item })}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <Entypo name="plus" size={18} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
};

export default Counter;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 2,
    width: screenWidth * 0.22,
    alignItems: 'center',
  },

  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg,
    borderRadius: radii.md,
    paddingVertical: 6,
    paddingHorizontal: 6,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },

  quantity: {
    color: colors.text,
    fontWeight: '800',
    minWidth: 26,
    textAlign: 'center',
    fontSize: 16,
  },

  iconBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.tintAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pressed: {
    opacity: 0.6,
  },
});
