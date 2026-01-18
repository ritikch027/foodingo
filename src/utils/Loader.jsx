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

const Loader = () => {
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }),
      -1,
    );

    scale.value = withRepeat(withTiming(1.1, { duration: 800 }), -1, true);
  }, []);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }, { scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.iconWrap, rotateStyle]}>
        <Ionicons name="fast-food-outline" size={64} color="#4f46e5" />
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
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
});
