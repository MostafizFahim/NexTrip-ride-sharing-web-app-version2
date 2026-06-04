import React, { useCallback, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import Screen from "../../components/Screen";
import { theme } from "../../config/theme";
import { api } from "../../services/api";

export default function TripsScreen() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.myTrips();
      setTrips(data.trips || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips])
  );

  async function rateTrip(tripId, score) {
    try {
      await api.rateTrip(tripId, { score });
      Alert.alert("Thanks", "Rating submitted.");
    } catch (error) {
      Alert.alert("Rating failed", error.message);
    }
  }

  async function cancelTrip(tripId) {
    try {
      await api.cancelTrip(tripId);
      await loadTrips();
    } catch (error) {
      Alert.alert("Cancel failed", error.message);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>My Trips</Text>
      {loading && <ActivityIndicator color={theme.colors.primary} />}
      <View>
        {trips.map((trip) => (
          <View style={styles.card} key={trip.id}>
            <View style={styles.row}>
              <Text style={styles.route}>
                {trip.pickupAddress} to {trip.dropoffAddress}
              </Text>
              <Text style={styles.status}>{trip.status}</Text>
            </View>
            <Text style={styles.meta}>
              {trip.vehicleType} | {trip.distanceKm} km
            </Text>
            <Text style={styles.meta}>
              Passenger: {trip.passenger?.name || "Passenger"}
            </Text>
            <Text style={styles.meta}>
              Driver: {trip.driver?.user?.name || "No driver yet"}
            </Text>
            <Text style={styles.fare}>
              BDT {trip.finalFare || trip.estimatedFare}
            </Text>
            {["REQUESTED", "ACCEPTED", "DRIVER_ARRIVED"].includes(
              trip.status
            ) && (
              <Pressable
                style={styles.cancelButton}
                onPress={() => cancelTrip(trip.id)}
              >
                <Text style={styles.cancelText}>Cancel Trip</Text>
              </Pressable>
            )}
            {trip.status === "COMPLETED" && (
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((score) => (
                  <Pressable
                    key={score}
                    style={styles.ratingButton}
                    onPress={() => rateTrip(trip.id, score)}
                  >
                    <Text style={styles.ratingText}>{score}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ))}

        {!loading && trips.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No trips yet.</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: theme.colors.heading,
    fontSize: 26,
    fontWeight: "900",
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    gap: 6,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  route: {
    color: theme.colors.heading,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
  },
  status: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  meta: {
    color: theme.colors.muted,
  },
  fare: {
    color: theme.colors.success,
    fontSize: 16,
    fontWeight: "900",
  },
  cancelButton: {
    alignItems: "center",
    borderColor: theme.colors.danger,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  cancelText: {
    color: theme.colors.danger,
    fontWeight: "800",
  },
  ratingRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: theme.spacing.sm,
  },
  ratingButton: {
    alignItems: "center",
    backgroundColor: theme.colors.softPrimary,
    borderRadius: 6,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  ratingText: {
    color: theme.colors.primary,
    fontWeight: "900",
  },
  empty: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing.lg,
  },
  emptyText: {
    color: theme.colors.muted,
    textAlign: "center",
  },
});
