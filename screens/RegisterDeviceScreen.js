import React, { useContext, useState } from "react";
import { StyleSheet, Text, Modal, Alert } from "react-native";
import { Formik } from "formik";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import LottieView from "lottie-react-native";
import { BarIndicator } from "react-native-indicators";
import { registerDeviceSchema } from "../utils";
import { Colors, auth, backend } from "../config";
import { View, TextInput, Button, FormErrorMessage } from "../components";
import { ThemeContext } from "../providers";

export const RegisterDeviceScreen = ({ navigation }) => {
  const darkTheme = useContext(ThemeContext).darkTheme;
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceValid, setDeviceValid] = useState(false);
  const [registering, setRegistering] = useState(true);

  // request to register device with backend
  const handleRegistration = (values) => {
    const { name, imei, serial, description } = values;

    auth.currentUser
      .getIdToken(true)
      .then((token) => {
        return fetch(new URL("devices/register", backend.http_domain), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            name: name,
            imei: imei,
            serial: serial,
            description: description,
          }),
        });
      })
      .then((response) => {
        if (response.status === 500) {
          console.log(
            "[RegisterDevice]: handleRegistration error: invalid information"
          );
          setDeviceValid(false);
        } else {
          response.text();
          setDeviceValid(true);
        }
      })
      .then((id) => {
        console.log("[RegisterDevice]: handleRegistration device ID: " + id);
        setRegistering(false);
      })
      .catch((error) => {
        console.log("[RegisterDevice]: handleRegistration error: " + error);
      });
  };

  return (
    <View
      style={[
        styles.container,
        !darkTheme && { backgroundColor: Colors.white },
      ]}
    >
      <KeyboardAwareScrollView enableOnAndroid={true}>
        <View style={styles.innerContainer}>
          <Text
            style={[styles.screenTitle, !darkTheme && { color: Colors.black }]}
          >
            Register New Device
          </Text>
        </View>
        {/* Formik Wrapper */}
        <Formik
          initialValues={{
            name: "",
            imei: "",
            serial: "",
            description: "",
          }}
          validationSchema={registerDeviceSchema}
          onSubmit={(values) => {
            setRegistering(true);
            setModalVisible(true);
            handleRegistration(values);
          }}
          style={{ backgroundColor: Colors.white }}
        >
          {({
            values,
            touched,
            errors,
            handleChange,
            handleSubmit,
            handleBlur,
          }) => (
            <>
              {/* Input fields */}
              <TextInput
                maxLength={12}
                name="name"
                leftIconName="devices"
                placeholder="Enter device name"
                autoCapitalize="sentences"
                autoFocus={false}
                value={values.name}
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
              />
              <FormErrorMessage error={errors.name} visible={touched.name} />
              <TextInput
                name="imei"
                leftIconName="cellphone"
                placeholder="Enter IMEI"
                autoCapitalize="characters"
                keyboardType="numeric"
                value={values.imei}
                onChangeText={handleChange("imei")}
                onBlur={handleBlur("imei")}
              />
              <FormErrorMessage error={errors.imei} visible={touched.imei} />
              <TextInput
                name="serial"
                leftIconName="barcode"
                placeholder="Enter serial number"
                autoCapitalize="none"
                value={values.serial}
                onChangeText={handleChange("serial")}
                onBlur={handleBlur("serial")}
              />
              <FormErrorMessage
                error={errors.serial}
                visible={touched.serial}
              />
              <TextInput
                maxLength={115}
                name="description"
                leftIconName="pencil"
                placeholder="Enter description"
                autoCapitalize="sentences"
                value={values.description}
                onChangeText={handleChange("description")}
                onBlur={handleBlur("description")}
                multiline
                numberOfLines={3}
              />
              <FormErrorMessage
                error={errors.description}
                visible={touched.description}
              />
              {/* Register Device button */}
              <Button style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Register Device</Text>
              </Button>
            </>
          )}
        </Formik>
        <Modal animationType="fade" visible={modalVisible} transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              {registering ? (
                <BarIndicator color={Colors.black} count={6} size={30} />
              ) : deviceValid ? (
                <View style={{ paddingBottom: 8, alignItems: "center" }}>
                  <LottieView
                    autoPlay
                    loop={false}
                    speed={2}
                    onAnimationFinish={() => {
                      Alert.alert(
                        "Activating",
                        "Please keep the device on during activation",
                        [
                          {
                            text: "OK",
                            onPress: () => {},
                          },
                        ]
                      );
                      setModalVisible(false);

                      navigation.navigate("Home");
                    }}
                    source={require("../assets/animations/success.json")}
                    style={{ width: 80 }}
                  />
                  <Text
                    style={{ fontSize: 18, color: Colors.dark, paddingTop: 5 }}
                  >
                    Register successful
                  </Text>
                </View>
              ) : (
                <View style={{ paddingBottom: 8, alignItems: "center" }}>
                  <LottieView
                    autoPlay
                    loop={false}
                    speed={2}
                    onAnimationFinish={() => setModalVisible(false)}
                    source={require("../assets/animations/failed.json")}
                    style={{ width: 80 }}
                  />
                  <Text
                    style={{ fontSize: 18, color: Colors.dark, paddingTop: 5 }}
                  >
                    Register failed
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
    paddingHorizontal: 12,
  },
  innerContainer: {
    alignItems: "center",
    paddingVertical: 18,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.white,
  },
  button: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.red,
    marginHorizontal: 12,
    borderRadius: 12,
    marginTop: 40,
  },
  buttonText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: "700",
  },
  modalContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  modalView: {
    width: 220,
    height: 150,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
