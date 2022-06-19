import React, { Component } from "react";

import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  Animated,
  FlatList,
  RefreshControl,
} from "react-native";

import SelectDropdown from "react-native-select-dropdown";

import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryTooltip,
  VictoryScatter,
  VictoryVoronoiContainer,
} from "victory-native";

import { BarIndicator } from "react-native-indicators";

import {
  Screen,
  Slider,
  AppSwitch,
  BatteryIndicator,
  downSample,
  downSampleMax,
  WarningCard,
} from "../components";

import { auth, Colors, backend } from "../config";
import { NotificationContext, ThemeContext } from "../providers";

// get the notification context from local storage
const DetailScreenHOC = (Component) => (props) =>
  (
    <NotificationContext.Consumer>
      {(notificationContext) => (
        <ThemeContext.Consumer>
          {(themeContext) => (
            <Component
              {...props}
              notification={notificationContext}
              theme={themeContext}
            />
          )}
        </ThemeContext.Consumer>
      )}
    </NotificationContext.Consumer>
  );

class DetailScreen extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      data: [],
      data_DS: [],
      data_live: 0,
      hoursToShow: 3,
      battery: 0,
      isCharging: false,
      switch1: false,
      switch2: true,
      switch3: false,
      readingsOpacity: new Animated.Value(
        this.props.route.params.page === "readings" ? 1 : 0
      ),
      alertOpacity: new Animated.Value(
        this.props.route.params.page === "readings" ? 0 : 1
      ),
      alertlist: [],
      page: this.props.route.params.page,
      refreshing: false,
    };

    // get device data for device card that was clicked on
    this.initialPage = this.props.route.params.page;
    this.deviceID = this.props.route.params.deviceID;
    this.deviceName = this.props.route.params.deviceName;
    this.deviceDescription = this.props.route.params.deviceDescription;
    this.dimensions = Dimensions.get("screen");
    this.safetyThresholdDangerous = 1000;
    this.safetyThresholdWarning = 800;

    this.historyOptions = [
      "Last hour",
      "Last 3 hours",
      "Last day",
      "Last week",
      "Last month",
    ];
  }

  // adjust warnings count
  handleWarningCount() {
    if (this.state.page === "alert" && this.state.alertlist.length > 0) {
      this.props.notification.setWarnings((previousState) => {
        return { ...previousState, [this.deviceID]: 0 };
      });
    }
  }

  // retrieve CO2 data from backend for device
  retrieveData() {
    let data_Var = [];
    let datax_Var = [];
    let datay_Var = [];
    let data_live_Var = 0;
    let data_Var_DS = [];
    let data_Var_alert = [];
    let data_Var_alert_DS = [];

    // authorize with firebase
    auth.currentUser
      .getIdToken(true)
      .then((token) => {
        console.log("\n[DeviceData] retrieveData: Starting request");
        // show loading indicator when fetching
        this.setState({ isLoading: true });

        return fetch(new URL("readings/range", backend.http_domain), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            device: this.deviceID,
            start: Date.now() - this.state.hoursToShow * 3600 * 1000,
          }),
        });
      })
      .then((response) => {
        return response.json();
      })
      .then((deviceData) => {
        // pre-compute averaging for later display
        for (let i = 0; i < deviceData.length; i++) {
          const deviceReading = deviceData[i];
          const co2Data = deviceReading.co2;
          const generationDate = Date.parse(deviceReading.genDate);
          data_Var[i] = { x: generationDate, y: co2Data };
          datax_Var[i] = generationDate;
          datay_Var[i] = co2Data;
        }

        data_live_Var = datay_Var[datay_Var.length - 1];

        // using custom downsample function to smooth
        data_Var_DS = downSample(
          data_Var,
          2 * Math.sqrt(this.state.hoursToShow).toFixed(0)
        );

        data_Var_alert = data_Var.filter(
          (element) => element.y > this.safetyThresholdWarning
        );
        data_Var_alert_DS = downSampleMax(data_Var_alert, 3);

        this.setState(
          {
            data: data_Var,
            data_DS: data_Var_DS,
            data_live: data_live_Var,
            alertlist: data_Var_alert_DS,
          },
          this.handleWarningCount
        );

        this.setState({ isLoading: false });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // get battery data for single device
  retrieveBattery() {
    let isCharging_Var = false;
    let battery_Var = 0;

    auth.currentUser
      .getIdToken(true)
      .then((token) => {
        console.log("[DeviceData] retrieveBattery: Starting request");
        return fetch(new URL("devices/single", backend.http_domain), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            device: this.deviceID,
          }),
        });
      })
      .then((response) => {
        return response.json();
      })
      .then((deviceData) => {
        isCharging_Var = deviceData.charging;
        battery_Var = deviceData.percentage;

        this.setState({
          isCharging: isCharging_Var,
          battery: battery_Var,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // get latest battery and data on mount
  componentDidMount() {
    this._isMounted = true;
    this.retrieveData();
    this.retrieveBattery();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    // custom date format
    const myGetMinutes = (value) => {
      const myValue = new Date(value);
      const minute = myValue.getMinutes();
      if (minute < 10) {
        return "0" + minute.toString();
      } else {
        return minute.toString();
      }
    };

    const myGetMonth = (value) => {
      const myValue = new Date(value);
      const month = myValue.getMonth();
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
      return monthS;
    };

    const formatTime = (x) => {
      if (this.state.hoursToShow > 24)
        return `${myGetMonth(x)}` + " " + `${new Date(x).getDate()}`;
      else return `${new Date(x).getHours()}` + ":" + `${myGetMinutes(x)}`;
    };

    // transition between readings and alerts tab
    const switchToReadings = () => {
      Animated.timing(this.state.alertOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(this.state.readingsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        this.setState({ page: "readings" });
      }, 400);
    };

    const switchToAlert = () => {
      Animated.timing(this.state.readingsOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(this.state.alertOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        this.setState({ page: "alert" }, this.handleWarningCount);
      }, 400);
    };

    // shorthand for checking data presence
    const yesData = () => {
      return this.state.data.length !== 0;
    };

    // retrieve data on refresh and show loading indicator
    const onRefresh = () => {
      this.setState({ refreshing: true });
      this.retrieveData();
      this.setState({ refreshing: false });
    };

    return (
      <Screen
        style={[
          styles.container,
          !this.props.theme.darkTheme && { backgroundColor: Colors.white },
        ]}
      >
        <View style={{ flexDirection: "row", marginHorizontal: 18 }}>
          <View style={{ flex: 2.5 }}>
            <Text
              style={[
                styles.deviceName,
                !this.props.theme.darkTheme && { color: Colors.black },
              ]}
            >
              {this.deviceName}
            </Text>
            <Text
              style={[
                styles.deviceDescription,
                !this.props.theme.darkTheme && { color: Colors.black },
              ]}
            >
              {this.deviceDescription}
            </Text>
          </View>

          <View
            style={{
              flex: 1.8,
              paddingTop: 16,
              shadowColor: "black",
              shadowRadius: 2,
              shadowOffset: { width: 1, height: 2 },
              shadowOpacity: 0.2,
              alignItems: "center",
            }}
          >
            <SelectDropdown
              data={this.historyOptions}
              onSelect={async (selectedItem, index) => {
                if (index === 0) this.setState({ hoursToShow: 1 });
                else if (index === 1) this.setState({ hoursToShow: 3 });
                else if (index === 2) this.setState({ hoursToShow: 24 });
                else if (index === 3) this.setState({ hoursToShow: 168 });
                else if (index === 4) this.setState({ hoursToShow: 720 });

                setTimeout(this.retrieveData.bind(this), 0);
              }}
              defaultValueByIndex={1}
              buttonStyle={{
                backgroundColor: this.props.theme.darkTheme
                  ? Colors.lightNavy
                  : Colors.lightGrey2,
                borderRadius: 10,
                width: 140,
                height: 40,
              }}
              buttonTextStyle={{
                color: this.props.theme.darkTheme ? Colors.white : Colors.black,
                fontSize: 17,
              }}
              rowTextStyle={{ fontSize: 17 }}
              dropdownStyle={{
                backgroundColor: Colors.white,
                borderRadius: 10,
                opacity: 0.95,
              }}
            />
          </View>
        </View>
        <View style={{ flex: 1, alignItems: "center", paddingTop: 30 }}>
          <View style={styles.buttonContainer}>
            <Slider
              onSlide={(sliderStatus) => {
                sliderStatus === "right" ? switchToReadings() : switchToAlert();
              }}
              page={this.initialPage}
            />
          </View>

          <Animated.View
            style={[
              styles.readingsContainer,
              {
                opacity: this.state.readingsOpacity,
                zIndex: this.state.page === "readings" ? 1 : 0,
              },
            ]}
          >
            <ScrollView
              style={{ flex: 10 }}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors.black]}
                  tintColor={
                    this.props.theme.darkTheme ? Colors.white : Colors.black
                  }
                />
              }
            >
              {this.state.isLoading ? (
                <View style={{ width: "100%", height: 590 }}>
                  <BarIndicator
                    color={
                      this.props.theme.darkTheme ? Colors.white : Colors.black
                    }
                    count={6}
                    size={30}
                  />
                </View>
              ) : (
                <View style={{ width: "100%" }}>
                  <View
                    style={{
                      justifyContent: "space-between",
                      flexDirection: "row",
                    }}
                  >
                    <View style={styles.CO2ViewContainer}>
                      <Text
                        style={[
                          styles.CO2Text,
                          !this.props.theme.darkTheme && {
                            color: Colors.black,
                          },
                        ]}
                      >
                        CO
                      </Text>
                      <Text
                        style={[
                          styles.small2,
                          !this.props.theme.darkTheme && {
                            color: Colors.black,
                          },
                        ]}
                      >
                        2
                      </Text>
                      <Text
                        style={[
                          styles.CO2Text,
                          !this.props.theme.darkTheme && {
                            color: Colors.black,
                          },
                        ]}
                      >
                        {" : "}
                      </Text>
                      <Text
                        style={[
                          styles.CO2Text,
                          !this.props.theme.darkTheme && {
                            color: Colors.black,
                          },
                        ]}
                      >
                        {yesData()
                          ? this.state.data_live.toFixed(2)
                          : "No Data"}
                      </Text>
                      {yesData() && (
                        <>
                          <Text
                            style={[
                              styles.CO2Text,
                              !this.props.theme.darkTheme && {
                                color: Colors.black,
                              },
                            ]}
                          >
                            {" "}
                            ppm
                          </Text>
                          <View
                            style={{
                              backgroundColor:
                                this.state.data[this.state.data.length - 1].y >
                                this.safetyThresholdDangerous
                                  ? Colors.warningRed
                                  : this.state.data[this.state.data.length - 1]
                                      .y > this.safetyThresholdWarning
                                  ? Colors.yellow
                                  : Colors.green,
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              marginLeft: 10,
                              marginTop: 10,
                            }}
                          />
                        </>
                      )}
                    </View>
                    <View style={{ width: 55 }}>
                      <BatteryIndicator
                        battery={this.state.battery}
                        isCharging={this.state.isCharging}
                        style={{
                          paddingTop: 16,
                          color: this.props.theme.darkTheme
                            ? Colors.white
                            : Colors.black,
                        }}
                      />
                    </View>
                  </View>

                  {/* Main component for charts using victory chart library */}
                  <VictoryChart
                    height={this.dimensions.height * 0.6}
                    width={this.dimensions.width}
                    containerComponent={<VictoryVoronoiContainer /> /* allows for interactivity */}
                    padding={{ top: 16, bottom: 40, right: 25, left: 52 }}
                    domainPadding={{ x: [40, 0], y: 50 }}
                  >
                    {!this.state.switch3 && (
                      <VictoryLine
                        data={
                          this.state.switch1
                            ? this.state.data_DS
                            : this.state.data
                        }
                        interpolation={
                          this.state.switch2 ? "monotoneX" : "linear" /* switch between interpolation types */
                        }
                        style={{
                          data: {
                            stroke: this.props.theme.darkTheme
                              ? Colors.white
                              : Colors.black,
                            strokeWidth: 1.5,
                          },
                        }}
                        domain={{
                          x: [
                            Date.now() - this.state.hoursToShow * 3600 * 1000,
                            Date.now(),
                          ],
                        }}
                      />
                    )}

                    <VictoryScatter /* allows viewing raw data points */
                      data={
                        this.state.switch1
                          ? this.state.data_DS
                          : this.state.data
                      }
                      size={0.5}
                      style={{
                        data: {
                          stroke: this.props.theme.darkTheme
                            ? Colors.white
                            : Colors.black,
                          fill: this.props.theme.darkTheme
                            ? Colors.white
                            : Colors.black,
                        },
                      }}
                      labels={({ datum }) => {
                        return ` ${datum.y.toFixed(2)} ppm \n ${new Date(
                          datum.x
                        ).toDateString()} \n ${new Date(
                          datum.x
                        ).toLocaleTimeString()}`;
                      }}
                      labelComponent={<VictoryTooltip renderInPortal={false} />}
                      domain={{
                        x: [
                          Date.now() - this.state.hoursToShow * 3600 * 1000,
                          Date.now(),
                        ],
                      }}
                    />

                    <VictoryAxis /* Y axis on chart for CO2 values */
                      dependentAxis
                      style={{
                        axis: {
                          stroke: this.props.theme.darkTheme
                            ? "white"
                            : "black",
                          strokeOpacity: 0.5,
                        },
                        tickLabels: {
                          fill: this.props.theme.darkTheme
                            ? Colors.white
                            : Colors.black,
                        },
                        grid: {
                          stroke: this.props.theme.darkTheme
                            ? Colors.white
                            : Colors.black,
                          strokeDasharray: "4,8",
                          strokeWidth: 0.8,
                          strokeOpacity: 0.3,
                        },
                      }}
                      fixLabelOverlap={true}
                      tickCount={5}
                      tickFormat={(y) => `${y}` + "\nppm"}
                    />

                    <VictoryAxis /* X axis on chart for showing dates */
                      crossAxis
                      style={{
                        axisLabel: {
                          stroke: this.props.theme.darkTheme
                            ? "white"
                            : "black",
                          fontSize: 20,
                          fill: this.props.theme.darkTheme ? "white" : "black",
                        },
                        axis: {
                          stroke: this.props.theme.darkTheme
                            ? "white"
                            : "black",
                          strokeOpacity: 0.5,
                        },
                        tickLabels: {
                          fill: this.props.theme.darkTheme
                            ? Colors.white
                            : Colors.black,
                        },
                        grid: {
                          stroke: this.props.theme.darkTheme
                            ? Colors.white
                            : Colors.black,
                          strokeDasharray: "4,8",
                          strokeWidth: 0.8,
                          strokeOpacity: 0.3,
                        },
                      }}
                      tickFormat={(x) => formatTime(x)}
                      tickCount={5}
                      fixLabelOverlap={true}
                    />
                  </VictoryChart>

                  <View /* space after chart */
                    style={[
                      styles.separatorSpace,
                      !this.props.theme.darkTheme && {
                        backgroundColor: Colors.white,
                      },
                    ]}
                  />

                  <View  /* Switches for chart options */
                  style={styles.listBox}> 
                    <View style={styles.listTextBox}>
                      <Text
                        style={[
                          styles.listText,
                          !this.props.theme.darkTheme && {
                            color: Colors.black,
                          },
                        ]}
                      >
                        Smooth
                      </Text>
                    </View>
                    <AppSwitch
                      style={{ flex: 0.95 }}
                      onValueChange={(status) => {
                        this.setState({ switch1: status });
                      }}
                      status={this.state.switch1}
                    />
                  </View>
                  <View style={styles.separatorLine} />
                  <View style={styles.listBox}>
                    <View style={styles.listTextBox}>
                      <Text
                        style={[
                          styles.listText,
                          !this.props.theme.darkTheme && {
                            color: Colors.black,
                          },
                        ]}
                      >
                        Interpolate
                      </Text>
                    </View>
                    <AppSwitch
                      style={{ flex: 0.95 }}
                      onValueChange={(status) => {
                        this.setState({ switch2: status });
                      }}
                      status={this.state.switch2}
                    />
                  </View>
                  <View style={styles.separatorLine} />
                  <View style={styles.listBox}>
                    <View style={styles.listTextBox}>
                      <Text
                        style={[
                          styles.listText,
                          !this.props.theme.darkTheme && {
                            color: Colors.black,
                          },
                        ]}
                      >
                        Show raw data
                      </Text>
                    </View>
                    <AppSwitch
                      style={{ flex: 0.95 }}
                      onValueChange={(status) => {
                        this.setState({ switch3: status });
                      }}
                      status={this.state.switch3}
                    />
                  </View>
                </View>
              )}
            </ScrollView>
          </Animated.View>
          <Animated.View /* Animated switch between alerts and charts */
            style={[
              styles.alertContainer,
              {
                opacity: this.state.alertOpacity,
                zIndex: this.state.page === "readings" ? 0 : 1,
              },
            ]}
          >
            {this.state.isLoading ? (
              <View style={{ width: "100%", height: 450 }}>
                <BarIndicator
                  color={
                    this.props.theme.darkTheme ? Colors.white : Colors.black
                  }
                  count={6}
                  size={30}
                />
              </View>
            ) : (
              <View>
                {this.state.alertlist.length === 0 ? (
                  <View
                    style={{
                      width: "100%",
                      height: 450,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: this.props.theme.darkTheme
                          ? Colors.white
                          : Colors.black,
                        fontSize: 20,
                      }}
                    >
                      No alerts in the selected time
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={this.state.alertlist}
                    keyExtractor={(item) => item.x.toString()}
                    renderItem={(item) => (
                      <>
                        <WarningCard time={item.item.x} value={item.item.y} />
                        <View
                          style={
                            this.state.alertlist.length - 1 === item.index
                              ? [
                                  styles.separatorEnd,
                                  !this.props.theme.darkTheme && {
                                    backgroundColor: Colors.white,
                                  },
                                ]
                              : [
                                  styles.separatorCards,
                                  !this.props.theme.darkTheme && {
                                    backgroundColor: Colors.white,
                                  },
                                ]
                          }
                        />
                      </>
                    )}
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.black]}
                        tintColor={
                          this.props.theme.darkTheme
                            ? Colors.white
                            : Colors.black
                        }
                      />
                    }
                  />
                )}
              </View>
            )}
          </Animated.View>
        </View>
      </Screen>
    );
  }
}

export default DetailScreenHOC(DetailScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  deviceName: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: "700",
    fontFamily: Platform.OS === "android" ? "Roboto" : "Arial",
    paddingTop: 16,
  },
  deviceDescription: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir",
    paddingTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    paddingBottom: 20,
  },
  CO2ViewContainer: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "flex-start",
    paddingTop: 10,
    marginLeft: 18,
  },
  CO2Text: {
    color: Colors.white,
    fontSize: 25,
    fontFamily: Platform.OS === "android" ? "Roboto" : "Arial",
    marginBottom: 10,
  },
  small2: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Platform.OS === "android" ? "Roboto" : "Arial",
    marginTop: 10,
  },
  separatorSpace: {
    width: "100%",
    height: 20,
    backgroundColor: Colors.navy,
  },
  separatorCards: {
    width: "100%",
    height: 10,
    backgroundColor: Colors.navy,
  },
  separatorEnd: {
    width: "100%",
    height: 80,
    backgroundColor: Colors.navy,
  },
  separatorLine: {
    width: "90%",
    height: 0,
    borderColor: Colors.white,
    borderWidth: 0.5,
    alignSelf: "center",
    marginVertical: 5,
    opacity: 0.5,
  },
  listBox: {
    flexDirection: "row",
    paddingHorizontal: 30,
    paddingVertical: 8,
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
  readingsContainer: {
    flex: 1,
    width: "100%",
  },
  alertContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 90,
  },
});
