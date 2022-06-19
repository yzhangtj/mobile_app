import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as Navigation from "../navigation/navigation";
import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { AsyncStorage } from "react-native";
import { AuthenticatedUserContext } from "./AuthenticatedUserProvider";

export const NotificationContext = createContext({});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const NotificationProvider = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [warnings, setWarnings] = useState({});
  const user = useContext(AuthenticatedUserContext).user;
  const notificationListener = useRef();
  const responseListener = useRef();
  const isMounted = useRef(false);

  const initializeWarningCount = async () => {
    try {
      const warningsCount = await AsyncStorage.getItem('@warnings');
      if (warningsCount !== null) {
        setWarnings(JSON.parse(warningsCount));
      }
    } catch (error) {
      console.log("[NotificationProvider] initializeWarnings error: " + error.message);
    }
  }

  const updateWarningCount = async (deviceId) => {
    // either increment warning count or initialize to 1 if first ever notification
    setWarnings(previousState => {
      let warningCount = deviceId in warnings ? previousState[deviceId] + 1 : 1;
      return { ...previousState, [deviceId]: warningCount };
    });
  }

  const updateWarningCountStorage = async () => {
    try {
      await AsyncStorage.setItem("@warnings", JSON.stringify(warnings));
    } catch (error) {
      console.log("[NotificationProvider] updateWarningsStorage error: " + error.message);
    }
  }

  useEffect(() => {
    // get warnings count from storage
    initializeWarningCount();

    // register device for push notifications
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // fired whenever a notification is received while the app is in the foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
    });

    // fired whenever a user taps on or interacts with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      if (user) {
        Navigation.navigate("Home");
        Navigation.navigate("Detail", {
          deviceID: response.notification.request.content.data.id,
          deviceName: response.notification.request.content.data.name,
          deviceDescription: response.notification.request.content.data.description,
          page: "alert"
        });
      }
      else {
        updateWarningCount(response.notification.request.content.data.id);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [user]);

  // set value in storage whenever state of `warnings` changes
  useEffect(() => {
    if (isMounted.current) {
      updateWarningCountStorage();
    }
    // enable `useEffect`s that were skipped during initial render
    isMounted.current = true;
  }, [warnings]);

  return (
    <NotificationContext.Provider value={{
      expoPushToken,
      setExpoPushToken,
      warnings,
      setWarnings,
      updateWarningCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}