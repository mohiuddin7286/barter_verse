import { Router } from "express";
import { adminController } from "@/controllers/admin.controller";
import { adminMiddleware } from "@/middleware/auth.middleware";

const router = Router();

// All admin routes require admin authentication
router.use(adminMiddleware);

// User Management
router.get("/users", (req, res, next) =>
  adminController.getAllUsers(req, res, next)
);
router.get("/users/:userId", (req, res, next) =>
  adminController.getUserById(req, res, next)
);
router.put("/users/:userId/role", (req, res, next) =>
  adminController.updateUserRole(req, res, next)
);

// Coin Management
router.post("/coins/add", (req, res, next) =>
  adminController.addCoins(req, res, next)
);
router.post("/coins/remove", (req, res, next) =>
  adminController.removeCoins(req, res, next)
);

// Trade Management
router.get("/trades", (req, res, next) =>
  adminController.getAllTrades(req, res, next)
);
router.get("/trades/:tradeId", (req, res, next) =>
  adminController.getTradeById(req, res, next)
);
router.put("/trades/:tradeId/accept", (req, res, next) =>
  adminController.acceptTrade(req, res, next)
);
router.put("/trades/:tradeId/reject", (req, res, next) =>
  adminController.rejectTrade(req, res, next)
);
router.put("/trades/:tradeId/complete", (req, res, next) =>
  adminController.completeTrade(req, res, next)
);
router.put("/trades/:tradeId/cancel", (req, res, next) =>
  adminController.cancelTrade(req, res, next)
);

// Admin Stats
router.get("/stats/overview", (req, res, next) =>
  adminController.getAdminStats(req, res, next)
);

export default router;
