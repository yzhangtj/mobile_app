import React, { useContext } from "react";
import { Text, StyleSheet } from "react-native";
import { Formik } from "formik";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { View, TextInput, Logo, Button, FormErrorMessage } from "../components";
import { Images, Colors, auth, backend } from "../config";
import { useTogglePasswordVisibility } from "../hooks";
import { signupValidationSchema } from "../utils";

import * as Notifications from "expo-notifications";
import { ThemeContext } from "../providers";

export const SignupScreen = ({ navigation }) => {
  const darkTheme = useContext(ThemeContext).darkTheme;

  const {
    passwordVisibility,
    handlePasswordVisibility,
    rightIcon,
    handleConfirmPasswordVisibility,
    confirmPasswordIcon,
    confirmPasswordVisibility,
  } = useTogglePasswordVisibility();

  const handleSignup = (values) => {
    const { email, password } = values;

    // signup new user with authentication
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        console.log("[Signup]: handleSignup user: " + userCredentials.user);

        // registration must have token to prevent unauthorized user accounts
        return Promise.all([
          auth.currentUser.getIdToken(true),
          userCredentials.user.email,
          Notifications.getExpoPushTokenAsync(),
        ]);
      })
      .then((values) => {
        return fetch(new URL("users/register", backend.http_domain), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: values[0],
            email: values[1],
            expo_id: values[2].data,
          }),
        });
      })
      .catch((error) => {
        console.log("[Signup]: handleSignup error: " + error);
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
        {/* LogoContainer: consits app logo and screen title */}
        <View style={styles.logoContainer}>
          <Logo uri={Images.logo} />
          <Text
            style={[styles.screenTitle, !darkTheme && { color: Colors.black }]}
          >
            Create a new account!
          </Text>
        </View>
        {/* Formik Wrapper */}
        <Formik
          initialValues={{
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={signupValidationSchema}
          onSubmit={(values) => handleSignup(values)}
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
              <FormErrorMessage error={errors.email} visible={touched.email} />
              <TextInput
                name="password"
                leftIconName="key-variant"
                placeholder="Enter password"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={passwordVisibility}
                textContentType="newPassword"
                rightIcon={rightIcon}
                handlePasswordVisibility={handlePasswordVisibility}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
              />
              <FormErrorMessage
                error={errors.password}
                visible={touched.password}
              />
              <TextInput
                name="confirmPassword"
                leftIconName="key-variant"
                placeholder="Confirm password"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={confirmPasswordVisibility}
                textContentType="password"
                rightIcon={confirmPasswordIcon}
                handlePasswordVisibility={handleConfirmPasswordVisibility}
                value={values.confirmPassword}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
              />
              <FormErrorMessage
                error={errors.confirmPassword}
                visible={touched.confirmPassword}
              />
              <Button style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </Button>
            </>
          )}
        </Formik>
        {/* Button to navigate to Login screen */}
        <Button
          style={styles.borderlessButtonContainer}
          borderless
          title={"Already have an account?"}
          onPress={() => navigation.navigate("Login")}
        />
        <View style={{ height: 20 }} />
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
  logoContainer: {
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.white,
    paddingBottom: 10,
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
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
