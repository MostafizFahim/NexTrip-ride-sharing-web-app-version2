process.env.REDIS_MODE = process.env.REDIS_MODE || "memory";
process.env.MATCH_REQUEST_TIMEOUT_MS =
  process.env.MATCH_REQUEST_TIMEOUT_MS || "8000";

const http = require("http");
const app = require("../src/app");
const prisma = require("../src/lib/prisma");
const { configureSockets } = require("../src/sockets");
const { io: socketClient } = require("socket.io-client");

const stamp = Date.now().toString().slice(-8);
const users = {
  admin: {
    name: `QA Admin ${stamp}`,
    phone: `880990${stamp}0`,
    password: "123456",
    role: "ADMIN",
    adminCode: process.env.ADMIN_REGISTRATION_CODE || "admin123",
  },
  passenger: {
    name: `QA Passenger ${stamp}`,
    phone: `880990${stamp}1`,
    password: "123456",
    role: "PASSENGER",
  },
  driver: {
    name: `QA Driver ${stamp}`,
    phone: `880990${stamp}2`,
    password: "123456",
    role: "DRIVER",
  },
};

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function waitFor(socket, event, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, onEvent);
      reject(new Error(`Timed out waiting for ${event}`));
    }, timeoutMs);

    function onEvent(payload) {
      clearTimeout(timer);
      socket.off(event, onEvent);
      resolve(payload);
    }

    socket.on(event, onEvent);
  });
}

function connectSocket(url, token, label) {
  return new Promise((resolve, reject) => {
    const socket = socketClient(url, {
      auth: { token },
      transports: ["websocket"],
      reconnection: false,
    });

    const timer = setTimeout(
      () => reject(new Error(`${label} socket connect timeout`)),
      8000
    );

    socket.on("connect", () => {
      clearTimeout(timer);
      resolve(socket);
    });

    socket.on("connect_error", (error) => {
      clearTimeout(timer);
      reject(new Error(`${label} socket connect failed: ${error.message}`));
    });
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runSmokeFlow() {
  const server = http.createServer(app);
  configureSockets(server);
  const port = await listen(server);
  const baseUrl = `http://127.0.0.1:${port}`;
  const apiBase = `${baseUrl}/api`;

  let passengerSocket;
  let driverSocket;

  async function api(method, path, body, token) {
    const response = await fetch(`${apiBase}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body == null ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(
        `${method} ${path} failed ${response.status}: ${
          data?.message || text
        }`
      );
    }

    return data;
  }

  try {
    const health = await fetch(`${baseUrl}/health`).then((res) => res.json());
    assert(health.ok === true, "Health check did not return ok");

    const adminAuth = await api("POST", "/auth/register", users.admin);
    const passengerAuth = await api(
      "POST",
      "/auth/register",
      users.passenger
    );
    const driverAuth = await api("POST", "/auth/register", users.driver);

    const driverSetup = await api(
      "POST",
      "/driver/setup",
      { vehicleType: "BIKE", plateNumber: `QA-${stamp}` },
      driverAuth.token
    );
    assert(
      driverSetup.driver.status === "PENDING",
      "Driver setup should start as PENDING"
    );

    const approved = await api(
      "PUT",
      `/admin/drivers/${driverSetup.driver.id}/approve`,
      {},
      adminAuth.token
    );
    assert(approved.driver.status === "APPROVED", "Admin approval failed");

    passengerSocket = await connectSocket(
      baseUrl,
      passengerAuth.token,
      "passenger"
    );
    driverSocket = await connectSocket(baseUrl, driverAuth.token, "driver");

    const driverOnline = await api(
      "POST",
      "/driver/toggle-online",
      { isOnline: true, lat: 23.7806, lng: 90.4074 },
      driverAuth.token
    );
    assert(driverOnline.driver.isOnline === true, "Driver did not go online");

    // Socket.IO path used by the mobile driver app for live location.
    driverSocket.emit("driver:update-location", {
      lat: 23.7807,
      lng: 90.4075,
    });

    const estimate = await api(
      "POST",
      "/trips/estimate",
      {
        pickupLat: 23.7806,
        pickupLng: 90.4074,
        dropoffLat: 23.7937,
        dropoffLng: 90.4066,
        vehicleType: "BIKE",
      },
      passengerAuth.token
    );
    assert(
      estimate.estimate.estimatedFare >= 30,
      "Fare estimate was not calculated"
    );

    const requestWait = waitFor(driverSocket, "trip:request");
    const matchingWait = waitFor(passengerSocket, "trip:matching-driver");
    const booked = await api(
      "POST",
      "/trips/book",
      {
        pickupLat: 23.7806,
        pickupLng: 90.4074,
        pickupAddress: "QA Pickup",
        dropoffLat: 23.7937,
        dropoffLng: 90.4066,
        dropoffAddress: "QA Dropoff",
        vehicleType: "BIKE",
        paymentMethod: "CASH",
      },
      passengerAuth.token
    );
    assert(booked.trip.status === "REQUESTED", "Trip should be REQUESTED");

    const tripRequest = await requestWait;
    const matching = await matchingWait;
    assert(
      tripRequest.tripId === booked.trip.id,
      "Driver received wrong trip request"
    );
    assert(
      matching.tripId === booked.trip.id,
      "Passenger received wrong matching event"
    );

    const passengerAcceptedWait = waitFor(passengerSocket, "trip:accepted");
    const driverAcceptedWait = waitFor(driverSocket, "trip:accepted");
    driverSocket.emit("trip:accept", { tripId: booked.trip.id });
    const passengerAccepted = await passengerAcceptedWait;
    const driverAccepted = await driverAcceptedWait;
    assert(
      passengerAccepted.trip.status === "ACCEPTED",
      "Passenger did not receive accepted trip"
    );
    assert(
      driverAccepted.trip.status === "ACCEPTED",
      "Driver did not receive accepted trip"
    );

    const locationWait = waitFor(passengerSocket, "trip:driver-location");
    driverSocket.emit("driver:update-location", { lat: 23.785, lng: 90.409 });
    const liveLocation = await locationWait;
    assert(
      liveLocation.tripId === booked.trip.id,
      "Passenger received wrong driver location"
    );

    const arrivedWait = waitFor(passengerSocket, "trip:driver-arrived");
    const arrived = await api(
      "POST",
      `/trips/${booked.trip.id}/arrived`,
      {},
      driverAuth.token
    );
    await arrivedWait;
    assert(arrived.trip.status === "DRIVER_ARRIVED", "Arrived status failed");

    const startedWait = waitFor(passengerSocket, "trip:started");
    const started = await api(
      "POST",
      `/trips/${booked.trip.id}/start`,
      { otp: "1234" },
      driverAuth.token
    );
    await startedWait;
    assert(started.trip.status === "STARTED", "Trip did not start");

    const completedWait = waitFor(passengerSocket, "trip:completed");
    const completed = await api(
      "POST",
      `/trips/${booked.trip.id}/complete`,
      { actualDistanceKm: 2.4 },
      driverAuth.token
    );
    await completedWait;
    assert(completed.trip.status === "COMPLETED", "Trip did not complete");
    assert(
      completed.trip.paymentStatus === "PAID",
      "Payment was not marked paid"
    );
    assert(completed.trip.finalFare > 0, "Final fare was not set");

    const rating = await api(
      "POST",
      `/trips/${booked.trip.id}/rate`,
      { score: 5, comment: "QA flow passed" },
      passengerAuth.token
    );
    assert(rating.rating.score === 5, "Rating was not saved");

    const dashboard = await api("GET", "/admin/dashboard", null, adminAuth.token);
    assert(
      dashboard.stats.completedTrips >= 1,
      "Admin dashboard completed trips did not update"
    );
    assert(
      dashboard.stats.revenue >= completed.trip.finalFare,
      "Admin dashboard revenue did not update"
    );

    const trips = await api(
      "GET",
      "/admin/trips?status=COMPLETED",
      null,
      adminAuth.token
    );
    assert(
      trips.trips.some((trip) => trip.id === booked.trip.id),
      "Completed trip missing from admin trips"
    );

    const liveDrivers = await api(
      "GET",
      "/admin/live-drivers",
      null,
      adminAuth.token
    );
    assert(
      liveDrivers.drivers.some(
        (driver) => driver.driverId === driverSetup.driver.id
      ),
      "Online driver missing from live drivers"
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          tripId: booked.trip.id,
          finalStatus: completed.trip.status,
          finalFare: completed.trip.finalFare,
          adminCompletedTrips: dashboard.stats.completedTrips,
          adminRevenue: dashboard.stats.revenue,
          liveDrivers: liveDrivers.drivers.length,
          testPhones: {
            admin: users.admin.phone,
            passenger: users.passenger.phone,
            driver: users.driver.phone,
          },
        },
        null,
        2
      )
    );
  } finally {
    if (passengerSocket) passengerSocket.disconnect();
    if (driverSocket) driverSocket.disconnect();
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  }
}

runSmokeFlow().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
