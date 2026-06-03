const { z } = require("zod");
const prisma = require("../lib/prisma");
const {
  addDriverLocation,
  removeDriverLocation,
} = require("../services/redis.service");

const setupSchema = z.object({
  vehicleType: z.enum(["BIKE", "CAR"]),
  plateNumber: z.string().min(2, "Plate number is required"),
});

const toggleOnlineSchema = z.object({
  isOnline: z.boolean(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

async function setupDriver(req, res, next) {
  try {
    const input = setupSchema.parse(req.body);

    const driver = await prisma.driver.upsert({
      where: { userId: req.user.id },
      update: {
        vehicleType: input.vehicleType,
        plateNumber: input.plateNumber,
        status: "PENDING",
        isOnline: false,
      },
      create: {
        userId: req.user.id,
        vehicleType: input.vehicleType,
        plateNumber: input.plateNumber,
        status: "PENDING",
      },
      include: { user: true },
    });

    await removeDriverLocation(driver.id).catch(() => {});

    return res.status(201).json({
      message: "Driver setup submitted. Wait for admin approval.",
      driver,
    });
  } catch (error) {
    next(error);
  }
}

async function getDriverProfile(req, res, next) {
  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            role: true,
            rating: true,
            createdAt: true,
          },
        },
        trips: true,
      },
    });

    if (!driver) {
      return res.status(404).json({ message: "Driver profile not submitted yet" });
    }

    return res.json({ driver });
  } catch (error) {
    next(error);
  }
}

async function toggleOnline(req, res, next) {
  try {
    const input = toggleOnlineSchema.parse(req.body);

    const driver = await prisma.driver.findUnique({
      where: { userId: req.user.id },
      include: { user: true },
    });

    if (!driver) {
      return res.status(404).json({ message: "Submit driver setup first" });
    }

    if (driver.status !== "APPROVED") {
      return res.status(403).json({
        message: "Driver must be approved before going online",
      });
    }

    if (input.isOnline && (input.lat == null || input.lng == null)) {
      return res.status(400).json({
        message: "lat and lng are required when going online",
      });
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: driver.id },
      data: {
        isOnline: input.isOnline,
        currentLat: input.isOnline ? input.lat : driver.currentLat,
        currentLng: input.isOnline ? input.lng : driver.currentLng,
      },
      include: { user: true },
    });

    if (input.isOnline) {
      await addDriverLocation(updatedDriver, input.lat, input.lng);
    } else {
      await removeDriverLocation(updatedDriver.id);
    }

    return res.json({
      message: input.isOnline ? "Driver is online" : "Driver is offline",
      driver: updatedDriver,
    });
  } catch (error) {
    next(error);
  }
}

async function getEarnings(req, res, next) {
  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user.id },
      include: {
        trips: {
          where: { status: "COMPLETED" },
          orderBy: { completedAt: "desc" },
        },
      },
    });

    if (!driver) {
      return res.status(404).json({ message: "Driver profile not submitted yet" });
    }

    return res.json({
      totalEarnings: driver.totalEarnings,
      trips: driver.trips,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  setupDriver,
  getDriverProfile,
  toggleOnline,
  getEarnings,
};
