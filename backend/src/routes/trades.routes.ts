import { Router } from "express";
import { tradesController } from "@/controllers/trades.controller";
import { authMiddleware } from "@/middleware/auth.middleware";

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.post("/", (req, res, next) => tradesController.createTrade(req, res, next));
router.get("/", (req, res, next) => tradesController.getTrades(req, res, next));
router.get("/:id", (req, res, next) => tradesController.getTradeById(req, res, next));
router.post("/:id/confirm", (req, res, next) => tradesController.confirmTrade(req, res, next));
router.post("/:id/complete", (req, res, next) => tradesController.completeTrade(req, res, next));
router.post("/:id/cancel", (req, res, next) => tradesController.cancelTrade(req, res, next));

export default router;
