const { z } = require("zod");
const prisma = require("../lib/prisma");
const { calculateRideEstimate } = require("../services/fare.service");

const coordinate = z.number().finite();

const estimateSchema = z.object({
  pickupLat: coordinate,
  pickupLng: coordinate,
  dropoffLat: coordinate,
  dropoffLng: coordinate,
  vehicleType: z.enum(["BIKE", "CAR"]).default("CAR"),
});

const bookTripSchema = estimateSchema.extend({
  pickupAddress: z.string().min(2, "Pickup address is required"),
  dropoffAddress: z.string().min(2, "Dropoff address is required"),
  paymentMethod: z.enum(["CASH", "WALLET"]).default("CASH"),
});

function tripIncludes() {
  return {
    passenger: {
      select: {
        id: true,
        name: true,
        phone: true,
        rating: true,
      },
    },
    driver: {
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
    },
  };
}

async function estimateTrip(req, res, next) {
  try {
    const input = estimateSchema.parse(req.body);
    const estimate = calculateRideEstimate(input);

    return res.json({ estimate });
  } catch (error) {
    next(error);
  }
}

async function bookTrip(req, res, next) {
  try {
    const input = bookTripSchema.parse(req.body);
    const estimate = calculateRideEstimate(input);

    const trip = await prisma.trip.create({
      data: {
        passengerId: req.user.id,
        pickupLat: input.pickupLat,
        pickupLng: input.pickupLng,
        pickupAddress: input.pickupAddress,
        dropoffLat: input.dropoffLat,
        dropoffLng: input.dropoffLng,
        dropoffAddress: input.dropoffAddress,
        vehicleType: input.vehicleType,
        estimatedFare: estimate.estimatedFare,
        distanceKm: estimate.distanceKm,
        paymentMethod: input.paymentMethod,
        status: "REQUESTED",
      },
      include: tripIncludes(),
    });

    return res.status(201).json({
      message: "Trip requested. Matching will be added in Phase 4.",
      trip,
    });
  } catch (error) {
    next(error);
  }
}

async function listMyTrips(req, res, next) {
  try {
    const where = {};

    if (req.user.role === "PASSENGER") {
      where.passengerId = req.user.id;
    }

    if (req.user.role === "DRIVER") {
      const driver = await prisma.driver.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      where.driverId = driver?.id || "__no_driver_profile__";
    }

    const trips = await prisma.trip.findMany({
      where,
      include: tripIncludes(),
      orderBy: { createdAt: "desc" },
    });

    return res.json({ trips });
  } catch (error) {
    next(error);
  }
}

async function getTrip(req, res, next) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: tripIncludes(),
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (req.user.role === "ADMIN") {
      return res.json({ trip });
    }

    if (req.user.role === "PASSENGER" && trip.passengerId === req.user.id) {
      return res.json({ trip });
    }

    if (req.user.role === "DRIVER") {
      const driver = await prisma.driver.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (driver && trip.driverId === driver.id) {
        return res.json({ trip });
      }
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  estimateTrip,
  bookTrip,
  listMyTrips,
  getTrip,
};
