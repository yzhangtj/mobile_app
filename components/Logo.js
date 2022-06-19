import React from "react";
import { Image, StyleSheet } from "react-native";

// wrapper with pre-made style and image url prop
export const Logo = ({ uri }) => {
  return <Image source={uri} style={styles.image} />;
};

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 100,
    borderRadius: 0,
    marginTop: 0,
    marginBottom: 40,
  },
});
