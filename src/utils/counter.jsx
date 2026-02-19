import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import React, { useContext, useEffect } from 'react';
import { UserContext } from './userContext';
import Entypo from 'react-native-vector-icons/Entypo';
import { colors, radii } from '../theme';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;

const Counter = ({ item, compact = false }) => {
  const { decreaseQuantity, increaseQuantity } = useContext(UserContext);

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1.2, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
  }, [item.quantity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      <View style={[styles.counter, compact && styles.counterCompact]}>
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
  wrapperCompact: {
    width: 116,
    marginTop: 0,
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
  counterCompact: {
    backgroundColor: '#E8F5EE',
    borderColor: '#3E9C69',
    borderRadius: radii.md,
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
