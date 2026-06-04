const DRIVER_GEO_KEY = "drivers:geo";
const DRIVER_META_KEY = "drivers:meta";

const useMemoryRedis =
  process.env.REDIS_MODE === "memory" || process.env.REDIS_URL === "memory";

const memoryDrivers = new Map();
let redis = null;

if (!useMemoryRedis) {
  const Redis = require("ioredis");

  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 2,
  });

  let hasLoggedRedisError = false;

  redis.on("error", (error) => {
    if (hasLoggedRedisError) return;
    hasLoggedRedisError = true;
    console.warn(
      `Redis connection error: ${error.message}. Set REDIS_MODE=memory for local learning without Redis.`
    );
  });
} else {
  console.log("Redis service running in memory mode.");
}

function toDriverMeta(driver, lat, lng) {
  return {
    driverId: driver.id,
    userId: driver.userId,
    name: driver.user?.name,
    phone: driver.user?.phone,
    vehicleType: driver.vehicleType,
    plateNumber: driver.plateNumber,
    lat,
    lng,
    updatedAt: new Date().toISOString(),
  };
}

function getDistanceKm(startLat, startLng, endLat, endLng) {
  const earthRadiusKm = 6371;
  const dLat = ((endLat - startLat) * Math.PI) / 180;
  const dLng = ((endLng - startLng) * Math.PI) / 180;
  const lat1 = (startLat * Math.PI) / 180;
  const lat2 = (endLat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) *
      Math.sin(dLng / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function addDriverLocation(driver, lat, lng) {
  const driverId = driver.id;
  const meta = toDriverMeta(driver, lat, lng);

  if (useMemoryRedis) {
    memoryDrivers.set(driverId, meta);
    return;
  }

  // Redis GEOADD expects longitude first, then latitude.
  await redis.geoadd(DRIVER_GEO_KEY, lng, lat, driverId);

  await redis.hset(DRIVER_META_KEY, driverId, JSON.stringify(meta));
}

async function removeDriverLocation(driverId) {
  if (useMemoryRedis) {
    memoryDrivers.delete(driverId);
    return;
  }

  await redis.zrem(DRIVER_GEO_KEY, driverId);
  await redis.hdel(DRIVER_META_KEY, driverId);
}

async function getNearbyDrivers(lat, lng, radiusKm = 2, limit = 10) {
  if (useMemoryRedis) {
    return Array.from(memoryDrivers.values())
      .map((driver) => ({
        driverId: driver.driverId,
        distanceKm: getDistanceKm(lat, lng, driver.lat, driver.lng),
      }))
      .filter((driver) => driver.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
  }

  // Redis GEORADIUS is simple for learning. Later you can switch to GEOSEARCH.
  const rows = await redis.georadius(
    DRIVER_GEO_KEY,
    lng,
    lat,
    radiusKm,
    "km",
    "WITHDIST",
    "ASC",
    "COUNT",
    limit
  );

  return rows.map(([driverId, distanceKm]) => ({
    driverId,
    distanceKm: Number(distanceKm),
  }));
}

async function getAllOnlineDrivers() {
  if (useMemoryRedis) {
    return Array.from(memoryDrivers.values());
  }

  const ids = await redis.zrange(DRIVER_GEO_KEY, 0, -1);
  if (ids.length === 0) return [];

  const metas = await redis.hmget(DRIVER_META_KEY, ids);

  return metas
    .filter(Boolean)
    .map((value) => JSON.parse(value));
}

module.exports = {
  redis,
  addDriverLocation,
  removeDriverLocation,
  getNearbyDrivers,
  getAllOnlineDrivers,
};
