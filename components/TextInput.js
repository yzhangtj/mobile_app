import React, { useContext } from "react";
import { TextInput as RNTextInput } from "react-native";

import { View } from "./View";
import { Icon } from "./Icon";
import { Button } from "./Button";
import { Colors } from "../config";
import { ThemeContext } from "../providers";
import { MaterialIcons } from "@expo/vector-icons";

// text input wrapper with icons and clearing suppport
export const TextInput = ({
  width = "100%",
  leftIconName,
  rightIcon,
  handlePasswordVisibility,
  style,
  containerStyle,
  textBoxStyle,
  clearButton,
  onClear,
  ...otherProps
}) => {
  const darkTheme = useContext(ThemeContext).darkTheme;
  return (
    <View
      style={[
        {
          borderRadius: 8,
          flexDirection: "column",
          paddingHorizontal: 12,
          paddingTop: 30,
          width,
          borderColor: Colors.navy,
          bottom: 10,
        },
        containerStyle,
      ]}
    >
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: darkTheme ? Colors.lightNavy : Colors.light,
            width: "100%",
            borderRadius: 12,
            paddingVertical: 16,
            paddingHorizontal: 12,
          },
          style,
        ]}
      >
        {leftIconName ? (
          <Icon
            name={leftIconName}
            size={22}
            color={darkTheme ? Colors.mediumGray : Colors.black}
            style={{ marginRight: 12 }}
          />
        ) : null}
        <RNTextInput
          style={[
            {
              flex: 1,
              width: "100%",
              fontSize: 18,
              color: darkTheme ? Colors.white : Colors.black,
            },
            textBoxStyle,
          ]}
          placeholderTextColor={darkTheme ? Colors.white : Colors.dark3}
          {...otherProps}
        />
        {rightIcon ? (
          <Button onPress={handlePasswordVisibility}>
            <Icon
              name={rightIcon}
              size={22}
              color={Colors.mediumGray}
              style={{ marginRight: 10 }}
            />
          </Button>
        ) : null}
        {clearButton && otherProps.value ? (
          <Button onPress={onClear}>
            <MaterialIcons
              name={"clear"}
              size={26}
              color={darkTheme ? Colors.white : Colors.dark2}
              style={{ marginRight: 10, marginVertical: -12 }}
            />
          </Button>
        ) : null}
      </View>
    </View>
  );
};
