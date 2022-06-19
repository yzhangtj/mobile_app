import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { RootNavigator } from "./navigation";
import {
  AuthenticatedUserProvider,
  NotificationProvider,
  ThemeProvider
} from "./providers";

const App = () => {
  return (
    <AuthenticatedUserProvider>
      <NotificationProvider>
        <ThemeProvider>
          <SafeAreaProvider>
            <StatusBar
              translucent
              backgroundColor="transparent"
            />
            <RootNavigator />
          </SafeAreaProvider>
        </ThemeProvider>
      </NotificationProvider>
    </AuthenticatedUserProvider>
  );
};

export default App;
