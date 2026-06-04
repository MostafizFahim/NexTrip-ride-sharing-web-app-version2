import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";

const AUTH_KEY = "nextrip:mobile-auth";

export async function getStoredAuth() {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveStoredAuth(auth) {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export async function clearStoredAuth() {
  await AsyncStorage.removeItem(AUTH_KEY);
}

async function request(path, options = {}) {
  const auth = await getStoredAuth();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  login: (phone, password) =>
    request("/auth/login", {
      method: "POST",
      body: { phone, password },
    }),
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: payload,
    }),
  driverSetup: (payload) =>
    request("/driver/setup", {
      method: "POST",
      body: payload,
    }),
  driverProfile: () => request("/driver/profile"),
  toggleOnline: (payload) =>
    request("/driver/toggle-online", {
      method: "POST",
      body: payload,
    }),
  estimateTrip: (payload) =>
    request("/trips/estimate", {
      method: "POST",
      body: payload,
    }),
  bookTrip: (payload) =>
    request("/trips/book", {
      method: "POST",
      body: payload,
    }),
  myTrips: () => request("/trips/my"),
  markArrived: (tripId) =>
    request(`/trips/${tripId}/arrived`, { method: "POST" }),
  startTrip: (tripId, otp) =>
    request(`/trips/${tripId}/start`, {
      method: "POST",
      body: { otp },
    }),
  completeTrip: (tripId, actualDistanceKm) =>
    request(`/trips/${tripId}/complete`, {
      method: "POST",
      body: actualDistanceKm ? { actualDistanceKm } : {},
    }),
};
