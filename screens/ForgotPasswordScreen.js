import React, { useContext, useState } from "react";
import { StyleSheet, Text } from "react-native";
import { Formik } from "formik";
import { sendPasswordResetEmail } from "firebase/auth";

import { passwordResetSchema } from "../utils";
import { Images, Colors, auth } from "../config";
import { View, TextInput, Logo, Button, FormErrorMessage } from "../components";
import { ThemeContext } from "../providers";

export const ForgotPasswordScreen = ({ navigation }) => {
  const darkTheme = useContext(ThemeContext).darkTheme
  const [errorState, setErrorState] = useState("");

  const handleSendPasswordResetEmail = (values) => {
    const { email } = values;

    sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log(
          "[ForgotPassword] sendPasswordResetEmail success: Password Reset Email sent."
        );
        navigation.navigate("Login");
      })
      .catch((error) => setErrorState(error.message));
  };

  return (
    <View style={[styles.container, !darkTheme && {backgroundColor : Colors.white}]}>
      {/* LogoContainer: consits app logo and screen title */}
      <View style={styles.logoContainer}>
        <Logo uri={Images.logo} />
        <Text style={[styles.screenTitle, !darkTheme && {color : Colors.black}]}>Reset your password</Text>
      </View>
      {/* Formik Wrapper */}
      <Formik
        initialValues={{ email: "" }}
        validationSchema={passwordResetSchema}
        onSubmit={(values) => handleSendPasswordResetEmail(values)}
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
            {/* Email input field */}
            <TextInput
              name="email"
              leftIconName="email"
              placeholder="Enter email"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
            />
            <FormErrorMessage error={errors.email} visible={touched.email} />
            {/* Display Screen Error Mesages */}
            {errorState !== "" ? (
              <FormErrorMessage error={errorState} visible={true} />
            ) : null}
            {/* Password Reset Send Email button */}
            <Button style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Send Reset Email</Text>
            </Button>
          </>
        )}
      </Formik>
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
    paddingBottom: 10,
    color: Colors.white,
  },
  button: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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
