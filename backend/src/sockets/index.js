const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { addDriverLocation } = require("../services/redis.service");
const {
  acceptTripRequest,
  declineTripRequest,
} = require("../services/matching.service");
const { setIo } = require("./io-store");

function configureSockets(server) {
  const allowedOrigins = [
    process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    process.env.MOBILE_ORIGIN || "http://localhost:8081",
  ];

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });
  setIo(io);

  // Socket auth: client connects with io(SOCKET_URL, { auth: { token } })
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Missing socket token"));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, phone: true, role: true },
      });

      if (!user) return next(new Error("Socket user not found"));

      socket.user = user;
      socket.join(`user_${user.id}`);
      next();
    } catch (error) {
      next(new Error("Invalid socket token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-trip-room", ({ tripId }) => {
      if (tripId) socket.join(`trip_${tripId}`);
    });

    socket.on("driver:update-location", async ({ lat, lng }) => {
      try {
        if (socket.user.role !== "DRIVER") return;
        if (typeof lat !== "number" || typeof lng !== "number") return;

        const driver = await prisma.driver.findUnique({
          where: { userId: socket.user.id },
          include: { user: true },
        });

        if (!driver || driver.status !== "APPROVED" || !driver.isOnline) return;

        await prisma.driver.update({
          where: { id: driver.id },
          data: { currentLat: lat, currentLng: lng },
        });

        // Redis keeps only live driver location. PostgreSQL keeps last known location.
        await addDriverLocation(driver, lat, lng);

        const activeTrip = await prisma.trip.findFirst({
          where: {
            driverId: driver.id,
            status: { in: ["ACCEPTED", "DRIVER_ARRIVED", "STARTED"] },
          },
          select: {
            id: true,
            passengerId: true,
            status: true,
          },
          orderBy: { acceptedAt: "desc" },
        });

        if (activeTrip) {
          const payload = {
            tripId: activeTrip.id,
            driverId: driver.id,
            userId: driver.userId,
            lat,
            lng,
            status: activeTrip.status,
            updatedAt: new Date().toISOString(),
          };

          io.to(`trip_${activeTrip.id}`).emit("trip:driver-location", payload);
          io.to(`user_${activeTrip.passengerId}`).emit(
            "trip:driver-location",
            payload
          );
        }

        io.emit("driver:update-location", {
          driverId: driver.id,
          userId: driver.userId,
          lat,
          lng,
        });
      } catch (error) {
        socket.emit("socket:error", { message: "Could not update location" });
      }
    });

    socket.on("trip:accept", async ({ tripId }) => {
      try {
        if (socket.user.role !== "DRIVER") return;

        const result = await acceptTripRequest({
          tripId,
          driverUserId: socket.user.id,
        });

        if (!result.ok) {
          socket.emit("socket:error", { message: result.message });
        }
      } catch (error) {
        socket.emit("socket:error", { message: "Could not accept trip" });
      }
    });

    socket.on("trip:decline", async ({ tripId }) => {
      try {
        if (socket.user.role !== "DRIVER") return;

        const result = await declineTripRequest({
          tripId,
          driverUserId: socket.user.id,
        });

        if (!result.ok) {
          socket.emit("socket:error", { message: result.message });
        }
      } catch (error) {
        socket.emit("socket:error", { message: "Could not decline trip" });
      }
    });
  });

  return io;
}

module.exports = { configureSockets };
