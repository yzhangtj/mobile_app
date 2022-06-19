import React from "react";
import { StyleSheet, SafeAreaView, View } from "react-native";

// wrapper with Iphone notch support from SafeAreaView
export const Screen = ({ children, style }) => {
  return (
    <SafeAreaView style={[styles.screen, style]}>
      <View style={[styles.view, style]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  view: {
    flex: 1,
  },
});
