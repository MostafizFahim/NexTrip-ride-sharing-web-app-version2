import React from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { theme } from "./src/config/theme";
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import PassengerHomeScreen from "./src/screens/passenger/PassengerHomeScreen";
import DriverHomeScreen from "./src/screens/driver/DriverHomeScreen";
import TripsScreen from "./src/screens/shared/TripsScreen";
import ProfileScreen from "./src/screens/shared/ProfileScreen";

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.background,
      }}
    >
      <ActivityIndicator color={theme.colors.primary} size="large" />
    </View>
  );
}

function AppNavigator() {
  const { user, booting } = useAuth();

  if (booting) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.heading },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: "NexTrip Login" }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Create Account" }}
            />
          </>
        ) : user.role === "DRIVER" ? (
          <>
            <Stack.Screen
              name="DriverHome"
              component={DriverHomeScreen}
              options={{ title: "Driver Console" }}
            />
            <Stack.Screen
              name="Trips"
              component={TripsScreen}
              options={{ title: "My Trips" }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: "Profile" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="PassengerHome"
              component={PassengerHomeScreen}
              options={{ title: "Book Ride" }}
            />
            <Stack.Screen
              name="Trips"
              component={TripsScreen}
              options={{ title: "My Trips" }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: "Profile" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  );
}
