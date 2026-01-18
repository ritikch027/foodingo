import React, { useContext } from 'react';
import { UserContext } from '../utils/userContext';
import { useNavigation } from '@react-navigation/native';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';

import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

const RenderCategories = () => {
  const navigation = useNavigation();
  const { foodItems } = useContext(UserContext);

  const renderItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 60)}
      layout={Layout.springify()}
      style={styles.card}
    >
      <Pressable
        onPress={() =>
          navigation.navigate('CategoryItem', { category: item.category })
        }
        style={({ pressed }) => [styles.cardInner, pressed && { opacity: 0.8 }]}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: item.image.url }} style={styles.image} />
        </View>

        <Text style={styles.text} numberOfLines={2}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </Text>
      </Pressable>
    </Animated.View>
  );

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
    height: 150,
    marginTop: 10,
  },

  flatListContent: {
    paddingHorizontal: 20,
  },

  card: {
    width: 90,
    marginRight: 16,
    alignItems: 'center',
  },

  cardInner: {
    alignItems: 'center',
  },

  imageWrap: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 4,
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  text: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
});
