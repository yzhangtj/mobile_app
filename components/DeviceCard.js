import { LinearGradient } from "expo-linear-gradient";
import React, { useContext, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Dimensions,
  Platform,
  Alert,
} from "react-native";

import TouchableOpacity from "./TouchableOpacity";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { AppTextInput } from "./AppTextInput";
import { ModalFormErrorMessage } from "./ModalFormErrorMessage";
import { BatteryIndicator } from "./BatteryIndicator";
import { Colors } from "../config";
import { SimpleLineIcons } from "@expo/vector-icons";
import TextTicker from "react-native-text-ticker";
import { BoxShadow } from "react-native-shadow";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import { Formik } from "formik";
import { editDeviceSchema } from "../utils";
import { ThemeContext } from "../providers";

// main component for showing devices on home screen
// contains modal for managing devices and allows transition to detail screen
export const DeviceCard = ({
  deviceName,
  deviceDescription,
  value,
  IMEI,
  Serial,
  numOfWarnings,
  battery,
  isCharging,
  activated,
  onPress,
  onDelete,
  onDeviceUpdate,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingModalVisible, setEditingModalVisible] = useState(false);
  const [errorState, setErrorState] = useState("");
  const darkTheme = useContext(ThemeContext).darkTheme;

  return (
    <View style={{ padding: 10 }}>
      <TouchableOpacity onPress={onPress}>
        <BoxShadow
          setting={{
            width: Platform.isPad
              ? Math.max(
                  Dimensions.get("window").width, 
                  Dimensions.get("window").height
                ) * 0.2
              : Dimensions.get("window").width * 0.4,
            height: Platform.isPad
              ? Math.max(
                  Dimensions.get("window").width,
                  Dimensions.get("window").height
                ) * 0.2
              : Dimensions.get("window").width * 0.4,
            color: Colors.black,
            border: 2.5,
            radius: 20,
            opacity: 0.2,
            x: 1.5,
            y: 2.5,
          }}
        >
          <LinearGradient
            colors={
              // color selection based on theme and CO2 level
              !activated 
                ? darkTheme
                  ? [Colors.dark3, Colors.dark3] // inactive devices are colored gray
                  : [Colors.grey, Colors.grey]
                : value >= 1000
                ? darkTheme
                  ? [Colors.homeCardRedStart, Colors.homeCardRedEnd] // red when CO2 > 1000 ppm
                  : [Colors.homeCardLightRedStart, Colors.homeCardLightRedEnd]
                : value >= 800
                ? darkTheme
                  ? [Colors.homeCardOrangeStart, Colors.homeCardOrangeEnd]
                  : [
                      Colors.homeCardLightOrangeStart, // orange when CO2 > 800 ppm
                      Colors.homeCardLightOrangeEnd,
                    ]
                : darkTheme
                ? [Colors.homeCardBlueStart, Colors.homeCardBlueEnd] // blue in the normal state
                : [Colors.homeCardLightBlueStart, Colors.homeCardLightBlueEnd]
            }
            locations={[darkTheme ? 0 : 0.4, 1]}
            start={[0, 0]}
            end={[0, 1]}
            style={[
              styles.box,
              { 
                height: Platform.isPad // change size if displayed on a tablet
                  ? Math.max(
                      Dimensions.get("window").width,
                      Dimensions.get("window").height
                    ) * 0.2
                  : Dimensions.get("window").width * 0.4,
                width: Platform.isPad
                  ? Math.max(
                      Dimensions.get("window").width,
                      Dimensions.get("window").height
                    ) * 0.2
                  : Dimensions.get("window").width * 0.4,
              },
            ]}
          >
            <View style={styles.deviceNameAndBattery}>
              <Text
                style={[
                  styles.deviceName,
                  !darkTheme && { color: Colors.dark2 },
                ]}
              >
                {deviceName}
              </Text>
            </View>
            {!activated ? (
              <View>
                <Text
                  style={{
                    paddingLeft: 12,
                    paddingTop: 15,
                    fontSize: 18,
                    color: darkTheme ? Colors.white : Colors.dark2,
                  }}
                >
                  Activating...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.warningMessagesBox}>
                  <View
                    style={[
                      styles.safetyIndicatorHome,
                      {
                        backgroundColor:
                          numOfWarnings === 0
                            ? Colors.green
                            : Colors.warningRed,
                      },
                    ]}
                  />
                  <View style={styles.rollingTextContainer}>
                    <TextTicker
                      style={[
                        styles.warningsText,
                        !darkTheme && { color: Colors.dark2 },
                      ]}
                      duration={5000}
                      loop
                      bounce
                      repeatSpacer={50}
                      marqueeDelay={5000}
                    >
                      {numOfWarnings === 0 ? " No warnings" : "New warnings"}
                    </TextTicker>
                  </View>
                </View>
                <View style={styles.co2Box}>
                  <View
                    style={{ flexDirection: "row", alignItems: "baseline" }}
                  >
                    <Text
                      style={[
                        styles.co2,
                        !darkTheme && { color: Colors.dark2 },
                      ]}
                    >
                      {value === 0 ? "-- " : parseFloat(value).toFixed(0)/* show dashes when initialized and CO2 not received through websocket */}
                    </Text>
                    <Text
                      style={[
                        styles.ppm,
                        !darkTheme && { color: Colors.dark2 },
                      ]}
                    >
                      {" "}
                      ppm
                    </Text>
                  </View>
                </View>
              </>
            )}

            <View
              style={{
                right: 8,
                bottom: 8,
                position: "absolute",
              }}
            >
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      value >= 1000
                        ? Colors.homeCardRedOption
                        : value >= 800
                        ? Colors.homeCardOrangeOption
                        : Colors.homeCardBlueOption,
                  },
                ]}
                disallowInterruption={true}
                onPress={() => setModalVisible(true) /* open modal for device management*/}
              >
                <SimpleLineIcons
                  name="options"
                  size={20}
                  color={Colors.white}
                />
              </TouchableOpacity>
            </View>
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}
            >
              <Modal
                animationType="fade"
                transparent={true}
                visible={editingModalVisible}
                onRequestClose={() => {
                  setEditingModalVisible(!editingModalVisible);
                }}
              >
                <View style={[styles.centeredView, { backgroundColor: "" }]}>
                  <TouchableWithoutFeedback
                    onPress={() => {
                      Alert.alert(
                        "Discard changes?",
                        "Your changes will be lost",
                        [
                          {
                            text: "Cancel",
                            onPress: () => {},
                            style: "cancel",
                          },
                          {
                            text: "Discard",
                            onPress: () => {
                              setEditingModalVisible(false);
                            },
                            style: "destructive",
                          },
                        ]
                      );
                    }}
                    style={{
                      width: Dimensions.get("window").width,
                      height: Dimensions.get("window").height,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <TouchableWithoutFeedback
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 22,
                      }}
                    >
                      <View style={styles.modalView}>
                        {/* device name and description editing modal */}
                        <Formik
                          initialValues={{
                            name: deviceName,
                            description: deviceDescription,
                          }}
                          validationSchema={editDeviceSchema}
                          onSubmit={(values) => {
                            onDeviceUpdate(values);
                          }}
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
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: "500",
                                  color: Colors.dark,
                                }}
                              >
                                Device name:
                              </Text>
                              <AppTextInput
                                maxLength={12}
                                autoCapitalize="sentences"
                                autoCorrect={false}
                                placeholder={deviceName}
                                onChangeText={handleChange("name")}
                                onBlur={handleBlur("name")}
                              />
                              <ModalFormErrorMessage
                                error={errors.name}
                                visible={touched.name}
                              />
                              <Text
                                style={{
                                  fontSize: 16,
                                  fontWeight: "500",
                                  color: Colors.dark,
                                  marginTop: 10,
                                }}
                              >
                                Device description:
                              </Text>
                              <AppTextInput
                                maxLength={115}
                                autoCapitalize="sentences"
                                autoCorrect={false}
                                placeholder={deviceDescription}
                                multiline
                                numberOfLines={3}
                                onChangeText={handleChange("description")}
                                onBlur={handleBlur("description")}
                              />
                              <ModalFormErrorMessage
                                error={errors.description}
                                visible={touched.description}
                              />
                              {/* Display Screen Error Messages */}
                              {errorState !== "" ? (
                                <ModalFormErrorMessage
                                  error={errorState}
                                  visible={true}
                                />
                              ) : null}
                              <View
                                style={{
                                  width: "100%",
                                  position: "absolute",
                                  bottom: 20,
                                  left: 20,
                                  flex: 1,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    width: 110,
                                    height: 40,
                                    borderRadius: 10,
                                    backgroundColor: Colors.red,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "row",
                                  }}
                                  onPress={() => {
                                    /* alert to confirm device deletion */
                                    Alert.alert(
                                      "Delete " + deviceName + "?",
                                      "This device will be removed from the device list",
                                      [
                                        {
                                          text: "Cancel",
                                          onPress: () => {},
                                          style: "cancel",
                                        },
                                        {
                                          text: "Delete",
                                          onPress: () => {
                                            onDelete();
                                            setModalVisible(false);
                                          },
                                          style: "destructive",
                                        },
                                      ]
                                    );
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: "500",
                                      paddingTop: 2,
                                    }}
                                  >
                                    {"Delete "}
                                  </Text>
                                  <MaterialCommunityIcons
                                    name="trash-can-outline"
                                    size={24}
                                    color="white"
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={{
                                    width: 110,
                                    height: 40,
                                    borderRadius: 10,
                                    backgroundColor: Colors.doneBlue,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "row",
                                  }}
                                  onPress={() => {
                                    handleSubmit();
                                    setEditingModalVisible(false);
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: "500",
                                      paddingTop: 2,
                                    }}
                                  >
                                    {"Done "}
                                  </Text>
                                  <MaterialIcons
                                    name="done"
                                    size={22}
                                    color={Colors.white}
                                  />
                                </TouchableOpacity>
                              </View>
                            </>
                          )}
                        </Formik>
                      </View>
                    </TouchableWithoutFeedback>
                  </TouchableWithoutFeedback>
                </View>
              </Modal>
              <View style={styles.centeredView}>
                <TouchableWithoutFeedback
                  onPress={() => {
                    setModalVisible(false);
                  }}
                  style={{
                    width: Dimensions.get("window").width,
                    height: Dimensions.get("window").height,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <TouchableWithoutFeedback
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: 22,
                    }}
                  >
                    <View style={styles.modalView}>
                      <View
                        style={{
                          width: "93%",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={[
                            styles.modalText,
                            { fontSize: 30, fontWeight: "bold", marginTop: 0 },
                          ]}
                        >
                          {deviceName}
                        </Text>
                        <BatteryIndicator
                          battery={battery}
                          isCharging={isCharging}
                          style={{
                            paddingTop: 10,
                            color: Colors.black,
                          }}
                        />
                      </View>
                      <Text style={[styles.modalText, { marginTop: 15 }]}>
                        {deviceDescription}
                      </Text>

                      <Text style={[styles.modalText, { paddingTop: 20 }]}>
                        {"IMEI: " + IMEI}
                      </Text>
                      <Text style={styles.modalText}>
                        {"Serial: " + Serial}
                      </Text>

                      <View
                        style={{
                          width: "100%",
                          borderRadius: 10,
                          alignItems: "center",
                          position: "absolute",
                          bottom: 20,
                          left: 20,
                          flexDirection: "row",
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            width: 240,
                            height: 40,
                            borderRadius: 10,
                            backgroundColor: Colors.grey,
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                          }}
                          onPress={() => {
                            setEditingModalVisible(true);
                          }}
                        >
                          <Text
                            style={{
                              color: Colors.lightNavy,
                              fontSize: 16,
                              fontWeight: "500",
                              paddingTop: 2,
                            }}
                          >
                            {"Edit "}
                          </Text>
                          <Feather
                            name="edit"
                            size={22}
                            color={Colors.lightNavy}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </TouchableWithoutFeedback>
              </View>
            </Modal>
          </LinearGradient>
        </BoxShadow>
      </TouchableOpacity>
    </View>
  );
};

const shadow = {
  card: {
    width: Dimensions.get("window").width * 0.4,
    height: Dimensions.get("window").width * 0.4,
    color: Colors.black,
    border: 2.5,
    radius: 20,
    opacity: 0.2,
    x: 1.5,
    y: 2.5,
  },
};

const styles = StyleSheet.create({
  box: {
    width: Dimensions.get("window").width * 0.4,
    height: Dimensions.get("window").width * 0.4,
    borderRadius: 20,
  },
  deviceNameAndBattery: {
    width: "100%",
    height: 35,
    paddingLeft: 12,
    marginTop: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deviceName: {
    fontSize: Platform.OS === "ios" ? 23 : 21,
    color: Colors.white,
    fontWeight: "500",
  },
  battery: {
    paddingLeft: 10,
    marginTop: 3,
  },
  warningMessagesBox: {
    width: "100%",
    height: 45,
    flex: 1,
    paddingLeft: 12,
    paddingTop: 17,
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
  },
  safetyIndicatorHome: {
    backgroundColor: Colors.warningRed,
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
    marginTop: -18,
  },
  rollingTextContainer: {
    width: "80%",
    height: 30,
    marginLeft: -1,
    marginTop: -18,
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
    //backgroundColor: Colors.yellow,
  },
  warningsText: {
    fontSize: Platform.OS === "ios" ? 14 : 13,
    color: Colors.white,
  },
  co2Box: {
    flex: 10,
    width: "100%",
    height: 40,
    paddingLeft: 12,
    alignItems: "center",
    flexDirection: "row",
  },
  co2: {
    fontSize: Platform.OS === "ios" ? 36 : 34,
    fontWeight: "500",
    color: Colors.white,
    paddingBottom: 8,
  },
  ppm: {
    fontSize: Platform.OS === "ios" ? 15 : 13,
    color: Colors.white,
    paddingBottom: Platform.OS === "ios" ? 26 : 31,
  },
  optionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowRadius: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    elevation: 4,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  modalView: {
    width: 280,
    height: 380,
    backgroundColor: "white",
    borderRadius: 20,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  modalText: {
    color: Colors.black,
    marginTop: 10,
    fontSize: 16,
  },
});
