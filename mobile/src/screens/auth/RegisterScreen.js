import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import TextField from "../../components/TextField";
import { theme } from "../../config/theme";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

const roles = [
  { label: "Passenger", value: "PASSENGER" },
  { label: "Driver", value: "DRIVER" },
];

export default function RegisterScreen() {
  const { signIn } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PASSENGER");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !phone || !password) {
      Alert.alert("Missing info", "Fill name, phone, and password.");
      return;
    }

    setLoading(true);
    try {
      const auth = await api.register({
        name: name.trim(),
        phone: phone.trim(),
        password,
        role,
        otp: "1234",
      });
      await signIn(auth);
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>
          OTP is hardcoded as 1234 for this learning project.
        </Text>
      </View>

      <View style={styles.roleRow}>
        {roles.map((item) => (
          <Pressable
            key={item.value}
            style={[styles.roleButton, role === item.value && styles.activeRole]}
            onPress={() => setRole(item.value)}
          >
            <Text
              style={[
                styles.roleText,
                role === item.value && styles.activeRoleText,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextField label="Name" value={name} onChangeText={setName} />
      <TextField
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <PrimaryButton
        title="Register"
        onPress={handleRegister}
        loading={loading}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.heading,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: theme.colors.muted,
    lineHeight: 22,
    marginTop: theme.spacing.xs,
  },
  roleRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  roleButton: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    padding: theme.spacing.md,
  },
  activeRole: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  roleText: {
    color: theme.colors.heading,
    fontWeight: "700",
  },
  activeRoleText: {
    color: "#ffffff",
  },
});
