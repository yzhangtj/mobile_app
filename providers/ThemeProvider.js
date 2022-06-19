import React, {useState, createContext, useEffect, useRef} from "react";
import { StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const [darkTheme, setDarkTheme] = useState(true);
  const isMounted = useRef(false);

  const getTheme = async() => {
    try {
      const theme = await AsyncStorage.getItem('@theme');
      if (theme !== null) {
        setDarkTheme(theme === "dark");
      }
    } catch (error) {
      console.log("[ThemeProvider] getTheme error: " + error.message);
    }
  }

  const setTheme = async () => {
    try {
      await AsyncStorage.setItem("@theme", darkTheme ? "dark" : "light");
    } catch (error) {
      console.log("[ThemeProvider] setTheme error: " + error.message);
    }
  }

  useEffect( () => {
    // get device theme from storage
    getTheme();
  }, []);

  // set bar style whenever state of darkTheme changes
  useEffect(() => {
    if (isMounted.current) {
      StatusBar.setBarStyle(darkTheme ? "light-content" : 'dark-content');
    }
    // enable `useEffect`s that were skipped during initial render
    isMounted.current = true;
  }, [darkTheme]);

  return (
    <ThemeContext.Provider value={{ setTheme, darkTheme, setDarkTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
