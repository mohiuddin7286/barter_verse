import { Request, Response, NextFunction } from "express";
import {
  TradesService,
  createTradeSchema,
  confirmTradeSchema,
} from "@/services/trades.service";
import { AppError } from "@/middleware/error.middleware";
import { ApiResponse } from "@/types/index";

const tradesService = new TradesService();

export class TradesController {
  async createTrade(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const validatedData = createTradeSchema.parse(req.body);
      const trade = await tradesService.createTrade(userId, validatedData);

      res.status(201).json({
        success: true,
        data: trade,
        message: "Trade created successfully",
      } as ApiResponse<typeof trade>);
    } catch (error) {
      next(error);
    }
  }

  async getTrades(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const type = (req.query.type as "incoming" | "outgoing") || "incoming";
      const trades = await tradesService.getTrades(userId, type);

      res.status(200).json({
        success: true,
        data: trades,
      } as ApiResponse<typeof trades>);
    } catch (error) {
      next(error);
    }
  }

  async getTradeById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const trade = await tradesService.getTradeById(id);

      res.status(200).json({
        success: true,
        data: trade,
      } as ApiResponse<typeof trade>);
    } catch (error) {
      next(error);
    }
  }

  async confirmTrade(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const { id } = req.params;
      const validatedData = confirmTradeSchema.parse(req.body);
      const trade = await tradesService.confirmTrade(
        id,
        userId,
        validatedData.accepted
      );

      res.status(200).json({
        success: true,
        data: trade,
        message: `Trade ${validatedData.accepted ? "accepted" : "rejected"} successfully`,
      } as ApiResponse<typeof trade>);
    } catch (error) {
      next(error);
    }
  }

  async completeTrade(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const { id } = req.params;
      const trade = await tradesService.completeTrade(id, userId);

      res.status(200).json({
        success: true,
        data: trade,
        message: "Trade completed successfully",
      } as ApiResponse<typeof trade>);
    } catch (error) {
      next(error);
    }
  }

  async cancelTrade(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError(401, "User ID is required");
      }

      const { id } = req.params;
      await tradesService.cancelTrade(id, userId);

      res.status(200).json({
        success: true,
        message: "Trade cancelled successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const tradesController = new TradesController();
