import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import React, { useContext, useEffect } from 'react';
import { UserContext } from './userContext';
import Entypo from 'react-native-vector-icons/Entypo';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;

const Counter = ({ item }) => {
  const { decreaseQuantity, increaseQuantity } = useContext(UserContext);

  const scale = useSharedValue(1);

  // Animate when quantity changes
  useEffect(() => {
    scale.value = withSpring(1.25, { damping: 10 }, () => {
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
          <Entypo name="minus" size={18} color="#4f46e5" />
        </Pressable>

        <Animated.Text style={[styles.quantity, animatedStyle]}>
          {item.quantity}
        </Animated.Text>

        <Pressable
          onPress={() => increaseQuantity({ item })}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <Entypo name="plus" size={18} color="#4f46e5" />
        </Pressable>
      </View>
    </View>
  );
};

export default Counter;

const styles = StyleSheet.create({
  wrapper: {
    width: screenWidth * 0.22,
    alignItems: 'center',
  },

  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 6,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  quantity: {
    color: '#111827',
    fontWeight: '800',
    minWidth: 26,
    textAlign: 'center',
    fontSize: 16,
  },

  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pressed: {
    opacity: 0.6,
  },
});
