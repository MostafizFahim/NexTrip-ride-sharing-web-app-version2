const { z } = require("zod");
const prisma = require("../lib/prisma");
const { calculateFare, calculateRideEstimate } = require("../services/fare.service");
const {
  startMatchingForTrip,
  acceptTripRequest,
  declineTripRequest,
} = require("../services/matching.service");
const { getIo } = require("../sockets/io-store");

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

const startTripSchema = z.object({
  otp: z.string().min(4, "OTP is required"),
});

const completeTripSchema = z.object({
  actualDistanceKm: z.number().positive().optional(),
});

const ratingSchema = z.object({
  score: z.number().int().min(1).max(5),
  comment: z.string().max(300).optional(),
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

function emitTripUpdate(trip, event, message) {
  const payload = { message, trip };
  let io;

  try {
    io = getIo();
  } catch {
    return;
  }

  io.to(`trip_${trip.id}`).emit(event, payload);
  io.to(`trip_${trip.id}`).emit("trip:updated", payload);
  io.to(`user_${trip.passengerId}`).emit(event, payload);

  if (trip.driver?.userId) {
    io.to(`user_${trip.driver.userId}`).emit(event, payload);
  }
}

async function getDriverByUserId(userId) {
  return prisma.driver.findUnique({
    where: { userId },
    include: { user: true },
  });
}

async function getTripForDriver(tripId, driverUserId) {
  const driver = await getDriverByUserId(driverUserId);

  if (!driver) {
    return { error: { status: 404, message: "Driver profile not found" } };
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: tripIncludes(),
  });

  if (!trip) {
    return { error: { status: 404, message: "Trip not found" } };
  }

  if (trip.driverId !== driver.id) {
    return { error: { status: 403, message: "This trip is not assigned to you" } };
  }

  return { driver, trip };
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

    startMatchingForTrip(trip.id).catch((error) => {
      console.error("Matching failed:", error.message);
    });

    return res.status(201).json({
      message: "Trip requested. Matching started.",
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

async function acceptTrip(req, res, next) {
  try {
    const result = await acceptTripRequest({
      tripId: req.params.id,
      driverUserId: req.user.id,
    });

    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.json({
      message: "Trip accepted",
      trip: result.trip,
    });
  } catch (error) {
    next(error);
  }
}

async function declineTrip(req, res, next) {
  try {
    const result = await declineTripRequest({
      tripId: req.params.id,
      driverUserId: req.user.id,
    });

    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.json({ message: result.message });
  } catch (error) {
    next(error);
  }
}

async function markDriverArrived(req, res, next) {
  try {
    const { trip, error } = await getTripForDriver(req.params.id, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    if (trip.status !== "ACCEPTED") {
      return res.status(409).json({
        message: "Driver can mark arrived only after accepting the trip",
      });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: trip.id },
      data: { status: "DRIVER_ARRIVED" },
      include: tripIncludes(),
    });

    emitTripUpdate(updatedTrip, "trip:driver-arrived", "Driver arrived");

    return res.json({
      message: "Driver arrived",
      trip: updatedTrip,
    });
  } catch (error) {
    next(error);
  }
}

async function startTrip(req, res, next) {
  try {
    const input = startTripSchema.parse(req.body);
    const { trip, error } = await getTripForDriver(req.params.id, req.user.id);
    if (error) return res.status(error.status).json({ message: error.message });

    if (trip.status !== "DRIVER_ARRIVED") {
      return res.status(409).json({
        message: "Trip can start only after driver arrives",
      });
    }

    if (input.otp !== trip.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: trip.id },
      data: {
        status: "STARTED",
        startedAt: new Date(),
      },
      include: tripIncludes(),
    });

    emitTripUpdate(updatedTrip, "trip:started", "Trip started");

    return res.json({
      message: "Trip started",
      trip: updatedTrip,
    });
  } catch (error) {
    next(error);
  }
}

async function completeTrip(req, res, next) {
  try {
    const input = completeTripSchema.parse(req.body);
    const { driver, trip, error } = await getTripForDriver(
      req.params.id,
      req.user.id
    );
    if (error) return res.status(error.status).json({ message: error.message });

    if (trip.status !== "STARTED") {
      return res.status(409).json({
        message: "Only started trips can be completed",
      });
    }

    const finalDistanceKm = input.actualDistanceKm || trip.distanceKm;
    const finalFare = calculateFare(finalDistanceKm, trip.vehicleType);

    const updatedTrip = await prisma.$transaction(async (tx) => {
      const completedTrip = await tx.trip.update({
        where: { id: trip.id },
        data: {
          status: "COMPLETED",
          distanceKm: finalDistanceKm,
          finalFare,
          paymentStatus: "PAID",
          completedAt: new Date(),
        },
        include: tripIncludes(),
      });

      await tx.driver.update({
        where: { id: driver.id },
        data: {
          totalEarnings: {
            increment: finalFare,
          },
        },
      });

      return completedTrip;
    });

    emitTripUpdate(updatedTrip, "trip:completed", "Trip completed");

    return res.json({
      message: "Trip completed and payment marked as paid",
      trip: updatedTrip,
    });
  } catch (error) {
    next(error);
  }
}

async function cancelTrip(req, res, next) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: tripIncludes(),
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const cancellableStatuses = ["REQUESTED", "ACCEPTED", "DRIVER_ARRIVED"];
    if (!cancellableStatuses.includes(trip.status)) {
      return res.status(409).json({
        message: "Only requested, accepted, or arrived trips can be cancelled",
      });
    }

    let canCancel = false;

    if (req.user.role === "PASSENGER" && trip.passengerId === req.user.id) {
      canCancel = true;
    }

    if (req.user.role === "DRIVER") {
      const driver = await getDriverByUserId(req.user.id);
      canCancel = Boolean(driver && trip.driverId === driver.id);
    }

    if (!canCancel) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: trip.id },
      data: { status: "CANCELLED" },
      include: tripIncludes(),
    });

    emitTripUpdate(updatedTrip, "trip:cancelled", "Trip cancelled");

    return res.json({
      message: "Trip cancelled",
      trip: updatedTrip,
    });
  } catch (error) {
    next(error);
  }
}

async function rateTrip(req, res, next) {
  try {
    const input = ratingSchema.parse(req.body);
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: tripIncludes(),
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    if (trip.status !== "COMPLETED") {
      return res.status(409).json({ message: "Only completed trips can be rated" });
    }

    let rateeId = null;

    if (req.user.role === "PASSENGER" && trip.passengerId === req.user.id) {
      rateeId = trip.driver?.userId;
    }

    if (req.user.role === "DRIVER") {
      const driver = await getDriverByUserId(req.user.id);
      if (driver && trip.driverId === driver.id) {
        rateeId = trip.passengerId;
      }
    }

    if (!rateeId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const existingRating = await prisma.rating.findFirst({
      where: {
        tripId: trip.id,
        raterId: req.user.id,
      },
    });

    if (existingRating) {
      return res.status(409).json({ message: "You already rated this trip" });
    }

    const rating = await prisma.rating.create({
      data: {
        tripId: trip.id,
        raterId: req.user.id,
        rateeId,
        score: input.score,
        comment: input.comment,
      },
    });

    const average = await prisma.rating.aggregate({
      where: { rateeId },
      _avg: { score: true },
    });

    await prisma.user.update({
      where: { id: rateeId },
      data: {
        rating: Number((average._avg.score || 5).toFixed(2)),
      },
    });

    return res.status(201).json({
      message: "Rating submitted",
      rating,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  estimateTrip,
  bookTrip,
  listMyTrips,
  getTrip,
  acceptTrip,
  declineTrip,
  markDriverArrived,
  startTrip,
  completeTrip,
  cancelTrip,
  rateTrip,
};
