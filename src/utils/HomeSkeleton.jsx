import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const Block = ({ style }) => <View style={[styles.block, style]} />;

const HomeSkeleton = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, (marginTop = insets.top)]}>
      {/* Header */}
      <Block style={styles.headerLine} />
      <Block style={styles.search} />

      {/* Categories */}
      <View style={styles.row}>
        {[...Array(5)].map((_, i) => (
          <Block key={i} style={styles.circle} />
        ))}
      </View>

      {/* Restaurant Cards */}
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.card}>
          <Block style={styles.image} />
          <Block style={styles.title} />
          <Block style={styles.subtitle} />
        </View>
      ))}
    </View>
  );
};

export default HomeSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  block: {
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
  },

  headerLine: {
    height: 26,
    width: '60%',
    marginBottom: 16,
  },

  search: {
    height: 52,
    borderRadius: 14,
    marginBottom: 24,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingBottom: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },

  image: {
    height: 160,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  title: {
    height: 20,
    width: '70%',
    marginTop: 12,
    marginLeft: 12,
  },

  subtitle: {
    height: 14,
    width: '40%',
    marginTop: 8,
    marginLeft: 12,
  },
});
