import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
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
