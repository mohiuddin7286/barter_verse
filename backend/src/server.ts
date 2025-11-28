import "dotenv/config";
import { createApp } from "@/app";
import { prisma } from "@/prisma/client";

const PORT = process.env.PORT || 3000;

const app = createApp();

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✓ Database connected");

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("✗ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n✓ Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
