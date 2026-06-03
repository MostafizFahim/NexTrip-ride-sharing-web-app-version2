const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { addDriverLocation } = require("../services/redis.service");

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
  });

  return io;
}

module.exports = { configureSockets };
