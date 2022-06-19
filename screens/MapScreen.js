import React, { Component } from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { auth, Colors, backend } from "../config";
import { ThemeContext } from "../providers";
import MapView, { Callout, Marker, Circle } from "react-native-maps";
import { BarIndicator } from "react-native-indicators";
import Constants from "expo-constants";

class MapScreen extends Component {
  _isMounted = false;
  static contextType = ThemeContext;

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      data: [{ longitude: 0, latitude: 0, name: "", co2: 0 }],
      latitude_avg: 0,
      longitude_avg: 0,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  }

  // retrieve all of a user's devices
  retrieveLocations() {
    auth.currentUser
      .getIdToken(true)
      .then((token) => {
        console.log("[MapScreen] retrieveLocations: Starting request");

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

        // calculate center and bounds for map using device locations
        let latitude_avg_Var = 0;
        let longitude_avg_Var = 0;

        let data_filtered = deviceData.filter((e) => e.longitude != null);

        let latitude_max = data_filtered[0].latitude;
        let latitude_min = data_filtered[0].latitude;
        let longitude_max = data_filtered[0].longitude;
        let longitude_min = data_filtered[0].longitude;

        for (let i = 0; i < data_filtered.length; i = i + 1) {
          if (data_filtered[i].latitude > latitude_max)
            latitude_max = data_filtered[i].latitude;
          if (data_filtered[i].latitude < latitude_min)
            latitude_min = data_filtered[i].latitude;
          if (data_filtered[i].longitude > longitude_max)
            longitude_max = data_filtered[i].longitude;
          if (data_filtered[i].longitude < longitude_min)
            longitude_min = data_filtered[i].longitude;
        }
        latitude_avg_Var = (latitude_max + latitude_min) / 2;
        longitude_avg_Var = (longitude_max + longitude_min) / 2;

        this.setState({
          isLoading: false,
          data: data_filtered,
          latitude_avg: latitude_avg_Var,
          longitude_avg: longitude_avg_Var,
          latitudeDelta: (latitude_max - latitude_min) * 1.4,
          longitudeDelta: (longitude_max - longitude_min) * 1.4,
        });
      })
      .catch((error) => {
        console.log("[MapScreen] retrieveLocations: " + error.message);
      });
  }

  componentDidMount() {
    this._isMounted = true;
    this.retrieveLocations();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <View
        style={[
          styles.container,
          !this.context.darkTheme && { backgroundColor: Colors.white },
        ]}
      >
        {this.state.isLoading ? (
          <View style={{ width: "100%", height: 450 }}>
            <BarIndicator
              color={this.context.darkTheme ? Colors.white : Colors.black}
              count={6}
              size={30}
            />
          </View>
        ) : (
          <MapView
            showsUserLocation
            showsMyLocationButton
            userInterfaceStyle={this.context.darkTheme ? "dark" : "light"}
            style={styles.map}
            initialRegion={{
              latitude: this.state.latitude_avg,
              longitude: this.state.longitude_avg,
              latitudeDelta: this.state.latitudeDelta,
              longitudeDelta: this.state.longitudeDelta,
            }}
          >
            {this.state.data
              .filter((e) => e.latitude != null)
              .map((val) => {
                return (
                  <React.Fragment key={val.id}>
                    <Marker
                      coordinate={{
                        latitude: val.latitude,
                        longitude: val.longitude,
                      }}
                      pincolor="red"
                    >
                      <Callout>
                        <View style={[styles.callout]}>
                          <Text style={styles.calloutDeviceName}>
                            {val.name}
                          </Text>

                          <Text style={styles.co2}>
                            {val.co2 == null
                              ? "-- ppm"
                              : val.co2.toFixed(2) + " ppm"}
                          </Text>
                        </View>
                      </Callout>
                    </Marker>
                    <Circle /* set circle around pin based on CO2 reading */
                      center={{
                        latitude: val.latitude,
                        longitude: val.longitude,
                      }}
                      strokeColor={
                        val.co2 == null
                          ? Colors.medium
                          : val.co2 > 800
                          ? val.co2 > 1000
                            ? Colors.warningRed
                            : Colors.yellow
                          : Colors.green
                      }
                      strokeWidth={8}
                      radius={80}
                    />
                  </React.Fragment>
                );
              })}
          </MapView>
        )}
      </View>
    );
  }
}

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height - Constants.statusBarHeight,
  },
  callout: {
    padding: Platform.OS === "ios" ? 0 : 10,
  },
  calloutDeviceName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  co2: {
    fontSize: 15,
    paddingTop: 10,
  },
});
