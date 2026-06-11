import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";

import PrimaryButton from "../../components/PrimaryButton";
import MapView, { Marker } from "../../components/RideMap";
import Screen from "../../components/Screen";
import TextField from "../../components/TextField";
import { DEFAULT_REGION } from "../../config/api";
import { theme } from "../../config/theme";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { connectSocket } from "../../services/socket";

const rideTypes = ["BIKE", "CAR"];

export default function PassengerHomeScreen({ navigation }) {
  const { token, signOut } = useAuth();
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [selecting, setSelecting] = useState("pickup");
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [pickupAddress, setPickupAddress] = useState("Current pickup");
  const [dropoffAddress, setDropoffAddress] = useState("Destination");
  const [vehicleType, setVehicleType] = useState("BIKE");
  const [estimate, setEstimate] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [status, setStatus] = useState("Set pickup and destination.");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return undefined;

    const socket = connectSocket(token);

    socket.on("trip:matching-driver", (payload) => {
      setStatus(`Matching with ${payload.driverName || "driver"}...`);
    });
    socket.on("trip:accepted", ({ trip }) => {
      setCurrentTrip(trip);
      setStatus(`Accepted by ${trip.driver?.user?.name || "driver"}.`);
    });
    socket.on("trip:driver-arrived", () => setStatus("Driver arrived."));
    socket.on("trip:started", () => setStatus("Trip started."));
    socket.on("trip:completed", ({ trip }) => {
      setCurrentTrip(trip);
      setStatus(`Trip completed. Final fare BDT ${trip.finalFare}.`);
    });
    socket.on("trip:no-drivers-available", () => {
      setStatus("No drivers available right now.");
    });
    socket.on("trip:driver-location", (payload) => {
      setStatus(`Driver is moving: ${payload.status}`);
    });

    return () => {
      socket.off("trip:matching-driver");
      socket.off("trip:accepted");
      socket.off("trip:driver-arrived");
      socket.off("trip:started");
      socket.off("trip:completed");
      socket.off("trip:no-drivers-available");
      socket.off("trip:driver-location");
    };
  }, [token]);

  const canEstimate = useMemo(() => pickup && dropoff, [pickup, dropoff]);

  async function useCurrentLocation() {
    const { status: permission } =
      await Location.requestForegroundPermissionsAsync();
    if (permission !== "granted") {
      Alert.alert("Location blocked", "Allow location to use current pickup.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const point = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    setPickup(point);
    setRegion({ ...DEFAULT_REGION, ...point });
    setPickupAddress("Current location");
  }

  function handleMapPress(event) {
    const point = event.nativeEvent.coordinate;
    if (selecting === "pickup") {
      setPickup(point);
      setPickupAddress("Selected pickup");
      setSelecting("dropoff");
    } else {
      setDropoff(point);
      setDropoffAddress("Selected destination");
    }
    setEstimate(null);
  }

  async function handleEstimate() {
    if (!canEstimate) {
      Alert.alert("Choose locations", "Set both pickup and dropoff.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.estimateTrip({
        pickupLat: pickup.latitude,
        pickupLng: pickup.longitude,
        dropoffLat: dropoff.latitude,
        dropoffLng: dropoff.longitude,
        vehicleType,
      });
      setEstimate(data.estimate);
      setStatus("Fare estimate ready.");
    } catch (error) {
      Alert.alert("Estimate failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBook() {
    if (!canEstimate) {
      Alert.alert("Choose locations", "Set both pickup and dropoff.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.bookTrip({
        pickupLat: pickup.latitude,
        pickupLng: pickup.longitude,
        pickupAddress,
        dropoffLat: dropoff.latitude,
        dropoffLng: dropoff.longitude,
        dropoffAddress,
        vehicleType,
        paymentMethod: "CASH",
      });
      setCurrentTrip(data.trip);
      setStatus(data.message);
      Alert.alert("Ride requested", "Matching started.");
    } catch (error) {
      Alert.alert("Booking failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelTrip() {
    if (!currentTrip) return;

    setLoading(true);
    try {
      const data = await api.cancelTrip(currentTrip.id);
      setCurrentTrip(data.trip);
      setStatus(data.message);
      Alert.alert("Cancelled", "Trip cancelled.");
    } catch (error) {
      Alert.alert("Cancel failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll={false}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Passenger</Text>
          <Text style={styles.subtitle}>{status}</Text>
        </View>
        <View style={styles.topLinks}>
          <Pressable onPress={() => navigation.navigate("Profile")}>
            <Text style={styles.link}>Profile</Text>
          </Pressable>
          <Pressable onPress={signOut}>
            <Text style={styles.link}>Logout</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.mapBox}>
        <MapView style={styles.map} region={region} onPress={handleMapPress}>
          {pickup && (
            <Marker
              coordinate={pickup}
              title="Pickup"
              pinColor={theme.colors.primary}
            />
          )}
          {dropoff && (
            <Marker
              coordinate={dropoff}
              title="Dropoff"
              pinColor={theme.colors.heading}
            />
          )}
        </MapView>
      </View>

      <View style={styles.panel}>
        <View style={styles.segmentRow}>
          <Pressable
            style={[styles.segment, selecting === "pickup" && styles.activeSegment]}
            onPress={() => setSelecting("pickup")}
          >
            <Text
              style={[
                styles.segmentText,
                selecting === "pickup" && styles.activeSegmentText,
              ]}
            >
              Pickup
            </Text>
          </Pressable>
          <Pressable
            style={[styles.segment, selecting === "dropoff" && styles.activeSegment]}
            onPress={() => setSelecting("dropoff")}
          >
            <Text
              style={[
                styles.segmentText,
                selecting === "dropoff" && styles.activeSegmentText,
              ]}
            >
              Dropoff
            </Text>
          </Pressable>
        </View>

        <TextField
          label="Pickup address"
          value={pickupAddress}
          onChangeText={setPickupAddress}
        />
        <TextField
          label="Dropoff address"
          value={dropoffAddress}
          onChangeText={setDropoffAddress}
        />

        <View style={styles.rideTypes}>
          {rideTypes.map((type) => (
            <Pressable
              key={type}
              style={[styles.rideType, vehicleType === type && styles.activeRideType]}
              onPress={() => setVehicleType(type)}
            >
              <Text
                style={[
                  styles.rideTypeText,
                  vehicleType === type && styles.activeRideTypeText,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        {estimate && (
          <Text style={styles.estimate}>
            {estimate.distanceKm} km - BDT {estimate.estimatedFare}
          </Text>
        )}

        <View style={styles.buttonGrid}>
          <PrimaryButton
            title="Use GPS"
            variant="outline"
            onPress={useCurrentLocation}
          />
          <PrimaryButton
            title="Estimate"
            variant="success"
            onPress={handleEstimate}
            loading={loading}
          />
        </View>
        <PrimaryButton title="Book Ride" onPress={handleBook} loading={loading} />
        {currentTrip &&
          ["REQUESTED", "ACCEPTED", "DRIVER_ARRIVED"].includes(
            currentTrip.status
          ) && (
            <PrimaryButton
              title="Cancel Current Trip"
              variant="danger"
              onPress={handleCancelTrip}
              loading={loading}
            />
          )}
        <PrimaryButton
          title="My Trips"
          variant="outline"
          onPress={() => navigation.navigate("Trips")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.muted,
    maxWidth: 260,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  topLinks: {
    alignItems: "flex-end",
    gap: 8,
  },
  mapBox: {
    borderColor: theme.colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 220,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
  },
  segmentRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  segment: {
    alignItems: "center",
    borderColor: theme.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    padding: theme.spacing.sm,
  },
  activeSegment: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  segmentText: {
    color: theme.colors.heading,
    fontWeight: "700",
  },
  activeSegmentText: {
    color: "#ffffff",
  },
  rideTypes: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  rideType: {
    alignItems: "center",
    borderColor: theme.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    padding: theme.spacing.sm,
  },
  activeRideType: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  rideTypeText: {
    color: theme.colors.heading,
    fontWeight: "700",
  },
  activeRideTypeText: {
    color: "#ffffff",
  },
  estimate: {
    color: theme.colors.heading,
    fontSize: 16,
    fontWeight: "800",
  },
  buttonGrid: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
});
