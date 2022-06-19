import React from "react";
import { StyleSheet, Text } from "react-native";

import { Colors } from "../config";

// custom error form with pre-made style
export const FormErrorMessage = ({ error, visible }) => {
  if (!error || !visible) {
    return null;
  }

  return <Text style={styles.errorText}>{error}</Text>;
};

const styles = StyleSheet.create({
  errorText: {
    marginLeft: 15,
    color: Colors.red,
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },
});
