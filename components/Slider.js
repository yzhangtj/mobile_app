import React from "react";
import { Animated, Easing, StyleSheet, Pressable, View } from "react-native";
import { Colors } from "../config";

// Custom slider with coded animation
// used to transition between chart and alerts list
export const Slider = ({ onSlide, page }) => {
  const animatedValue = React.useRef(new Animated.Value(
    page === "readings" ? 0 : 1
  )).current;
  const [selectedButton, setSelectedButton] = React.useState(
    page === "readings" ? "left" : "right"
  );

  const startAnimation = (toValue) => {
    Animated.timing(animatedValue, {
      toValue,
      duration: 400,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const left = animatedValue.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [
      "2%",
      "2.2%",
      "2.41%",
      "2.83%",
      "3.7%",
      "5.46%",
      "8.96%",
      "15.67%",
      "27.54%",
      "44.01%",
      "50%",
    ],
    extrapolate: "clamp",
  });

  const right = animatedValue.interpolate({
    inputRange: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    outputRange: [
      "50%",
      "44.01%",
      "27.54%",
      "15.67%",
      "8.96%",
      "5.46%",
      "3.7%",
      "2.83%",
      "2.41%",
      "2.2%",
      "2%",
    ],
    extrapolate: "clamp",
  });

  const handleOnPressLeft = () => {
    if (selectedButton === "right") {
      startAnimation(0);
      setSelectedButton("left");
      onSlide(selectedButton);
    }
  };

  const handleOnPressRight = () => {
    if (selectedButton === "left") {
      startAnimation(1);
      setSelectedButton("right");
      onSlide(selectedButton);
    }
  };

  return (
    <View style={styles.sliderContainer}>
      <Animated.View
        style={[
          styles.slider,
          selectedButton === "left" ? { left } : { right },
        ]}
      />
      <Pressable style={styles.clickableArea} onPress={handleOnPressLeft}>
        <Animated.Text style={[styles.sliderText]}>Readings</Animated.Text>
      </Pressable>
      <Pressable style={styles.clickableArea} onPress={handleOnPressRight}>
        <Animated.Text style={[styles.sliderText]}>Alerts</Animated.Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    width: "60%",
    height: 34,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.grey,
    shadowColor: "black",
    shadowRadius: 2,
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.2,
  },
  clickableArea: {
    width: "50%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  sliderText: {
    fontSize: 15,
    fontWeight: "500",
  },
  slider: {
    position: "absolute",
    width: "48%",
    height: "78%",
    borderRadius: 7,
    backgroundColor: Colors.white,
    shadowColor: "black",
    shadowRadius: 2,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
  },
});
