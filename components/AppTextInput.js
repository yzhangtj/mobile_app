import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Colors } from "../config";

// Custom text input with pre-made styles and icon
export const AppTextInput = ({ icon, ...otherProps }) => {
  return (
    <View style={styles.container}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={Colors.medium}
          style={styles.icon}
        />
      )}
      <TextInput
        placeholderTextColor={Colors.medium}
        style={{
          color: Colors.dark,
          fontSize: 16,
        }}
        {...otherProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light,
    borderRadius: 10,
    flexDirection: "row",
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
});
