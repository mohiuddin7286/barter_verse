import { Router } from "express";
import { coinsController } from "@/controllers/coins.controller";
import { authMiddleware } from "@/middleware/auth.middleware";

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.get("/balance", (req, res, next) => coinsController.getBalance(req, res, next));
router.post("/add", (req, res, next) => coinsController.addCoins(req, res, next));
router.post("/spend", (req, res, next) => coinsController.spendCoins(req, res, next));
router.get("/history", (req, res, next) => coinsController.getTransactionHistory(req, res, next));
router.post("/transfer", (req, res, next) => coinsController.transferCoins(req, res, next));

export default router;
