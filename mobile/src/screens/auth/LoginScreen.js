import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import TextField from "../../components/TextField";
import { theme } from "../../config/theme";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!phone || !password) {
      Alert.alert("Missing info", "Enter phone and password.");
      return;
    }

    setLoading(true);
    try {
      const auth = await api.login(phone.trim(), password);
      await signIn(auth);
    } catch (error) {
      Alert.alert("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.brand}>NexTrip</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Login with the phone and password from your local backend.
        </Text>
      </View>

      <TextField
        label="Phone"
        value={phone}
        onChangeText={setPhone}
        placeholder="01700000001"
        keyboardType="phone-pad"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="123456"
        secureTextEntry
      />

      <PrimaryButton title="Login" onPress={handleLogin} loading={loading} />

      <Pressable
        style={styles.footerLink}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.footerText}>Create passenger or driver account</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  brand: {
    color: theme.colors.primary,
    fontSize: 36,
    fontWeight: "900",
  },
  title: {
    color: theme.colors.heading,
    fontSize: 28,
    fontWeight: "800",
    marginTop: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.muted,
    lineHeight: 22,
    marginTop: theme.spacing.xs,
  },
  footerLink: {
    alignItems: "center",
    marginTop: theme.spacing.lg,
  },
  footerText: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
});
