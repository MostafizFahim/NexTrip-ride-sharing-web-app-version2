export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";

export const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || API_BASE_URL.replace(/\/api$/, "");

export const DEFAULT_REGION = {
  latitude: 23.7806,
  longitude: 90.4193,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};
