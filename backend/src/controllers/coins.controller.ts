import { Request, Response, NextFunction } from "express";
import {
  CoinsService,
  spendCoinsSchema,
  addCoinsSchema,
} from "@/services/coins.service";
import { AppError } from "@/middleware/error.middleware";
import { ApiResponse } from "@/types/index";

const coinsService = new CoinsService();

export class CoinsController {
  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const balance = await coinsService.getBalance(userId);

      res.status(200).json({
        success: true,
        data: { balance },
      });
    } catch (error) {
      next(error);
    }
  }

  async addCoins(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const validatedData = addCoinsSchema.parse(req.body);
      const result = await coinsService.addCoins(
        userId,
        validatedData.amount,
        validatedData.reason
      );

      res.status(200).json({
        success: true,
        data: result,
        message: "Coins added successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async spendCoins(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const validatedData = spendCoinsSchema.parse(req.body);
      const result = await coinsService.spendCoins(
        userId,
        validatedData.amount,
        validatedData.reason
      );

      res.status(200).json({
        success: true,
        data: result,
        message: "Coins spent successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await coinsService.getTransactionHistory(userId, limit);

      res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  async transferCoins(req: Request, res: Response, next: NextFunction) {
    try {
      const fromUserId = req.userId;
      if (!fromUserId) {
        throw new AppError(401, "User ID is required");
      }

      const { toUserId, amount, reason } = req.body;

      if (!toUserId || !amount || !reason) {
        throw new AppError(400, "toUserId, amount, and reason are required");
      }

      const result = await coinsService.transferCoins(
        fromUserId,
        toUserId,
        amount,
        reason
      );

      res.status(200).json({
        success: true,
        data: result,
        message: "Coins transferred successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const coinsController = new CoinsController();
