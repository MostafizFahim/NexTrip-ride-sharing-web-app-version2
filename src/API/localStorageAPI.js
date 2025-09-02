// src/API/localStorageAPI.js
const KEYS = {
  USERS: "users",
  AUTH: "auth", // { token, user }
};

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));
const nowISO = () => new Date().toISOString();
const normalizeEmail = (e = "") => String(e).trim().toLowerCase();
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

const readUsers = () => JSON.parse(localStorage.getItem(KEYS.USERS) || "[]");
const writeUsers = (users) =>
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
const readAuth = () => JSON.parse(localStorage.getItem(KEYS.AUTH) || "null");
const writeAuth = (auth) =>
  localStorage.setItem(KEYS.AUTH, JSON.stringify(auth));
const clearAuth = () => localStorage.removeItem(KEYS.AUTH);

// ---- Seed users (admin + 2 mocks) ----
const seedUsers = () => [
  {
    id: 1,
    fullName: "Admin",
    userName: "admin",
    email: "mostafizfahim@gmail.com",
    password: "4424",
    userType: "Admin",
    role: "admin",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: 2,
    fullName: "Demo Driver",
    userName: "demodriver",
    email: "driver.demo@trusticar.com",
    password: "driver123",
    userType: "Driver",
    role: "driver",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: 3,
    fullName: "Demo Passenger",
    userName: "demopassenger",
    email: "passenger.demo@trusticar.com",
    password: "pass1234",
    userType: "Passenger",
    role: "passenger",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
];

const localStorageAPI = {
  // Initialize only if empty
  init: () => {
    if (!localStorage.getItem(KEYS.USERS)) {
      writeUsers(seedUsers());
    }
  },

  // -------- POST --------
  post: async (url, data) => {
    await delay();

    // LOGIN
    if (url === "user/login") {
      const users = readUsers();
      const email = normalizeEmail(data?.email);
      const password = String(data?.password || "");

      const user = users.find(
        (u) => normalizeEmail(u.email) === email && u.password === password
      );

      if (!user) {
        return Promise.reject({
          response: { data: "Invalid email or password" },
        });
      }

      const token = "fake-jwt-" + Date.now();
      const { password: _pw, ...userSafe } = user;

      // Optional: persist session
      writeAuth({ token, user: userSafe });

      return { data: { token, user: userSafe } };
    }

    // REGISTER (Driver/Passenger only)
    if (url === "user/register") {
      const users = readUsers();

      const payload = {
        fullName: String(data?.fullName || "").trim(),
        userName: String(data?.userName || "").trim(),
        email: normalizeEmail(data?.email || ""),
        password: String(data?.password || ""),
        userType: String(data?.userType || "").trim(), // "Driver" | "Passenger"
      };

      // Validate required fields
      if (
        !payload.fullName ||
        !payload.userName ||
        !payload.email ||
        !payload.password ||
        !payload.userType
      ) {
        return Promise.reject({
          response: { data: "Please fill in all fields." },
        });
      }
      if (!isEmail(payload.email)) {
        return Promise.reject({
          response: { data: "Please enter a valid email address." },
        });
      }
      if (payload.password.length < 4) {
        return Promise.reject({
          response: { data: "Password must be at least 4 characters." },
        });
      }

      // Only allow Driver/Passenger
      const allowed = ["driver", "passenger"];
      const normalizedType = payload.userType.toLowerCase();
      if (!allowed.includes(normalizedType)) {
        return Promise.reject({
          response: { data: "Invalid user type. Choose Driver or Passenger." },
        });
      }

      // Uniqueness checks
      const emailExists = users.some(
        (u) => normalizeEmail(u.email) === payload.email
      );
      if (emailExists) {
        return Promise.reject({
          response: { data: "User already registered with this email." },
        });
      }
      const usernameExists = users.some(
        (u) => u.userName.toLowerCase() === payload.userName.toLowerCase()
      );
      if (usernameExists) {
        return Promise.reject({
          response: { data: "Username is already taken." },
        });
      }

      const newUser = {
        id: Date.now(),
        ...payload,
        // set role to driver/passenger (admin only via seed)
        role: normalizedType,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };

      users.push(newUser);
      writeUsers(users);

      return { data: "Registration successful! Please login." };
    }

    // LOGOUT (optional)
    if (url === "user/logout") {
      clearAuth();
      return { data: { message: "Logged out" } };
    }

    return Promise.reject({
      response: { data: `POST ${url} not implemented` },
    });
  },

  // -------- GET --------
  get: async (url) => {
    await delay();

    if (url === "user/me") {
      const auth = readAuth();
      if (!auth?.user) {
        return Promise.reject({ response: { data: "Not authenticated" } });
      }
      return { data: auth.user };
    }

    // Debug: list users without passwords
    if (url === "users") {
      const users = readUsers().map(({ password, ...rest }) => rest);
      return { data: users };
    }

    return Promise.reject({
      response: { data: `GET ${url} not implemented` },
    });
  },

  // Minimal stubs to keep axios-like shape
  put: async () =>
    Promise.reject({ response: { data: "PUT not implemented" } }),
  delete: async () =>
    Promise.reject({ response: { data: "DELETE not implemented" } }),
};

// Initialize when imported
localStorageAPI.init();
export default localStorageAPI;
