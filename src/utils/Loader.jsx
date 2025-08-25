import { ActivityIndicator } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const Loader = () => {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#D86C4E" />
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9F6', // match your theme
  },
});
