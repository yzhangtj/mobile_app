import React, { Component } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Platform,
  Alert,
  AsyncStorage
} from "react-native";

import * as Navigation from "../navigation/navigation";
import { DeviceCard } from "./DeviceCard";
import { auth, Colors, backend } from "../config";
import { NotificationContext, ThemeContext } from "../providers";
import { BarIndicator } from "react-native-indicators";
import { TextInput } from "./TextInput";
import filter from "lodash.filter";

const DeviceListHOC = Component => (
    props) => (
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
)

// main component for displaying device cards
class DeviceList extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    // connect to websocket for live data
    this.socket = new WebSocket(backend.sock_domain);
    this.state = {
      data: [],
      warnings: this.props.warnings,
      fullData: [],
      query: "",
      refreshing: false,
      isLoading: true,
      numColumns: Platform.isPad // change layout if using a tablet
        ? Dimensions.get("window").width > Dimensions.get("window").height
          ? 4
          : 3
        : 2,
      cardBoxWidth: 300,
    };
    Dimensions.addEventListener("change", () => {
      this.setState({
        numColumns: Platform.isPad
          ? Dimensions.get("window").width > Dimensions.get("window").height
            ? 4
            : 3
          : 2,
      });
    });
  }

  // REST api call to backend for retrieving a user's devices
  retrieveDevices() {
    auth.currentUser // get authentication from Firebase
      .getIdToken(true)
      .then((token) => {
        console.log("[DeviceList] retrieveDevices: Starting request");

        return fetch(new URL("devices/retrieve", backend.http_domain), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
          }),
        });
      })
      .then((response) => {
        return response.json();
      })
      .then((deviceData) => {
        for (device of deviceData) {
          // set starting CO2 value to be displayed as blank
          device.co2 = 0;

          // if device has not been added to list of devices yet...
          if (!this.state.fullData.some((item) => device.id === item.id)) {
            // ...add it and...
            this.setState({
              data: [...this.state.data, device],
              fullData: [...this.state.fullData, device],
            });
            // ...register the device with backend socket server
            try {
              this.socket.send(device.id);
            } catch (error) {
              console.log("[DeviceList] retrieveDevices error: " + error.message);
            }
          }
        }

        this.setState({ isLoading: false });
      })
      .catch((error) => {
        console.log("[DeviceList] retrieveDevices error: " + error.message);
      });
  }

  // api call for removing devices
  deleteDevice = (ID) => {
    auth.currentUser
      .getIdToken(true)
      .then((token) => {
        console.log("deleteDevice: Deleting device");
        return fetch(new URL("devices/delete", backend.http_domain), {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            device: ID,
          }),
        });
      })
      .then((response) => {
        return response.text();
      })
      .then((deleted_id) => {
        this.removeWarningCountStorage(deleted_id);
        this.setState({
          data: this.state.data.filter(function (device) {
            return device.id !== deleted_id;
          }),
        });
      })
      .catch((error) => {
        console.log("[DeviceList] deleteDevice error: " + error.message);
      });
  };

  // used to update a device's name and description in the backend
  deviceUpdate = (values, ID) => {
    const { name, description } = values;
    let data_Var = [];
    let index = 0;

    auth.currentUser
      .getIdToken(true)
      .then((token) => {
        return fetch(new URL("devices/update", backend.http_domain), {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            device: ID,
            name: name,
            description: description,
          }),
        });
      })
      .then((response) => response.json())
      .then((data) => {
        // update device object in current state's device array
        data_Var = this.state.data;
        index = data_Var.findIndex((a) => a.id === data.id);
        data_Var[index].name = data.name;
        data_Var[index].description = data.description;

        this.setState({ data: data_Var });
      })
      .catch((error) => {
        console.log("[DeviceList]: deviceUpdate error: " + error.message);
      });
  };

  // increment local storage with warnings count
  handleWarningCount = (ID, co2) => {
    if (co2 >= 800) {
      this.props.notification.updateWarningCount(ID);
    }
  };

  // delete device's warnings from local storage using id
  removeWarningCountStorage = async (ID) => {
    let removedWarning = this.state.warnings;
    if (ID in removedWarning) {
      delete removedWarning[ID];
      try {
        await AsyncStorage.setItem('@warnings', JSON.stringify(removedWarning));
      } catch (error) {
        console.log("[DeviceList] removeWarningCount error: " + error.message);
      }
    }
  }

  handleWebSocketLifecycle() {
    this.socket.onopen = () => {
      console.log(
        "[DeviceList] handleWebSocketLifecycle: Connection established"
      );
    };

    // update state on new data received for devices
    this.socket.onmessage = (raw) => {
      console.log("[DeviceList] handleWebSocketLifecycle: Received live data");
      const data = JSON.parse(raw.data);

      // make copy of current state
      let newData = this.state.data;

      // update co2 data state for each device
      for (device of newData) {
        console.log(
          "[DeviceList] handleWebSocketLifecycle device ID: " + device.id
        );
        if (device.id === data.id) {
          console.log("[DeviceList] handleWebSocketLifecycle: Setting data");
          // set to fixed two decimal points
          device.co2 = data.co2EquivalentValue.toFixed(2);
          this.handleWarningCount(device.id, device.co2);
        }
      }

      // update displayed data
      this.setState({ data: newData });
    };

    this.socket.onerror = (raw) => {
      console.log(
        "[DeviceList] handleWebSocketLifecycle error: " + raw.message
      );
    };

    this.socket.onclose = (raw) => {
      console.log("[DeviceList] handleWebSocketLifecycle: Connection closed");
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.handleWebSocketLifecycle();
    this.retrieveDevices();
  }

  componentDidUpdate(prevProps) {
    // if `warnings` has been updated due to a notification received...
    if (this.props.warnings !== prevProps.warnings) {
      this.setState({ warnings: this.props.warnings });
    }

    // if `HomeScreen` is focused and we just came from another screen...
    if (this.props.isFocused && this.props.isFocused !== prevProps.isFocused) {
      this.retrieveDevices();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.socket.close();
  }

  // create elastic search using query and dynamic filtering
  contains = (
    { name, description, co2, percentage, charging, serial, imei, activated },
    query
  ) => {
    return name.toLowerCase().includes(query) ||
      description.toLowerCase().includes(query) ||
      Math.abs(co2 - query) < 100 ||
      Math.abs(percentage - query) < 10 ||
      serial.toLowerCase().includes(query) ||
      imei.toLowerCase().includes(query) ||
      (query === "charging" && charging) ||
      (query === "not charging" && !charging) ||
      (query === "activated" && activated) ||
      (query === "activating" && !activated);
  };

  // search using options above
  handleSearch = (text) => {
    const formattedQuery = text.toLowerCase();
    const data = filter(this.state.fullData, (device) => {
      return this.contains(device, formattedQuery);
    });
    this.setState({ data, query: text });
  };

  renderHeader = () => (
    <TextInput
      autoCapitalize="none"
      autoCorrect={false}
      onChangeText={this.handleSearch}
      placeholder="Search device"
      style={{
        backgroundColor: this.props.theme.darkTheme
          ? Colors.lightNavy
          : Colors.lightGrey,
      }}
      containerStyle={{ paddingTop: 10, paddingBottom: 8 }}
      textBoxStyle={{ paddingLeft: 5 }}
      value={this.state.query}
      clearButton
      onClear={() => {
        this.setState({ query: "" });
        this.handleSearch("");
      }}
    />
  );

  render() {
    const { data, isLoading } = this.state;

    const getWarningCount = (ID) => {
      // get current warning count
      if (ID in this.state.warnings) {
        return this.state.warnings[ID];
      }
      // otherwise, no warnings
      else {
        return 0;
      }
    }

    // get devices and set refreshing indicator state
    const onRefresh = () => {
      this.setState({ refreshing: true });
      this.retrieveDevices();
      this.setState({ refreshing: false });
    };

    const renderItem = ({ item }) => {
      return (
        <View
          style={{
            width: this.state.cardBoxWidth,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <View style={{ flexDirection: "column" }}>
            <DeviceCard
              ID={item.id}
              deviceName={item.name}
              deviceDescription={item.description}
              battery={item.percentage}
              isCharging={item.charging}
              value={item.co2}
              IMEI={item.imei}
              Serial={item.serial}
              activated={item.activated}
              numOfWarnings={getWarningCount(item.id)}
              onPress={() => {
                if (item.activated) {
                  Navigation.navigate("Detail", {
                    deviceID: item.id,
                    deviceName: item.name,
                    deviceDescription: item.description,
                    page: "readings"
                  });
                } else {
                  Alert.alert(
                    "Inactive",
                    "The device is being activated.\nPlease check again later.",
                    [
                      {
                        text: "Ok",
                        onPress: () => {},
                      },
                    ]
                  );
                }
              }}
              onDelete={() => {
                this.deleteDevice(item.id);
              }}
              onDeviceUpdate={(data) => {
                this.deviceUpdate(data, item.id);
              }}
            />
            <View
              style={[
                styles.separatorCards,
                !this.props.theme.darkTheme && {
                  backgroundColor: Colors.superLightGrey,
                },
              ]}
            />
          </View>
        </View>
      );
    };

    return (
      <View
        style={styles.container}
        onLayout={(event) => {
          var { width } = event.nativeEvent.layout;
          width = width / this.state.numColumns;
          this.setState({ cardBoxWidth: width });
        }}
      >
        {isLoading ? (
          <View style={{ width: "100%", height: 590 }}>
            <BarIndicator
              color={this.props.theme.darkTheme ? Colors.white : Colors.black}
              count={6}
              size={30}
            />
          </View>
        ) : (
          <FlatList
            key={this.state.numColumns}
            data={data}
            numColumns={this.state.numColumns}
            renderItem={renderItem}
            extraData={this.state}
            columnWrapperStyle={{ justifyContent: "flex-start" }}
            ListHeaderComponent={this.renderHeader}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={onRefresh}
                colors={[Colors.black]}
                tintColor={this.props.theme.darkTheme ? Colors.white : Colors.black}
              />
            }
          />
        )}
      </View>
    );
  }
}

export default DeviceListHOC(DeviceList);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  registerBox: {
    width: "48%",
    height: 140,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.navy,
    borderColor: Colors.white,
    borderWidth: 1,
    marginVertical: 8,
  },
  registeredBox: {
    width: "48%",
    backgroundColor: Colors.red,
    borderColor: Colors.white,
    borderWidth: 1,
    marginVertical: 8,
  },
  mangohText: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: "500",
  },
  separatorCards: {
    width: "100%",
    height: 5,
    backgroundColor: Colors.navy,
    marginTop: 5,
  },
});
