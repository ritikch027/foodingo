import React from 'react';
import { FlatList, View, Text, Image, StyleSheet } from 'react-native';

const RenderOffer = ({ items }) => {
  return (
    <View style={{ height: 100, marginTop: 5 }}>
      <FlatList
        horizontal
        data={items}
        keyExtractor={item => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Image source={{ uri: item.image_url }} style={styles.listImg} />
            <Text style={styles.itemText}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default RenderOffer;

const styles = StyleSheet.create({
  flatListContent: {
    alignItems: 'center',
    paddingLeft: '5%',
  },
  itemContainer: {
    alignItems: 'center',
    marginRight: 10,
    width: 90,
  },
  listImg: {
    width: 80,
    height: 60,
    borderRadius: 10,
    borderColor: '#ffbf5e',
    borderWidth: 3,
    marginBottom: 5,
  },
  itemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3E3E3E',
    textAlign: 'center',
  },
});
