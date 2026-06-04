import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import PrimaryButton from "../../components/PrimaryButton";
import Screen from "../../components/Screen";
import TextField from "../../components/TextField";
import { theme } from "../../config/theme";
import { useAuth } from "../../context/AuthContext";
import { api, saveStoredAuth } from "../../services/api";

export default function ProfileScreen() {
  const { token, user, signIn, signOut } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.me();
        setProfile(data.user);
        setName(data.user.name);
      } catch {
        setProfile(user);
      }
    }

    loadProfile();
  }, [user]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Missing name", "Name is required.");
      return;
    }

    setLoading(true);
    try {
      const payload = { name: name.trim() };
      if (password) payload.password = password;

      const data = await api.updateMe(payload);
      const updatedAuth = { token, user: data.user };
      await saveStoredAuth(updatedAuth);
      await signIn(updatedAuth);
      setPassword("");
      setProfile(data.user);
      Alert.alert("Saved", "Profile updated.");
    } catch (error) {
      Alert.alert("Update failed", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.meta}>Phone: {profile?.phone || user?.phone}</Text>
        <Text style={styles.meta}>Role: {profile?.role || user?.role}</Text>
        <Text style={styles.meta}>Rating: {profile?.rating || user?.rating || 5}</Text>
      </View>

      <TextField label="Name" value={name} onChangeText={setName} />
      <TextField
        label="New password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Leave blank to keep current"
      />
      <PrimaryButton title="Save Profile" onPress={handleSave} loading={loading} />
      <View style={styles.spacer} />
      <PrimaryButton title="Logout" variant="danger" onPress={signOut} />
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
  meta: {
    color: theme.colors.text,
  },
  spacer: {
    height: theme.spacing.md,
  },
});
