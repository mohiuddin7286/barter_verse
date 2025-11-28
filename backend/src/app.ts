import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import authRouter from "@/routes/auth.routes";
import adminRouter from "@/routes/admin.routes";
import listingsRouter from "@/routes/listings.routes";
import coinsRouter from "@/routes/coins.routes";
import tradesRouter from "@/routes/trades.routes";
import { errorMiddleware } from "@/middleware/error.middleware";

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "Server is running" });
  });

  // API Routes
  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/listings", listingsRouter);
  app.use("/api/coins", coinsRouter);
  app.use("/api/trades", tradesRouter);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: "Route not found",
    });
  });

  // Error handling middleware (must be last)
  app.use(errorMiddleware);

  return app;
};
