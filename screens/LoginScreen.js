import React, { useContext, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { Formik } from "formik";
import { signInWithEmailAndPassword } from "firebase/auth";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import LottieView from "lottie-react-native";

import { View, TextInput, Logo, Button, FormErrorMessage } from "../components";
import { Images, Colors, auth, backend } from "../config";
import { useTogglePasswordVisibility } from "../hooks";
import { loginValidationSchema } from "../utils";

import * as Notifications from "expo-notifications";
import { ThemeContext } from "../providers";

export const LoginScreen = ({ navigation }) => {
  const darkTheme = useContext(ThemeContext).darkTheme;
  const [errorState, setErrorState] = useState("");
  const { passwordVisibility, handlePasswordVisibility, rightIcon } =
    useTogglePasswordVisibility();

  const handleLogin = (values) => {
    const { email, password } = values;
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        return Promise.all([
          auth.currentUser.getIdToken(true),
          Notifications.getExpoPushTokenAsync(),
        ]);
      })
      .then(([token, expo_id]) => {
        console.log("[Login] setting expo token: Starting request");

        return fetch(new URL("users/login", backend.http_domain), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            expo_id: expo_id.data,
          }),
        });
      })
      .catch((error) => setErrorState(error.message));
  };

  return (
    <>
      <View isSafe style={darkTheme ? styles.container : styles.lighContainer}>
        <KeyboardAwareScrollView enableOnAndroid={true}>
          {/* LogoContainer: consits app logo and screen title */}
          <View style={styles.logoContainer}>
            <LottieView
              autoPlay
              loop={true}
              speed={2}
              source={require("../assets/animations/rising-bubbles.json")}
              style={{ width: 200, marginTop: 30 }}
            />
            <Logo uri={Images.logo} />
          </View>
          {/* Formik Wrapper */}
          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={loginValidationSchema}
            onSubmit={(values) => handleLogin(values)}
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
                  name="email"
                  leftIconName="email"
                  placeholder="Enter email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoFocus={false}
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                />
                <FormErrorMessage
                  error={errors.email}
                  visible={touched.email}
                />
                <TextInput
                  name="password"
                  leftIconName="key-variant"
                  placeholder="Enter password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={passwordVisibility}
                  textContentType="password"
                  rightIcon={rightIcon}
                  handlePasswordVisibility={handlePasswordVisibility}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onSubmitEditing={handleSubmit}
                  onBlur={handleBlur("password")}
                />
                <FormErrorMessage
                  error={errors.password}
                  visible={touched.password}
                />
                {/* Display Screen Error Mesages */}
                {errorState !== "" ? (
                  <FormErrorMessage error={errorState} visible={true} />
                ) : null}
                {/* Login button */}
                <Button style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Sign In</Text>
                </Button>
              </>
            )}
          </Formik>
          {/* Button to navigate to SignupScreen to create a new account */}
          <Button
            style={styles.borderlessButtonContainer}
            borderless
            title={"Create a new account"}
            onPress={() => navigation.navigate("Signup")}
          />
          {/* Button to navigate to ForgotPassword to reset password */}
          <Button
            style={[styles.borderlessButtonContainer, { marginTop: 14 }]}
            borderless
            title={"Forgot Password"}
            onPress={() => navigation.navigate("ForgotPassword")}
          />
        </KeyboardAwareScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
    paddingHorizontal: 12,
  },
  lighContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
  },
  logoContainer: {
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 10,
  },
  button: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    backgroundColor: Colors.red,
    marginHorizontal: 12,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: "700",
  },
  borderlessButtonContainer: {
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});
