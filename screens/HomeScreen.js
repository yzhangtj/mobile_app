import React, { useContext } from "react";
import { Text, StyleSheet } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { View, Icon } from "../components";
import { Colors } from "../config";
import { DeviceListHOC } from "../components";
import { TouchableOpacity } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { ThemeContext, NotificationContext } from "../providers";

export const HomeScreen = ({ navigation }) => {
  const darkTheme = useContext(ThemeContext).darkTheme;
  const warnings = useContext(NotificationContext).warnings;
  const isFocused = useIsFocused();

  return (
    <View
      style={[
        styles.container,
        !darkTheme && { backgroundColor: Colors.superLightGrey },
      ]}
    >
      <View style={styles.innerContainer}>
        <Text style={[styles.screenTitle, !darkTheme && { color: "black" }]}>
          Device List
        </Text>
        <View
          style={{
            width: 110,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("RegisterDevice")}
          >
            <MaterialIcons
              name="add-circle"
              size={35}
              color={darkTheme ? "white" : "black"}
              style={{ paddingRight: 10 }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Map")}>
            <FontAwesome
              name="map-marker"
              size={35}
              color={darkTheme ? "white" : "black"}
              style={{ paddingRight: 10 }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Icon
              name={"cog"}
              size={35}
              color={darkTheme ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* Pass `warnings` to increment warning count and `isFocused` for refreshing */}
      <DeviceListHOC
        warnings={warnings}
        isFocused={isFocused}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
    paddingHorizontal: 18,
    paddingBottom: 24,
    paddingTop: 65,
  },
  innerContainer: {
    paddingTop: 8,
    paddingBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  screenTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: Colors.white,
    paddingLeft: 8,
  },
});
