import { prisma } from "../prisma/client";
import { AppError } from "../middleware/error.middleware";
import bcrypt from "bcryptjs";

export const authService = {
  signup: async (email: string, password: string, username: string) => {
    // Check if user already exists
    const existingUser = await prisma.profile.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(409, "User with this email already exists");
    }

    // Check if username is taken
    const existingUsername = await prisma.profile.findUnique({
      where: { username },
    });

    if (existingUsername) {
      throw new AppError(409, "Username is already taken");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.profile.create({
      data: {
        email,
        username,
        password: hashedPassword,
        coins: 100, // Starting coins
      },
    });

    // Generate token (simple version - in production use JWT)
    const token = Buffer.from(`${user.id}:${email}`).toString("base64");

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        coins: user.coins,
        rating: user.rating,
      },
      token,
    };
  },

  signin: async (email: string, password: string) => {
    // Find user by email
    const user = await prisma.profile.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password");
    }

    // Generate token
    const token = Buffer.from(`${user.id}:${email}`).toString("base64");

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        coins: user.coins,
        rating: user.rating,
      },
      token,
    };
  },

  verifyToken: (token: string) => {
    try {
      // Decode the simple base64 token
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const [userId] = decoded.split(":");
      return userId;
    } catch {
      throw new AppError(401, "Invalid token");
    }
  },
};
