import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { Colors } from '../config';
import { View } from './View';

// wrapper with pre-made style
export const LoadingIndicator = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size='large' color={Colors.red} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
