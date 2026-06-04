const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

function getStoredAuth() {
  try {
    const auth = JSON.parse(localStorage.getItem("nextrip:auth") || "null");
    if (auth?.token) return auth;
  } catch {
    // Ignore malformed local auth and fall back to legacy keys.
  }

  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return token ? { token, user } : null;
}

function saveAuth({ token, user }) {
  const safeUser = {
    ...user,
    fullName: user?.fullName || user?.name || "Admin",
    role: String(user?.role || "").toLowerCase(),
    userType:
      String(user?.role || "").toUpperCase() === "ADMIN"
        ? "Admin"
        : String(user?.role || "").toUpperCase() === "DRIVER"
        ? "Driver"
        : "Passenger",
  };

  localStorage.setItem("authToken", token);
  localStorage.setItem("user", JSON.stringify(safeUser));
  localStorage.setItem("nextrip:auth", JSON.stringify({ token, user: safeUser }));
}

async function request(method, url, body) {
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  const auth = getStoredAuth();

  const response = await fetch(`${API_BASE_URL}${cleanUrl}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = data?.message || data || "Backend request failed";
    const error = new Error(message);
    error.response = { data };
    throw error;
  }

  return { data };
}

const backendAPI = {
  get: (url) => request("GET", url),
  post: (url, data) => request("POST", url, data),
  put: (url, data) => request("PUT", url, data),
  patch: (url, data) => request("PATCH", url, data),
  delete: (url) => request("DELETE", url),
  getStoredAuth,
  saveAuth,
};

export default backendAPI;
