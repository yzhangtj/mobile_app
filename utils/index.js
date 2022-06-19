import * as Yup from "yup";

export const loginValidationSchema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
});

export const signupValidationSchema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(6).label("Password"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Confirm Password must match password.")
    .required("Confirm Password is required."),
});

export const passwordResetSchema = Yup.object().shape({
  email: Yup.string()
    .required("Please enter a registered email")
    .label("Email")
    .email("Enter a valid email"),
});

export const registerDeviceSchema = Yup.object().shape({
  name: Yup.string().required().label("Device Name"),
  imei: Yup.string().required().label("IMEI"),
  serial: Yup.string().required().label("Serial Number"),
  description: Yup.string().required().label("Description"),
});

export const editDeviceSchema = Yup.object().shape({
  name: Yup.string().required().label("Device Name"),
  description: Yup.string().required().label("Description"),
});
