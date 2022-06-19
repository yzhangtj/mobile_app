import React from "react";
import { View, Switch, StyleSheet } from "react-native";
import { Colors } from "../config";

// Custom switch button with pre-made styles
export const AppSwitch = ({ onValueChange, status, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Switch
        trackColor={{ false: Colors.superLightGrey, true: Colors.green }}
        thumbColor={"#ffffff"}
        ios_backgroundColor={Colors.superLightGrey}
        onValueChange={onValueChange}
        value={status}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
