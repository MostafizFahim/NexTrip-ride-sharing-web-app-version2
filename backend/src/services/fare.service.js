const FARE_RULES = {
  BIKE: {
    baseFare: 20,
    perKm: 12,
    minimumFare: 30,
  },
  CAR: {
    baseFare: 50,
    perKm: 25,
    minimumFare: 80,
  },
};

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function calculateDistanceKm(startLat, startLng, endLat, endLng) {
  const earthRadiusKm = 6371;
  const latDistance = toRadians(endLat - startLat);
  const lngDistance = toRadians(endLng - startLng);

  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(toRadians(startLat)) *
      Math.cos(toRadians(endLat)) *
      Math.sin(lngDistance / 2) *
      Math.sin(lngDistance / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((earthRadiusKm * c).toFixed(2));
}

function calculateFare(distanceKm, vehicleType) {
  const rules = FARE_RULES[vehicleType] || FARE_RULES.CAR;
  const rawFare = rules.baseFare + distanceKm * rules.perKm;
  return Math.max(rules.minimumFare, Math.round(rawFare));
}

function calculateRideEstimate({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  vehicleType,
}) {
  const distanceKm = calculateDistanceKm(
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng
  );

  return {
    distanceKm,
    estimatedFare: calculateFare(distanceKm, vehicleType),
    currency: "BDT",
    vehicleType,
  };
}

module.exports = {
  FARE_RULES,
  calculateDistanceKm,
  calculateFare,
  calculateRideEstimate,
};
