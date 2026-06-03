const KEYS = {
  USERS: "nextrip:users",
  AUTH: "nextrip:auth",
  RIDES: "nextrip:published-rides",
  REQUESTS: "nextrip:ride-requests",
  CONVERSATIONS: "nextrip:conversations",
  MESSAGES: "nextrip:messages",
  MAILS: "nextrip:mails",
};

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));
const nowISO = () => new Date().toISOString();
const normalizeEmail = (email = "") => String(email).trim().toLowerCase();
const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const id = (prefix) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const publicUser = ({ password, ...user }) => user;
const readUsers = () => read(KEYS.USERS, []).map(normalizeUser);
const writeUsers = (users) => write(KEYS.USERS, users.map(normalizeUser));
const readAuth = () => read(KEYS.AUTH, null);
const writeAuth = (auth) => write(KEYS.AUTH, auth);
const clearAuth = () => localStorage.removeItem(KEYS.AUTH);
const findById = (items, itemId) =>
  items.find((item) => String(item._id || item.id) === String(itemId));

function normalizeUser(user) {
  const stableId = String(user._id || user.id || id("user"));
  const role = String(user.role || user.userType || "passenger").toLowerCase();
  const userType =
    role === "admin" ? "Admin" : role === "driver" ? "Driver" : "Passenger";

  return {
    ...user,
    id: stableId,
    _id: stableId,
    email: normalizeEmail(user.email),
    role,
    userType,
    createdAt: user.createdAt || nowISO(),
    updatedAt: user.updatedAt || nowISO(),
  };
}

const seedUsers = () => [
  normalizeUser({
    id: "user_admin",
    fullName: "Admin",
    userName: "admin",
    email: "mostafizfahim@gmail.com",
    password: "4424",
    role: "admin",
  }),
  normalizeUser({
    id: "user_driver",
    fullName: "Demo Driver",
    userName: "demodriver",
    email: "driver.demo@nextrip.com",
    password: "driver123",
    role: "driver",
  }),
  normalizeUser({
    id: "user_passenger",
    fullName: "Demo Passenger",
    userName: "demopassenger",
    email: "passenger.demo@nextrip.com",
    password: "pass123",
    role: "passenger",
  }),
];

const seedRides = () => [
  {
    id: "ride_uttara_banani",
    _id: "ride_uttara_banani",
    goingfrom: "Uttara",
    goingto: "Banani",
    name: "Demo Driver",
    email: "driver.demo@nextrip.com",
    phone: "01700000000",
    status: "Active",
    passenger: 3,
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    publisherId: "user_driver",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: "ride_dhanmondi_gulshan",
    _id: "ride_dhanmondi_gulshan",
    goingfrom: "Dhanmondi",
    goingto: "Gulshan-1",
    name: "Demo Driver",
    email: "driver.demo@nextrip.com",
    phone: "01711111111",
    status: "Inactive",
    passenger: 2,
    date: new Date(Date.now() + 172800000).toISOString().slice(0, 10),
    publisherId: "user_driver",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
];

const legacyImport = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    const legacyUsers = read("users", []);
    writeUsers(legacyUsers.length ? legacyUsers : seedUsers());
  } else {
    writeUsers(readUsers());
  }

  if (!localStorage.getItem(KEYS.AUTH)) {
    const legacyUser = read("user", null);
    const legacyToken = localStorage.getItem("authToken");
    if (legacyUser && legacyToken) {
      writeAuth({ token: legacyToken, user: normalizeUser(legacyUser) });
    }
  }

  if (!localStorage.getItem(KEYS.RIDES) || read(KEYS.RIDES, []).length === 0) {
    write(KEYS.RIDES, seedRides());
  }
  if (!localStorage.getItem(KEYS.REQUESTS)) write(KEYS.REQUESTS, []);
  if (!localStorage.getItem(KEYS.CONVERSATIONS)) write(KEYS.CONVERSATIONS, []);
  if (!localStorage.getItem(KEYS.MESSAGES)) write(KEYS.MESSAGES, []);
  if (!localStorage.getItem(KEYS.MAILS)) write(KEYS.MAILS, []);
};

const getCurrentUser = () => {
  const auth = readAuth();
  if (auth?.user) return normalizeUser(auth.user);

  const legacyUser = read("user", null);
  return legacyUser ? normalizeUser(legacyUser) : null;
};

const updateCurrentUser = (user) => {
  const auth = readAuth();
  const safeUser = publicUser(normalizeUser(user));

  localStorage.setItem("user", JSON.stringify(safeUser));
  if (auth?.token) writeAuth({ token: auth.token, user: safeUser });
};

const listByKey = (key) => read(key, []);
const saveByKey = (key, value) => write(key, value);

const reject = (message) => Promise.reject({ response: { data: message } });

const localStorageAPI = {
  init: legacyImport,

  post: async (url, data = {}) => {
    await delay();
    const cleanUrl = url.replace(/^\/+/, "");

    if (cleanUrl === "user/login") {
      const users = readUsers();
      const email = normalizeEmail(data.email);
      const password = String(data.password || "");
      const user = users.find(
        (candidate) =>
          candidate.email === email && String(candidate.password) === password
      );

      if (!user) return reject("Invalid email or password");

      const token = "local-token-" + Date.now();
      const safeUser = publicUser(user);
      writeAuth({ token, user: safeUser });
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(safeUser));

      return { data: { token, user: safeUser } };
    }

    if (cleanUrl === "user/register") {
      const users = readUsers();
      const payload = {
        fullName: String(data.fullName || "").trim(),
        userName: String(data.userName || "").trim(),
        email: normalizeEmail(data.email),
        password: String(data.password || ""),
        userType: String(data.userType || "").trim(),
      };

      if (
        !payload.fullName ||
        !payload.userName ||
        !payload.email ||
        !payload.password ||
        !payload.userType
      ) {
        return reject("Please fill in all fields.");
      }
      if (!isEmail(payload.email)) return reject("Please enter a valid email address.");
      if (payload.password.length < 4) return reject("Password must be at least 4 characters.");

      const role = payload.userType.toLowerCase();
      if (!["driver", "passenger"].includes(role)) {
        return reject("Invalid user type. Choose Driver or Passenger.");
      }
      if (users.some((user) => user.email === payload.email)) {
        return reject("User already registered with this email.");
      }
      if (
        users.some(
          (user) =>
            String(user.userName).toLowerCase() === payload.userName.toLowerCase()
        )
      ) {
        return reject("Username is already taken.");
      }

      const newUser = normalizeUser({ ...payload, id: id("user"), role });
      users.push(newUser);
      writeUsers(users);

      return { data: "Registration successful! Please login." };
    }

    if (cleanUrl === "user/logout") {
      clearAuth();
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      return { data: { message: "Logged out" } };
    }

    if (cleanUrl === "publishride") {
      const user = getCurrentUser();
      if (!user) return reject("Please login before publishing a ride.");

      const rides = listByKey(KEYS.RIDES);
      const rideId = id("ride");
      const ride = {
        id: rideId,
        _id: rideId,
        goingfrom: String(data.goingfrom || "").trim(),
        goingto: String(data.goingto || "").trim(),
        name: String(data.name || user.fullName || "").trim(),
        email: normalizeEmail(data.email || user.email),
        phone: String(data.phone || "").trim(),
        status: data.status || "Inactive",
        passenger: Math.max(0, Number(data.passenger || 0)),
        date: data.date || new Date().toISOString().slice(0, 10),
        publisherId: user._id,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };

      if (!ride.goingfrom || !ride.goingto || !ride.passenger) {
        return reject("Please fill in departure, destination, and passengers.");
      }

      rides.push(ride);
      saveByKey(KEYS.RIDES, rides);
      return { data: ride };
    }

    if (cleanUrl === "requestride") {
      const user = getCurrentUser();
      if (!user) return reject("Please login before booking a ride.");

      const requests = listByKey(KEYS.REQUESTS);
      const requestId = id("request");
      const request = {
        id: requestId,
        _id: requestId,
        goingfrom: data.goingfrom,
        goingto: data.goingto,
        passenger: Number(data.passenger || 1),
        rideStatus: data.rideStatus,
        bookingDate: data.bookingDate || data.rideDate,
        requestStatus: data.requestStatus || "Pending",
        bookerEmail: normalizeEmail(data.bookerEmail || user.email),
        publisherId: data.publisherId,
        bookerId: data.bookerId || user._id,
        rideId: data.rideId,
        rejectionReason: "",
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };

      requests.push(request);
      saveByKey(KEYS.REQUESTS, requests);
      return { data: "Ride request sent successfully." };
    }

    if (cleanUrl === "conversations") {
      const conversations = listByKey(KEYS.CONVERSATIONS);
      const members = [data.senderId, data.receiverId].filter(Boolean).map(String);
      if (members.length < 2) return reject("Conversation needs two users.");

      const existing = conversations.find(
        (conversation) =>
          conversation.members.includes(members[0]) &&
          conversation.members.includes(members[1])
      );
      if (existing) return { data: existing };

      const conversationId = id("conversation");
      const conversation = {
        id: conversationId,
        _id: conversationId,
        members,
        date: nowISO(),
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      conversations.push(conversation);
      saveByKey(KEYS.CONVERSATIONS, conversations);
      return { data: conversation };
    }

    if (cleanUrl === "messages") {
      const messages = listByKey(KEYS.MESSAGES);
      const messageId = id("message");
      const message = {
        id: messageId,
        _id: messageId,
        conversationId: data.conversationId,
        sender: data.sender,
        text: String(data.text || "").trim(),
        date: nowISO(),
        createdAt: nowISO(),
      };
      if (!message.conversationId || !message.sender || !message.text) {
        return reject("Message, sender, and conversation are required.");
      }

      messages.push(message);
      saveByKey(KEYS.MESSAGES, messages);
      return { data: message };
    }

    if (cleanUrl === "user/send-mail") {
      const mails = listByKey(KEYS.MAILS);
      const mailId = id("mail");
      const mail = {
        id: mailId,
        _id: mailId,
        text: data.text,
        sender: normalizeEmail(data.sender),
        receiver: normalizeEmail(data.receiver),
        createdAt: nowISO(),
      };
      mails.push(mail);
      saveByKey(KEYS.MAILS, mails);
      return { data: "Message saved locally." };
    }

    return reject(`POST ${cleanUrl} is not implemented in local storage yet.`);
  },

  get: async (url) => {
    await delay();
    const cleanUrl = url.replace(/^\/+/, "");

    if (cleanUrl === "user/me" || cleanUrl === "user/user-dashboard") {
      const user = getCurrentUser();
      if (!user) return reject("Not authenticated");
      return { data: cleanUrl === "user/me" ? publicUser(user) : "Dashboard ready" };
    }

    if (cleanUrl === "users" || cleanUrl === "user/register") {
      return { data: readUsers().map(publicUser) };
    }

    if (cleanUrl.startsWith("user/")) {
      const userId = cleanUrl.split("/")[1];
      const user = findById(readUsers(), userId);
      if (!user) return reject("User not found");
      return { data: publicUser(user) };
    }

    if (cleanUrl === "publishride") return { data: listByKey(KEYS.RIDES) };
    if (cleanUrl === "requestride") return { data: listByKey(KEYS.REQUESTS) };

    if (cleanUrl.startsWith("conversations/")) {
      const userId = cleanUrl.split("/")[1];
      const conversations = listByKey(KEYS.CONVERSATIONS).filter((conversation) =>
        conversation.members.includes(userId)
      );
      return { data: conversations };
    }

    if (cleanUrl.startsWith("messages/")) {
      const conversationId = cleanUrl.split("/")[1];
      const messages = listByKey(KEYS.MESSAGES).filter(
        (message) => message.conversationId === conversationId
      );
      return { data: messages };
    }

    return reject(`GET ${cleanUrl} is not implemented in local storage yet.`);
  },

  patch: async (url, data = {}) => {
    await delay();
    const cleanUrl = url.replace(/^\/+/, "");

    if (cleanUrl.startsWith("publishride/")) {
      const rideId = cleanUrl.split("/")[1];
      const rides = listByKey(KEYS.RIDES);
      const ride = findById(rides, rideId);
      if (!ride) return reject("Ride not found");

      const update =
        typeof data === "string" ? { status: data } : { ...data, updatedAt: nowISO() };
      Object.assign(ride, update);
      saveByKey(KEYS.RIDES, rides);
      return { data: ride };
    }

    if (cleanUrl.startsWith("requestride/")) {
      const requestId = cleanUrl.split("/")[1];
      const requests = listByKey(KEYS.REQUESTS);
      const request = findById(requests, requestId);
      if (!request) return reject("Ride request not found");

      Object.assign(request, data, { updatedAt: nowISO() });
      saveByKey(KEYS.REQUESTS, requests);

      if (data.requestStatus === "Accepted" && request.rideId) {
        const rides = listByKey(KEYS.RIDES);
        const ride = findById(rides, request.rideId);
        if (ride) {
          ride.passenger = Math.max(
            0,
            Number(ride.passenger || 0) - Number(request.passenger || 0)
          );
          ride.updatedAt = nowISO();
          saveByKey(KEYS.RIDES, rides);
        }
      }

      return { data: request };
    }

    if (cleanUrl.startsWith("user/")) {
      const userId = cleanUrl.split("/")[1];
      const users = readUsers();
      const user = findById(users, userId);
      if (!user) return reject("User not found");

      Object.assign(user, normalizeUser({ ...user, ...data }), {
        updatedAt: nowISO(),
      });
      writeUsers(users);
      updateCurrentUser(user);
      return { data: "Profile updated successfully." };
    }

    return reject(`PATCH ${cleanUrl} is not implemented in local storage yet.`);
  },

  delete: async (url) => {
    await delay();
    const cleanUrl = url.replace(/^\/+/, "");

    if (cleanUrl.startsWith("publishride/")) {
      const rideId = cleanUrl.split("/")[1];
      const rides = listByKey(KEYS.RIDES);
      saveByKey(
        KEYS.RIDES,
        rides.filter((ride) => String(ride._id || ride.id) !== String(rideId))
      );
      return { data: "Ride removed." };
    }

    if (cleanUrl.startsWith("requestride/")) {
      const requestId = cleanUrl.split("/")[1];
      const requests = listByKey(KEYS.REQUESTS);
      saveByKey(
        KEYS.REQUESTS,
        requests.filter(
          (request) => String(request._id || request.id) !== String(requestId)
        )
      );
      return { data: "Ride request removed." };
    }

    return reject(`DELETE ${cleanUrl} is not implemented in local storage yet.`);
  },
};

localStorageAPI.init();

export default localStorageAPI;
