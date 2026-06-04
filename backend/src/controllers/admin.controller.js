const prisma = require("../lib/prisma");
const {
  removeDriverLocation,
  getAllOnlineDrivers,
} = require("../services/redis.service");

async function dashboard(req, res, next) {
  try {
    const [
      totalUsers,
      totalPassengers,
      totalDrivers,
      pendingDrivers,
      approvedDrivers,
      suspendedDrivers,
      onlineDrivers,
      totalTrips,
      requestedTrips,
      acceptedTrips,
      startedTrips,
      completedTrips,
      cancelledTrips,
      paidTrips,
      revenue,
      recentTrips,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "PASSENGER" } }),
      prisma.driver.count(),
      prisma.driver.count({ where: { status: "PENDING" } }),
      prisma.driver.count({ where: { status: "APPROVED" } }),
      prisma.driver.count({ where: { status: "SUSPENDED" } }),
      prisma.driver.count({ where: { isOnline: true } }),
      prisma.trip.count(),
      prisma.trip.count({ where: { status: "REQUESTED" } }),
      prisma.trip.count({ where: { status: "ACCEPTED" } }),
      prisma.trip.count({ where: { status: "STARTED" } }),
      prisma.trip.count({ where: { status: "COMPLETED" } }),
      prisma.trip.count({ where: { status: "CANCELLED" } }),
      prisma.trip.count({ where: { paymentStatus: "PAID" } }),
      prisma.trip.aggregate({
        where: { status: "COMPLETED", paymentStatus: "PAID" },
        _sum: { finalFare: true },
      }),
      prisma.trip.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          passenger: {
            select: { id: true, name: true, phone: true, rating: true },
          },
          driver: {
            include: {
              user: {
                select: { id: true, name: true, phone: true, rating: true },
              },
            },
          },
        },
      }),
    ]);

    return res.json({
      stats: {
        totalUsers,
        totalPassengers,
        totalDrivers,
        pendingDrivers,
        approvedDrivers,
        suspendedDrivers,
        onlineDrivers,
        totalTrips,
        requestedTrips,
        acceptedTrips,
        startedTrips,
        completedTrips,
        cancelledTrips,
        paidTrips,
        revenue: revenue._sum.finalFare || 0,
      },
      recentTrips,
    });
  } catch (error) {
    next(error);
  }
}

async function listDrivers(req, res, next) {
  try {
    const status = req.query.status;

    const drivers = await prisma.driver.findMany({
      where: status ? { status } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            rating: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ drivers });
  } catch (error) {
    next(error);
  }
}

async function approveDriver(req, res, next) {
  try {
    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: { status: "APPROVED" },
      include: { user: true },
    });

    return res.json({ message: "Driver approved", driver });
  } catch (error) {
    next(error);
  }
}

async function suspendDriver(req, res, next) {
  try {
    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: {
        status: "SUSPENDED",
        isOnline: false,
      },
      include: { user: true },
    });

    await removeDriverLocation(driver.id).catch(() => {});

    return res.json({ message: "Driver suspended", driver });
  } catch (error) {
    next(error);
  }
}

async function rejectDriver(req, res, next) {
  try {
    const driver = await prisma.driver.update({
      where: { id: req.params.id },
      data: {
        status: "SUSPENDED",
        isOnline: false,
      },
      include: { user: true },
    });

    await removeDriverLocation(driver.id).catch(() => {});

    return res.json({ message: "Driver rejected", driver });
  } catch (error) {
    next(error);
  }
}

async function listPassengers(req, res, next) {
  try {
    const passengers = await prisma.user.findMany({
      where: { role: "PASSENGER" },
      select: {
        id: true,
        name: true,
        phone: true,
        rating: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ passengers });
  } catch (error) {
    next(error);
  }
}

async function listTrips(req, res, next) {
  try {
    const status = req.query.status;

    const trips = await prisma.trip.findMany({
      where: status ? { status } : undefined,
      include: {
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
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ trips });
  } catch (error) {
    next(error);
  }
}

async function liveDrivers(req, res, next) {
  try {
    const drivers = await getAllOnlineDrivers();
    return res.json({ drivers });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  dashboard,
  listDrivers,
  listPassengers,
  listTrips,
  approveDriver,
  suspendDriver,
  rejectDriver,
  liveDrivers,
};
