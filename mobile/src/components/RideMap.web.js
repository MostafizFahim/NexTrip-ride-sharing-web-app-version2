import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { DEFAULT_REGION } from "../config/api";
import { theme } from "../config/theme";

export function Marker({ title, pinColor }) {
  return (
    <View style={styles.marker}>
      <View style={[styles.markerDot, { backgroundColor: pinColor }]} />
      <Text style={styles.markerText}>{title}</Text>
    </View>
  );
}

export default function RideMap({ children, onPress, region, style }) {
  function handlePress() {
    if (!onPress) return;

    const currentRegion = region || DEFAULT_REGION;
    onPress({
      nativeEvent: {
        coordinate: {
          latitude: currentRegion.latitude + 0.01,
          longitude: currentRegion.longitude + 0.01,
        },
      },
    });
  }

  return (
    <Pressable style={[styles.map, style]} onPress={handlePress}>
      <Text style={styles.title}>Map preview</Text>
      <Text style={styles.subtitle}>Open on Expo Go for the real native map.</Text>
      <View style={styles.markerLayer}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  map: {
    alignItems: "center",
    backgroundColor: "#edf1ff",
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  title: {
    color: theme.colors.heading,
    fontSize: 18,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.muted,
    marginTop: 4,
    textAlign: "center",
  },
  markerLayer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: theme.spacing.md,
  },
  marker: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: theme.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  markerDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  markerText: {
    color: theme.colors.heading,
    fontWeight: "700",
  },
});
