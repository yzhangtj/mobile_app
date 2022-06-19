import React, { useContext, useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Modal, Pressable } from "react-native";
import { signOut } from "firebase/auth";
import { Colors, auth, backend } from "../config";
import { Slider } from "@miblanchard/react-native-slider";
import { ThemeContext } from "../providers";
import { AppSwitch, Button } from "../components";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

// screen for changing user settings
export const SettingScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userNotification, setUserNotification] = useState({
    pushNotify: true,
    emailNotify: true,
    notificationInterval: 30,
  }); // default values
  const [interval, setInterval] = useState(false);
  const [pageInterval, setPageInterval] = useState(
    userNotification.notificationInterval
  );
  const togglePushNotify = () => {
    setUserNotification((previousState) => {
      return { ...previousState, pushNotify: !previousState.pushNotify };
    });
  };
  const toggleEmailNotify = () => {
    setUserNotification((previousState) => {
      return { ...previousState, emailNotify: !previousState.emailNotify };
    });
  };
  const setNotificationInterval = (interval) => {
    setUserNotification((previousState) => {
      return { ...previousState, notificationInterval: interval };
    });
  };
  const decreaseNotificationInterval = () => {
    if (userNotification.notificationInterval !== 10) {
      setUserNotification((previousState) => {
        return {
          ...previousState,
          notificationInterval: previousState.notificationInterval - 10,
        };
      });
    }
  };
  const increaseNotificationInterval = () => {
    if (userNotification.notificationInterval !== 1440) {
      setUserNotification((previousState) => {
        return {
          ...previousState,
          notificationInterval: previousState.notificationInterval + 10,
        };
      });
    }
  };

  // set values in local storage
  // trigger changes throughout app when theme switches
  const setTheme = useContext(ThemeContext).setTheme;
  const darkTheme = useContext(ThemeContext).darkTheme;
  const setDarkTheme = useContext(ThemeContext).setDarkTheme;
  const toggleDarkTheme = () => setDarkTheme((previousState) => !previousState);

  const isMounted = useRef(false);

  const handleLogout = () => {
    signOut(auth).catch((error) => console.log("Error logging out: ", error));
  };

  // get a user's preferences from backend
  const retrieveUserInfo = () => {
    auth.currentUser
      .getIdToken(true)
      .then((token) => {
        console.log("[Setting] retrieveUserInfo: Starting request");
        setIsLoading(true);

        return fetch(new URL("users/info", backend.http_domain), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
          }),
        });
      })
      .then((response) => {
        return response.json();
      })
      .then((userInfo) => {
        // show user's actual prefs instead of defaults
        setUserNotification({
          pushNotify: userInfo.push_notify,
          emailNotify: userInfo.email_notify,
          notificationInterval: userInfo.notification_interval,
        });
        setPageInterval(userInfo.notification_interval);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("[Setting] retrieveUserInfo error: " + error.message);
      });
  };

  // set new user options
  const setUserInfo = () => {
    auth.currentUser
      .getIdToken(true)
      .then((token) => {
        console.log("[Setting] setUserInfo: Starting request");

        return fetch(new URL("users/config", backend.http_domain), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            push_notify: userNotification.pushNotify,
            email_notify: userNotification.emailNotify,
            notification_interval: userNotification.notificationInterval,
          }),
        });
      })
      .catch((error) => {
        console.log("[Setting] setUserInfo error: " + error.message);
      });
  };

  // format time in interval selector
  const minToHour = (minute) => {
    let hour = 0;
    let minuteLeft = 0;
    if (minute < 60) return { hour: 0, minuteLeft: minute };
    else {
      minuteLeft = minute % 60;
      hour = (minute - minuteLeft) / 60;
      return { hour, minuteLeft };
    }
  };

  // format time string
  const formatModalText = ({ hour, minuteLeft }) => {
    if (hour == 0) {
      return minuteLeft + " mins";
    } else return hour + " hrs " + minuteLeft + " mins";
  };

  // retrieve user info only once during mounting of Setting screen
  useEffect(() => {
    retrieveUserInfo();
  }, []);

  // set value in storage whenever state of `darkTheme` changes
  useEffect(() => {
    if (isMounted.current) {
      setTheme();
    }
  }, [darkTheme]);

  // set user info whenever push or email notification toggle switch changes
  useEffect(() => {
    if (isMounted.current) {
      setUserInfo();
    }
  }, [userNotification.pushNotify, userNotification.emailNotify]);

  // set user info whenever notification interval is confirmed in modal
  useEffect(() => {
    if (isMounted.current) {
      setUserInfo();
    }
    // enable `useEffect`s that were skipped during initial render
    isMounted.current = true;
  }, [interval]);

  return (
    <View
      style={[
        styles.container,
        !darkTheme && { backgroundColor: Colors.white },
      ]}
    >
      <View style={styles.settingBox}>
        <View style={styles.listBox}>
          <View style={styles.listTextBox}>
            <Text
              style={[styles.listText, !darkTheme && { color: Colors.black }]}
            >
              Enable push notifications
            </Text>
          </View>
          <AppSwitch
            style={{ flex: 0.95 }}
            onValueChange={togglePushNotify}
            status={userNotification.pushNotify}
          />
        </View>
        <View style={styles.listBox}>
          <View style={styles.listTextBox}>
            <Text
              style={[styles.listText, !darkTheme && { color: Colors.black }]}
            >
              Enable email notifications
            </Text>
          </View>
          <AppSwitch
            style={{ flex: 0.95 }}
            onValueChange={toggleEmailNotify}
            status={userNotification.emailNotify}
          />
        </View>
        <View style={styles.listBox}>
          <View style={styles.listTextBox}>
            <Text
              style={[styles.listText, !darkTheme && { color: Colors.black }]}
            >
              Enable light theme
            </Text>
          </View>
          <AppSwitch
            style={{ flex: 0.95 }}
            onValueChange={toggleDarkTheme}
            status={!darkTheme}
          />
        </View>
        <View style={[styles.listBox, { justifyContent: "space-between" }]}>
          <View style={styles.listTextBox}>
            <Text
              style={[styles.listText, !darkTheme && { color: Colors.black }]}
            >
              Notification interval
            </Text>
          </View>
          <View style={styles.listTextBox}>
            <Pressable
              style={{
                alignSelf: "flex-end",
                borderRadius: 10,
                backgroundColor: darkTheme ? Colors.lightNavy : Colors.grey,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 8,
                paddingHorizontal: 18,
              }}
              onPress={() => setModalVisible(true)}
            >
              {isLoading ? (
                <Text
                  style={[
                    styles.listText,
                    !darkTheme && { color: Colors.black },
                  ]}
                >
                  --
                </Text>
              ) : (
                <Text
                  style={[
                    styles.listText,
                    !darkTheme && { color: Colors.black },
                  ]}
                >
                  {formatModalText(minToHour(pageInterval))}
                </Text>
              )}
            </Pressable>
          </View>
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
              retrieveUserInfo();
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.modalTextBox}>
                  <Button onPress={decreaseNotificationInterval}>
                    <MaterialCommunityIcons
                      name="chevron-left"
                      size={30}
                      color={Colors.black}
                      style={{ marginRight: 15 }}
                    />
                  </Button>
                  <Text style={styles.modalText}>
                    {"Every " +
                      formatModalText(
                        minToHour(userNotification.notificationInterval)
                      )}
                  </Text>
                  <Button onPress={increaseNotificationInterval}>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={30}
                      color={Colors.black}
                      style={{ marginLeft: 15 }}
                    />
                  </Button>
                </View>
                <View style={styles.modalSlider}>
                  <Slider
                    value={[userNotification.notificationInterval]}
                    minimumValue={10}
                    maximumValue={1440}
                    step={10}
                    minimumTrackTintColor={Colors.green}
                    thumbTintColor={Colors.green}
                    onValueChange={(value) => setNotificationInterval(value[0])}
                  />
                </View>
                <View style={styles.modalButtonBox}>
                  <Button
                    style={[
                      styles.modalButton,
                      { backgroundColor: Colors.red },
                    ]}
                    onPress={() => {
                      setModalVisible(!modalVisible);
                      retrieveUserInfo();
                    }}
                  >
                    <Text style={styles.modalButtonText}>{"Cancel "}</Text>
                    <MaterialCommunityIcons
                      name="close"
                      size={24}
                      color={Colors.white}
                    />
                  </Button>
                  <Button
                    style={[
                      styles.modalButton,
                      { backgroundColor: Colors.doneBlue },
                    ]}
                    onPress={() => {
                      setModalVisible(!modalVisible);
                      setPageInterval(userNotification.notificationInterval);
                      setInterval(!interval);
                    }}
                  >
                    <Text style={styles.modalButtonText}>{"Confirm "}</Text>
                    <MaterialIcons name="done" size={22} color={Colors.white} />
                  </Button>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
      <View style={styles.buttonBox}>
        <Button style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
    alignItems: "center",
  },
  settingBox: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 12,
  },
  buttonBox: {
    flex: 2.2,
    //paddingTop: 400,
    alignItems: "center",
  },
  button: {
    width: 300,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.red,
    padding: 10,
    marginTop: 400,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: "700",
  },
  listBox: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 30,
    justifyContent: "center",
  },
  listTextBox: {
    justifyContent: "center",
    alignContent: "center",
    flex: 4,
  },
  listText: {
    fontSize: 18,
    color: Colors.white,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  modalView: {
    width: 280,
    height: 200,
    backgroundColor: "white",
    borderRadius: 20,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  modalTextBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  modalText: {
    color: Colors.black,
    fontSize: 16,
    textAlign: "center",
  },
  modalButtonBox: {
    width: "100%",
    position: "absolute",
    bottom: 20,
    left: 20,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalButton: {
    width: 110,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.doneBlue,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "500",
    paddingTop: 2,
  },
  modalSlider: {
    marginVertical: 16,
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
});
