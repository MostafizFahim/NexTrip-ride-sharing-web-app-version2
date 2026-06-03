const Redis = require("ioredis");

const DRIVER_GEO_KEY = "drivers:geo";
const DRIVER_META_KEY = "drivers:meta";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  // Keep it beginner-friendly: if Redis is down, commands fail clearly.
  maxRetriesPerRequest: 2,
});

redis.on("error", (error) => {
  console.warn(`Redis connection error: ${error.message}`);
});

async function addDriverLocation(driver, lat, lng) {
  const driverId = driver.id;

  // Redis GEOADD expects longitude first, then latitude.
  await redis.geoadd(DRIVER_GEO_KEY, lng, lat, driverId);

  await redis.hset(
    DRIVER_META_KEY,
    driverId,
    JSON.stringify({
      driverId,
      userId: driver.userId,
      name: driver.user?.name,
      phone: driver.user?.phone,
      vehicleType: driver.vehicleType,
      plateNumber: driver.plateNumber,
      lat,
      lng,
      updatedAt: new Date().toISOString(),
    })
  );
}

async function removeDriverLocation(driverId) {
  await redis.zrem(DRIVER_GEO_KEY, driverId);
  await redis.hdel(DRIVER_META_KEY, driverId);
}

async function getNearbyDrivers(lat, lng, radiusKm = 2, limit = 10) {
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
