const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function upsertUser({ name, phone, password, role }) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { phone },
    update: {
      name,
      password: hashedPassword,
      role,
    },
    create: {
      name,
      phone,
      password: hashedPassword,
      role,
    },
  });
}

async function main() {
  const password = "123456";

  const admin = await upsertUser({
    name: "NexTrip Admin",
    phone: "01700000000",
    password,
    role: "ADMIN",
  });

  const passenger = await upsertUser({
    name: "Demo Passenger",
    phone: "01700000001",
    password,
    role: "PASSENGER",
  });

  const approvedDriverUser = await upsertUser({
    name: "Approved Driver",
    phone: "01700000002",
    password,
    role: "DRIVER",
  });

  const pendingDriverUser = await upsertUser({
    name: "Pending Driver",
    phone: "01700000003",
    password,
    role: "DRIVER",
  });

  const approvedDriver = await prisma.driver.upsert({
    where: { userId: approvedDriverUser.id },
    update: {
      vehicleType: "BIKE",
      plateNumber: "DHAKA-METRO-BA-1234",
      status: "APPROVED",
      isOnline: false,
      currentLat: 23.7806,
      currentLng: 90.4193,
    },
    create: {
      userId: approvedDriverUser.id,
      vehicleType: "BIKE",
      plateNumber: "DHAKA-METRO-BA-1234",
      status: "APPROVED",
      currentLat: 23.7806,
      currentLng: 90.4193,
    },
  });

  await prisma.driver.upsert({
    where: { userId: pendingDriverUser.id },
    update: {
      vehicleType: "CAR",
      plateNumber: "DHAKA-METRO-GA-5678",
      status: "PENDING",
      isOnline: false,
    },
    create: {
      userId: pendingDriverUser.id,
      vehicleType: "CAR",
      plateNumber: "DHAKA-METRO-GA-5678",
      status: "PENDING",
    },
  });

  const demoTrip = await prisma.trip.findFirst({
    where: {
      passengerId: passenger.id,
      pickupAddress: "Gulshan 1",
      dropoffAddress: "Dhanmondi 32",
    },
  });

  if (!demoTrip) {
    await prisma.trip.create({
      data: {
        passengerId: passenger.id,
        driverId: approvedDriver.id,
        pickupLat: 23.7806,
        pickupLng: 90.4193,
        pickupAddress: "Gulshan 1",
        dropoffLat: 23.7509,
        dropoffLng: 90.3936,
        dropoffAddress: "Dhanmondi 32",
        status: "COMPLETED",
        vehicleType: "BIKE",
        estimatedFare: 70,
        finalFare: 75,
        distanceKm: 4.5,
        paymentMethod: "CASH",
        paymentStatus: "PAID",
        acceptedAt: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
      },
    });
  }

  console.log("Seed complete");
  console.log(`Admin: ${admin.phone} / ${password}`);
  console.log(`Passenger: ${passenger.phone} / ${password}`);
  console.log(`Approved driver: ${approvedDriverUser.phone} / ${password}`);
  console.log(`Pending driver: ${pendingDriverUser.phone} / ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
