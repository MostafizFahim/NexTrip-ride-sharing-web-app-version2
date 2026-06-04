const bcrypt = require("bcryptjs");
const { z } = require("zod");
const prisma = require("../lib/prisma");

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  password: z.string().min(4).optional(),
});

function cleanUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        driverProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: cleanUser(user) });
  } catch (error) {
    next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    const input = updateProfileSchema.parse(req.body);
    const data = {};

    if (input.name) data.name = input.name;
    if (input.password) data.password = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      include: {
        driverProfile: true,
      },
    });

    return res.json({
      message: "Profile updated",
      user: cleanUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        rating: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMe,
  updateMe,
  getUserById,
};
