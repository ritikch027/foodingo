import { React, useContext } from 'react';
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

const RenderCategories = () => {
  const navigation = useNavigation();
  const { foodItems } = useContext(UserContext);

  return (
    <View style={styles.wrapper}>
      <FlatList
        horizontal
        data={foodItems}
        keyExtractor={item => item._id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('CategoryItem', { category: item.category })
            }
            style={styles.itemContainer}
          >
            <Image source={{ uri: item.image.url }} style={styles.listImg} />
            <Text style={styles.itemText} numberOfLines={2}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
};

export default RenderCategories;

export const styles = StyleSheet.create({
  wrapper: {
    height: 130,
    marginTop: 10,
  },
  flatListContent: {
    alignItems: 'center',
    paddingLeft: '5%',
  },
  itemContainer: {
    alignItems: 'center',
    marginRight: 10,
    width: 70,
    height: 110,
    justifyContent: 'flex-start',
  },
  listImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: 'rgb(254, 197, 139)',
    borderWidth: 2,
    elevation: 6,
    marginBottom: 6,
  },
  itemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3E3E3E',
    textAlign: 'center',
  },
});
