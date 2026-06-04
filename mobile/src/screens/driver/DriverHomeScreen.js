import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import TextField from "../../components/TextField";
import { theme } from "../../config/theme";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { connectSocket } from "../../services/socket";

const vehicleTypes = ["BIKE", "CAR"];

export default function DriverHomeScreen({ navigation }) {
  const { token, signOut } = useAuth();
  const [vehicleType, setVehicleType] = useState("BIKE");
  const [plateNumber, setPlateNumber] = useState("");
  const [profile, setProfile] = useState(null);
  const [online, setOnline] = useState(false);
  const [tripRequest, setTripRequest] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [otp, setOtp] = useState("1234");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Submit setup and wait for approval.");

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!token) return undefined;

    const socket = connectSocket(token);

    socket.on("trip:request", (payload) => {
      setTripRequest(payload);
      setMessage(`New request from ${payload.passenger?.name || "passenger"}.`);
    });
    socket.on("trip:request-expired", () => {
      setTripRequest(null);
      setMessage("Trip request expired.");
    });
    socket.on("trip:accepted", ({ trip }) => {
      setTripRequest(null);
      setActiveTrip(trip);
      setMessage("Trip accepted. Drive to pickup.");
    });
    socket.on("trip:started", ({ trip }) => {
      setActiveTrip(trip);
      setMessage("Trip started.");
    });
    socket.on("trip:completed", ({ trip }) => {
      setActiveTrip(trip);
      setMessage(`Trip completed. Fare BDT ${trip.finalFare}.`);
    });

    return () => {
      socket.off("trip:request");
      socket.off("trip:request-expired");
      socket.off("trip:accepted");
      socket.off("trip:started");
      socket.off("trip:completed");
    };
  }, [token]);

  useEffect(() => {
    if (!online || !token) return undefined;

    const timer = setInterval(async () => {
      try {
        const location = await getLocationPoint();
        connectSocket(token).emit("driver:update-location", location);
      } catch {
        // The visible online toggle already reports permission errors.
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [online, token]);

  async function loadProfile() {
    try {
      const data = await api.driverProfile();
      setProfile(data.driver);
      setOnline(Boolean(data.driver.isOnline));
      setVehicleType(data.driver.vehicleType);
      setPlateNumber(data.driver.plateNumber);
      setMessage(`Driver status: ${data.driver.status}`);
    } catch (error) {
      setProfile(null);
    }
  }

  async function submitSetup() {
    if (!plateNumber.trim()) {
      Alert.alert("Missing plate", "Enter plate number.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.driverSetup({ vehicleType, plateNumber });
      setProfile(data.driver);
      setMessage(data.message);
      Alert.alert("Submitted", "Admin can approve you from the web panel.");
    } catch (error) {
      Alert.alert("Setup failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function getLocationPoint() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission is required.");
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    };
  }

  async function toggleOnline() {
    if (!profile || profile.status !== "APPROVED") {
      Alert.alert("Not approved", "Admin must approve this driver first.");
      return;
    }

    setLoading(true);
    try {
      const nextOnline = !online;
      const location = nextOnline ? await getLocationPoint() : {};
      const data = await api.toggleOnline({
        isOnline: nextOnline,
        ...location,
      });

      setOnline(data.driver.isOnline);
      setProfile(data.driver);
      setMessage(data.message);

      if (nextOnline) {
        connectSocket(token).emit("driver:update-location", location);
      }
    } catch (error) {
      Alert.alert("Status failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  async function acceptRequest() {
    if (!tripRequest) return;
    connectSocket(token).emit("trip:accept", { tripId: tripRequest.tripId });
  }

  async function declineRequest() {
    if (!tripRequest) return;
    connectSocket(token).emit("trip:decline", { tripId: tripRequest.tripId });
    setTripRequest(null);
  }

  async function markArrived() {
    await runTripAction(() => api.markArrived(activeTrip.id));
  }

  async function startTrip() {
    await runTripAction(() => api.startTrip(activeTrip.id, otp));
  }

  async function completeTrip() {
    await runTripAction(() => api.completeTrip(activeTrip.id));
  }

  async function runTripAction(action) {
    if (!activeTrip) return;

    setLoading(true);
    try {
      const data = await action();
      setActiveTrip(data.trip);
      setMessage(data.message);
    } catch (error) {
      Alert.alert("Trip action failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Driver</Text>
          <Text style={styles.subtitle}>{message}</Text>
        </View>
        <Pressable onPress={signOut}>
          <Text style={styles.link}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vehicle Setup</Text>
        <View style={styles.segmentRow}>
          {vehicleTypes.map((type) => (
            <Pressable
              key={type}
              style={[styles.segment, vehicleType === type && styles.activeSegment]}
              onPress={() => setVehicleType(type)}
            >
              <Text
                style={[
                  styles.segmentText,
                  vehicleType === type && styles.activeSegmentText,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextField
          label="Plate number"
          value={plateNumber}
          onChangeText={setPlateNumber}
          placeholder="DHAKA-METRO-HA-1234"
        />
        <PrimaryButton
          title={profile ? "Update Setup" : "Submit Setup"}
          onPress={submitSetup}
          loading={loading}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Availability</Text>
        <Text style={styles.meta}>
          Status: {profile?.status || "NOT_SUBMITTED"} |{" "}
          {online ? "Online" : "Offline"}
        </Text>
        <PrimaryButton
          title={online ? "Go Offline" : "Go Online"}
          variant={online ? "danger" : "success"}
          onPress={toggleOnline}
          loading={loading}
        />
      </View>

      {tripRequest && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Incoming Trip</Text>
          <Text style={styles.meta}>
            {tripRequest.pickup.address} to {tripRequest.dropoff.address}
          </Text>
          <Text style={styles.meta}>
            Fare BDT {tripRequest.estimatedFare} | Pickup{" "}
            {tripRequest.pickupDistanceKm} km away
          </Text>
          <View style={styles.buttonRow}>
            <PrimaryButton title="Accept" variant="success" onPress={acceptRequest} />
            <PrimaryButton title="Decline" variant="danger" onPress={declineRequest} />
          </View>
        </View>
      )}

      {activeTrip && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Active Trip</Text>
          <Text style={styles.meta}>
            {activeTrip.pickupAddress} to {activeTrip.dropoffAddress}
          </Text>
          <Text style={styles.meta}>Status: {activeTrip.status}</Text>
          {activeTrip.status === "DRIVER_ARRIVED" && (
            <TextField
              label="Passenger OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
            />
          )}
          {activeTrip.status === "ACCEPTED" && (
            <PrimaryButton title="Arrived" onPress={markArrived} loading={loading} />
          )}
          {activeTrip.status === "DRIVER_ARRIVED" && (
            <PrimaryButton
              title="Start Trip"
              variant="success"
              onPress={startTrip}
              loading={loading}
            />
          )}
          {activeTrip.status === "STARTED" && (
            <PrimaryButton
              title="Complete Trip"
              variant="warning"
              onPress={completeTrip}
              loading={loading}
            />
          )}
        </View>
      )}

      <PrimaryButton
        title="My Trips"
        variant="outline"
        onPress={() => navigation.navigate("Trips")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.heading,
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.muted,
    maxWidth: 250,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: "800",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  cardTitle: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: "800",
  },
  meta: {
    color: theme.colors.text,
    lineHeight: 21,
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
  buttonRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
});
