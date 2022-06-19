import * as React from "react";
import { Colors } from "../config";

import { createStackNavigator } from "@react-navigation/stack";
import { LoginScreen, SignupScreen, ForgotPasswordScreen } from "../screens";
import { ThemeContext } from "../providers";

const Stack = createStackNavigator();

export const AuthStack = () => {
  const darkTheme = React.useContext(ThemeContext).darkTheme;
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.navy,
        },
        headerTintColor: Colors.white,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          headerTitle: "",
          headerStyle: {
            backgroundColor: darkTheme ? Colors.navy : Colors.white,
          },
          headerTintColor: darkTheme ? Colors.white : Colors.black,
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerTitle: "",
          headerStyle: {
            backgroundColor: darkTheme ? Colors.navy : Colors.white,
          },
          headerTintColor: darkTheme ? Colors.white : Colors.black,
        }}
      />
    </Stack.Navigator>
  );
};
