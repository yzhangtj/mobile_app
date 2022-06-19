import * as React from "react";
import { Colors } from "../config";
import { Pressable } from "react-native";
import { Icon } from "../components";
import { createStackNavigator } from "@react-navigation/stack";
import { ThemeContext } from "../providers";
import {
  HomeScreen,
  MapScreen,
  RegisterDeviceScreen,
  DetailScreenHOC,
  SettingScreen
} from "../screens";

const Stack = createStackNavigator();

// go to setting screen
const navigateToSettings = (navigation) => {
  const darkTheme = React.useContext(ThemeContext).darkTheme;
  return (
    <Pressable
      onPress={() => {
        navigation.navigate("Settings");
      }}
    >
      <Icon
        name={"cog"}
        size={30}
        color={darkTheme ? Colors.white : Colors.black}
        style={{ marginRight: 15 }}
      />
    </Pressable>
  );
};

// register screens for later navigation
export const AppStack = () => {
  const darkTheme = React.useContext(ThemeContext).darkTheme;
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: darkTheme ? Colors.navy : Colors.white,
        },
        headerTintColor: darkTheme ? Colors.white : Colors.black,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          headerRight: () => navigateToSettings(navigation),
          headerShown: false,
        })}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ headerTitle: "Device Map" }}
      />
      <Stack.Screen
        name="RegisterDevice"
        component={RegisterDeviceScreen}
        options={({ navigation }) => ({
          headerTitle: "",
          headerRight: () => navigateToSettings(navigation),
        })}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreenHOC}
        options={({ navigation }) => ({
          headerTitle: "",
          headerRight: () => navigateToSettings(navigation),
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingScreen}
        options={{
          headerTitle: "Settings",
        }}
      />
    </Stack.Navigator>
  );
};
