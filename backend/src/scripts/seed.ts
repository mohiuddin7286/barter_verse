import "dotenv/config";
import { prisma } from "@/prisma/client";
import bcrypt from "bcryptjs";

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...");

    // Check if admin already exists
    const existingAdmin = await prisma.profile.findUnique({
      where: { email: "admin@barterverse.com" },
    });

    if (existingAdmin) {
      console.log("✓ Admin user already exists");
      console.log("  Email: admin@barterverse.com");
      console.log("  Username: " + existingAdmin.username);
      console.log("  Role: " + existingAdmin.role);
    } else {
      // Create admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);

      const admin = await prisma.profile.create({
        data: {
          email: "admin@barterverse.com",
          username: "admin_user_" + Date.now(),
          password: hashedPassword,
          role: "admin",
          coins: 10000,
          bio: "BarterVerse Administrator",
        },
      });

      console.log("✓ Admin user created successfully");
      console.log("  Email: admin@barterverse.com");
      console.log("  Username: " + admin.username);
      console.log("  Password: admin123");
      console.log("  Initial Coins: 10000");
    }

    // Check if demo user exists
    const existingDemo = await prisma.profile.findUnique({
      where: { email: "demo@barterverse.com" },
    });

    if (existingDemo) {
      console.log("\n✓ Demo user already exists");
      console.log("  Email: demo@barterverse.com");
      console.log("  Username: " + existingDemo.username);
    } else {
      // Create a demo user
      const hashedDemoPassword = await bcrypt.hash("demo123", 10);

      const demoUser = await prisma.profile.create({
        data: {
          email: "demo@barterverse.com",
          username: "demo_user_" + Date.now(),
          password: hashedDemoPassword,
          role: "user",
          coins: 100,
          bio: "Demo User",
        },
      });

      console.log("\n✓ Demo user created successfully");
      console.log("  Email: demo@barterverse.com");
      console.log("  Username: " + demoUser.username);
      console.log("  Password: demo123");
      console.log("  Initial Coins: 100");
    }

    console.log("\n✓ Database seed completed successfully!");
  } catch (error) {
    console.error("✗ Seed failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase();
