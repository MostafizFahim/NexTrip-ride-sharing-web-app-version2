const prisma = require("../lib/prisma");
const { getNearbyDrivers } = require("./redis.service");
const { getIo } = require("../sockets/io-store");

const SEARCH_RADIUS_KM = Number(process.env.MATCH_RADIUS_KM || 5);
const MAX_ATTEMPTS = Number(process.env.MATCH_MAX_ATTEMPTS || 3);
const REQUEST_TIMEOUT_MS = Number(
  process.env.MATCH_REQUEST_TIMEOUT_MS || 30000
);

// Learning-only state. In production this belongs in Redis/queues, not memory.
const pendingRequests = new Map();

function emitToPassenger(passengerId, event, payload) {
  getIo().to(`user_${passengerId}`).emit(event, payload);
}

function emitToDriver(userId, event, payload) {
  getIo().to(`user_${userId}`).emit(event, payload);
}

function emitToTrip(tripId, event, payload) {
  getIo().to(`trip_${tripId}`).emit(event, payload);
}

async function getTripForMatching(tripId) {
  return prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      passenger: {
        select: {
          id: true,
          name: true,
          phone: true,
          rating: true,
        },
      },
    },
  });
}

async function findCandidateDrivers(trip) {
  const nearby = await getNearbyDrivers(
    trip.pickupLat,
    trip.pickupLng,
    SEARCH_RADIUS_KM,
    10
  );

  if (nearby.length === 0) return [];

  const nearbyById = new Map(
    nearby.map((row) => [row.driverId, row.distanceKm])
  );

  const drivers = await prisma.driver.findMany({
    where: {
      id: { in: nearby.map((row) => row.driverId) },
      status: "APPROVED",
      isOnline: true,
      vehicleType: trip.vehicleType,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          rating: true,
        },
      },
    },
  });

  return drivers
    .map((driver) => ({
      ...driver,
      pickupDistanceKm: nearbyById.get(driver.id),
    }))
    .sort((a, b) => a.pickupDistanceKm - b.pickupDistanceKm)
    .slice(0, MAX_ATTEMPTS);
}

async function cancelForNoDrivers(tripId) {
  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: { status: "CANCELLED" },
    include: {
      passenger: true,
      driver: { include: { user: true } },
    },
  });

  const payload = {
    message: "No drivers available",
    trip,
  };

  emitToPassenger(trip.passengerId, "trip:no-drivers-available", payload);
  emitToTrip(trip.id, "trip:updated", payload);
  pendingRequests.delete(tripId);

  return trip;
}

async function offerNextDriver(tripId) {
  const pending = pendingRequests.get(tripId);
  if (!pending) return;

  const trip = await getTripForMatching(tripId);
  if (!trip || trip.status !== "REQUESTED" || trip.driverId) {
    pendingRequests.delete(tripId);
    return;
  }

  if (pending.nextIndex >= pending.candidates.length) {
    await cancelForNoDrivers(tripId);
    return;
  }

  const driver = pending.candidates[pending.nextIndex];
  pending.nextIndex += 1;
  pending.activeDriverId = driver.id;

  const requestPayload = {
    tripId: trip.id,
    passenger: trip.passenger,
    pickup: {
      lat: trip.pickupLat,
      lng: trip.pickupLng,
      address: trip.pickupAddress,
    },
    dropoff: {
      lat: trip.dropoffLat,
      lng: trip.dropoffLng,
      address: trip.dropoffAddress,
    },
    vehicleType: trip.vehicleType,
    estimatedFare: trip.estimatedFare,
    distanceKm: trip.distanceKm,
    pickupDistanceKm: driver.pickupDistanceKm,
    expiresInMs: REQUEST_TIMEOUT_MS,
  };

  emitToDriver(driver.userId, "trip:request", requestPayload);
  emitToPassenger(trip.passengerId, "trip:matching-driver", {
    tripId: trip.id,
    driverId: driver.id,
    driverName: driver.user.name,
    pickupDistanceKm: driver.pickupDistanceKm,
  });

  // If the driver does not answer in time, try the next nearest driver.
  pending.timer = setTimeout(() => {
    handleTripRequestTimeout(tripId, driver.id).catch((error) => {
      console.error("Trip request timeout failed:", error.message);
    });
  }, REQUEST_TIMEOUT_MS);
}

async function handleTripRequestTimeout(tripId, driverId) {
  const pending = pendingRequests.get(tripId);
  if (!pending || pending.activeDriverId !== driverId) return;

  emitToDriver(pending.candidates[pending.nextIndex - 1].userId, "trip:request-expired", {
    tripId,
  });

  pending.activeDriverId = null;
  pending.timer = null;
  await offerNextDriver(tripId);
}

async function startMatchingForTrip(tripId) {
  const trip = await getTripForMatching(tripId);

  if (!trip || trip.status !== "REQUESTED") {
    return null;
  }

  const candidates = await findCandidateDrivers(trip);

  pendingRequests.set(tripId, {
    tripId,
    candidates,
    nextIndex: 0,
    activeDriverId: null,
    timer: null,
  });

  await offerNextDriver(tripId);

  return {
    candidatesFound: candidates.length,
    timeoutMs: REQUEST_TIMEOUT_MS,
  };
}

async function acceptTripRequest({ tripId, driverUserId }) {
  const driver = await prisma.driver.findUnique({
    where: { userId: driverUserId },
    include: { user: true },
  });

  if (!driver) {
    return { ok: false, status: 404, message: "Driver profile not found" };
  }

  const pending = pendingRequests.get(tripId);
  if (!pending || pending.activeDriverId !== driver.id) {
    return { ok: false, status: 409, message: "This trip is not assigned to you" };
  }

  if (pending.timer) clearTimeout(pending.timer);

  const updated = await prisma.trip.updateMany({
    where: {
      id: tripId,
      status: "REQUESTED",
      driverId: null,
    },
    data: {
      status: "ACCEPTED",
      driverId: driver.id,
      acceptedAt: new Date(),
    },
  });

  if (updated.count === 0) {
    pendingRequests.delete(tripId);
    return { ok: false, status: 409, message: "Trip is no longer available" };
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      passenger: true,
      driver: { include: { user: true } },
    },
  });

  pendingRequests.delete(tripId);

  const payload = {
    message: "Trip accepted",
    trip,
  };

  emitToPassenger(trip.passengerId, "trip:accepted", payload);
  emitToDriver(driver.userId, "trip:accepted", payload);
  emitToTrip(trip.id, "trip:updated", payload);

  return { ok: true, status: 200, trip };
}

async function declineTripRequest({ tripId, driverUserId }) {
  const driver = await prisma.driver.findUnique({
    where: { userId: driverUserId },
    select: { id: true, userId: true },
  });

  if (!driver) {
    return { ok: false, status: 404, message: "Driver profile not found" };
  }

  const pending = pendingRequests.get(tripId);
  if (!pending || pending.activeDriverId !== driver.id) {
    return { ok: false, status: 409, message: "This trip is not assigned to you" };
  }

  if (pending.timer) clearTimeout(pending.timer);

  emitToDriver(driver.userId, "trip:declined", { tripId });

  pending.activeDriverId = null;
  pending.timer = null;
  await offerNextDriver(tripId);

  return { ok: true, status: 200, message: "Trip declined" };
}

module.exports = {
  startMatchingForTrip,
  acceptTripRequest,
  declineTripRequest,
};
