import { LinearGradient } from "expo-linear-gradient";
import React, { useContext } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Colors } from "../config";
import { ThemeContext } from "../providers";

// main list item for alerts list
export const WarningCard = ({ time, value, style }) => {
  const darkTheme = useContext(ThemeContext).darkTheme;
  const getTime = (time) => {
    // custom date format
    const myTime = new Date(time);
    let hours = myTime.getHours();
    let minute = myTime.getMinutes();
    if (minute < 10) minute = "0" + minute;
    let seconds = myTime.getSeconds();
    if (seconds < 10) seconds = "0" + seconds;
    const date = myTime.getDate();
    const month = myTime.getMonth();
    let monthS = "";
    if (month === 0) {
      monthS = "Jan";
    } else if (month === 1) {
      monthS = "Feb";
    } else if (month === 2) {
      monthS = "Mar";
    } else if (month === 3) {
      monthS = "Apr";
    } else if (month === 4) {
      monthS = "May";
    } else if (month === 5) {
      monthS = "Jun";
    } else if (month === 6) {
      monthS = "Jul";
    } else if (month === 7) {
      monthS = "Aug";
    } else if (month === 8) {
      monthS = "Sep";
    } else if (month === 9) {
      monthS = "Oct";
    } else if (month === 10) {
      monthS = "Nov";
    } else if (month === 11) {
      monthS = "Dec";
    }
    const year = myTime.getFullYear();

    return (
      hours +
      ":" +
      minute +
      ":" +
      seconds +
      "  " +
      monthS +
      " " +
      date +
      ", " +
      year
    );
  };

  return (
    <View
      style={{
        shadowColor: "black",
        shadowRadius: 2,
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.3,
        paddingBottom: 10,
      }}
    >
      <LinearGradient
        colors={[
          value >= 1000 ? Colors.warningRed : Colors.orange,
          darkTheme ? Colors.lightNavy : Colors.lightGrey2,
          darkTheme ? Colors.lightNavy : Colors.lightGrey2,
        ]}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.box}
      >
        <View
          style={[
            {
              flex: 1,
              flexDirection: "row",
            },
            style,
          ]}
        >
          <View style={{ justifyContent: "center", flex: 1 }}>
            <Text style={[styles.CO2Value]}>
              {value >= 1000 ? value.toFixed(1) : value.toFixed(2)}
            </Text>
          </View>
          <View style={{ flex: 2.65, justifyContent: "center" }}>
            <Text style={[styles.time, !darkTheme && { color: Colors.black }]}>
              {getTime(time)}
            </Text>
            {value >= 1000 ? (
              <Text
                style={[
                  styles.description,
                  !darkTheme && { color: Colors.black },
                ]}
              >
                The carbon dioxide level in this room is above the dangerous
                level. Please quickly evacuate the room for public safety.
              </Text>
            ) : (
              <Text
                style={[
                  styles.description,
                  !darkTheme && { color: Colors.black },
                ]}
              >
                The carbon dioxide level in this room is rising. Please increase
                ventilation for public safety.
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: "92%",
    height: 140,
    borderRadius: 15,
    backgroundColor: Colors.lightNavy,
    justifyContent: "center",
    flexDirection: "row",
    alignSelf: "center",
  },

  CO2Value: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "500",
    paddingLeft: 16,
  },
  time: {
    color: Colors.white,
    fontSize: 18,
    paddingLeft: 25,
    paddingRight: 10,
  },
  description: {
    color: Colors.white,
    fontSize: 15,
    paddingLeft: 25,
    paddingTop: 12,
    paddingRight: 10,
  },
});
