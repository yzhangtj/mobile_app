import React from "react";
import { StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

// Dynamic battery icon where icon is chosen at render time based on battery percentage prop
const getBatteryIcon = (props) => {
  if (props.isCharging)
    return (
      <Ionicons
        name="battery-charging"
        size={24}
        color="white"
        style={[props.style, { paddingTop: 12 }]}
      />
    );
  else if (props.battery < 25)
    return (
      <FontAwesome
        name="battery-0"
        size={17}
        color="white"
        style={props.style}
      />
    );
  else if (props.battery < 50)
    return (
      <FontAwesome
        name="battery-1"
        size={17}
        color="white"
        style={props.style}
      />
    );
  else if (props.battery < 75)
    return (
      <FontAwesome
        name="battery-2"
        size={17}
        color="white"
        style={props.style}
      />
    );
  else if (props.battery < 100)
    return (
      <FontAwesome
        name="battery-3"
        size={17}
        color="white"
        style={props.style}
      />
    );
  else
    return (
      <FontAwesome
        name="battery-4"
        size={17}
        color="white"
        style={props.style}
      />
    );
};

export const BatteryIndicator = (props) => {
  return getBatteryIcon(props);
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
