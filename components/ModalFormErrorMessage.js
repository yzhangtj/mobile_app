import React from "react";
import { StyleSheet, Text } from "react-native";

import { Colors } from "../config";

// wrapper with error handling
export const ModalFormErrorMessage = ({ error, visible }) => {
  if (!error || !visible) {
    return null;
  }

  return <Text style={styles.modalErrorText}>{error}</Text>;
};

const styles = StyleSheet.create({
  modalErrorText: {
    color: Colors.red,
    fontSize: 14,
    fontWeight: "600",
  },
});
