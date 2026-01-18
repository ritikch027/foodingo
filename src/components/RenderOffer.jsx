import React from 'react';
import {
  FlatList,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';

const RenderOffer = ({ items }) => {
  const renderItem = ({ item, index }) => {
    return (
      <Animated.View
        entering={FadeInRight.delay(index * 80)}
        layout={Layout.springify()}
        style={styles.card}
      >
        <Pressable style={styles.cardInner}>
          <Image source={{ uri: item.image_url }} style={styles.image} />
          <View style={styles.overlay} />

          <View style={styles.textWrap}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={items}
        keyExtractor={item => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        renderItem={renderItem}
      />
    </View>
  );
};

export default RenderOffer;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },

  flatListContent: {
    paddingHorizontal: 20,
  },

  card: {
    width: 220,
    height: 120,
    marginRight: 16,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
  },

  cardInner: {
    flex: 1,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  textWrap: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },

  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
