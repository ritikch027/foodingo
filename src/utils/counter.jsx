import { StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import { React, useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from './userContext';
import Entypo from 'react-native-vector-icons/Entypo';
const screenWidth = Dimensions.get('window').width;
const Counter = ({ item }) => {
  const { decreaseQuantity, increaseQuantity } = useContext(UserContext);
  const [localQty, setLocalQty] = useState(item.quantity);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Animate when quantity changes
  useEffect(() => {
    if (item.quantity !== localQty) {
      setLocalQty(item.quantity);
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [item.quantity]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.counter}>
        <Entypo
          onPress={() => decreaseQuantity({ item })}
          style={styles.icon}
          name="minus"
          size={18}
          color="rgb(84, 79, 59)"
        />

        <Animated.Text
          style={[styles.quantity, { transform: [{ scale: scaleAnim }] }]}
        >
          {item.quantity}
        </Animated.Text>

        <Entypo
          onPress={() => increaseQuantity({ item })}
          style={styles.icon}
          name="plus"
          size={18}
          color="rgb(84, 79, 59)"
        />
      </View>
    </View>
  );
};

export default Counter;

const styles = StyleSheet.create({
  wrapper: {
    width: screenWidth * 0.2,
    margin: 10,
    alignItems: 'center',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2', // light neutral color
    borderRadius: 6,
    paddingVertical: 6,
    width: '100%',
    borderWidth: 1,
    borderColor: 'black',
  },
  quantity: {
    color: 'black',
    fontWeight: 'bold',
    minWidth: 25,
    textAlign: 'center',
  },
  icon: {
    paddingHorizontal: 5,
  },
});
