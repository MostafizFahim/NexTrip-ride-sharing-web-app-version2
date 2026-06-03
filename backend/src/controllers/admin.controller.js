const prisma = require("../lib/prisma");
const {
  removeDriverLocation,
  getAllOnlineDrivers,
} = require("../services/redis.service");

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

async function liveDrivers(req, res, next) {
  try {
    const drivers = await getAllOnlineDrivers();
    return res.json({ drivers });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listDrivers,
  approveDriver,
  suspendDriver,
  rejectDriver,
  liveDrivers,
};
