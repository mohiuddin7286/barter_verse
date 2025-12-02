import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await prisma.profile.upsert({
      where: { email: "admin@gmail.com" },
      update: {},
      create: {
        email: "admin@gmail.com",
        username: "admin",
        password: hashedPassword,
        role: "admin",
        coins: 100,
      },
    });

    console.log("Admin created successfully!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
