const bcrypt = require("bcryptjs");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { signAccessToken } = require("../utils/jwt");

const validRoles = ["PASSENGER", "DRIVER", "ADMIN"];

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(6, "Phone must be at least 6 characters"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  role: z.enum(validRoles).default("PASSENGER"),
  otp: z.string().optional(),
  adminCode: z.string().optional(),
});

const loginSchema = z.object({
  phone: z.string().min(1, "Phone is required"),
  password: z.string().min(1, "Password is required"),
});

function cleanUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

async function register(req, res, next) {
  try {
    const input = registerSchema.parse(req.body);

    // Learning-only OTP. In production this would be sent by SMS and verified.
    if (input.otp && input.otp !== "1234") {
      return res.status(400).json({ message: "Invalid OTP. Use 1234 for learning." });
    }

    if (input.role === "ADMIN") {
      const adminCode = process.env.ADMIN_REGISTRATION_CODE || "admin123";
      if (input.adminCode !== adminCode) {
        return res.status(403).json({ message: "Invalid admin registration code" });
      }
    }

    const existing = await prisma.user.findUnique({
      where: { phone: input.phone },
    });

    if (existing) {
      return res.status(409).json({ message: "Phone already registered" });
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        phone: input.phone,
        password: hashedPassword,
        role: input.role,
      },
    });

    const token = signAccessToken(user);

    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: cleanUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const input = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { phone: input.phone },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid phone or password" });
    }

    const passwordOk = await bcrypt.compare(input.password, user.password);

    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid phone or password" });
    }

    const token = signAccessToken(user);

    return res.json({
      message: "Logged in successfully",
      token,
      user: cleanUser(user),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
