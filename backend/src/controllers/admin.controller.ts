import { Request, Response, NextFunction } from "express";
import { adminService } from "@/services/admin.service";
import { AppError } from "@/middleware/error.middleware";
import { ApiResponse } from "@/types/index";

export class AdminController {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users,
      } as ApiResponse<typeof users>);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const user = await adminService.getUserById(userId);
      res.status(200).json({
        success: true,
        data: user,
      } as ApiResponse<typeof user>);
    } catch (error) {
      next(error);
    }
  }

  async addCoins(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, amount, reason } = req.body;

      if (!userId || amount === undefined) {
        throw new AppError(400, "User ID and amount are required");
      }

      if (amount <= 0) {
        throw new AppError(400, "Amount must be greater than 0");
      }

      const result = await adminService.addCoinsToUser(
        userId,
        amount,
        reason || "Admin added coins"
      );

      res.status(200).json({
        success: true,
        data: result,
        message: `Added ${amount} coins to user`,
      } as ApiResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async removeCoins(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, amount, reason } = req.body;

      if (!userId || amount === undefined) {
        throw new AppError(400, "User ID and amount are required");
      }

      if (amount <= 0) {
        throw new AppError(400, "Amount must be greater than 0");
      }

      const result = await adminService.removeCoinsFromUser(
        userId,
        amount,
        reason || "Admin removed coins"
      );

      res.status(200).json({
        success: true,
        data: result,
        message: `Removed ${amount} coins from user`,
      } as ApiResponse<typeof result>);
    } catch (error) {
      next(error);
    }
  }

  async getAllTrades(req: Request, res: Response, next: NextFunction) {
    try {
      const status = (req.query.status as string) || undefined;
      const trades = await adminService.getAllTrades(status);

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
      const { tradeId } = req.params;
      const trade = await adminService.getTradeById(tradeId);

      res.status(200).json({
        success: true,
        data: trade,
      } as ApiResponse<typeof trade>);
    } catch (error) {
      next(error);
    }
  }

  async acceptTrade(req: Request, res: Response, next: NextFunction) {
    try {
      const { tradeId } = req.params;
      const trade = await adminService.acceptTrade(tradeId);

      res.status(200).json({
        success: true,
        data: trade,
        message: "Trade accepted successfully",
      } as ApiResponse<typeof trade>);
    } catch (error) {
      next(error);
    }
  }

  async rejectTrade(req: Request, res: Response, next: NextFunction) {
    try {
      const { tradeId } = req.params;
      const { reason } = req.body;
      const trade = await adminService.rejectTrade(tradeId, reason);

      res.status(200).json({
        success: true,
        data: trade,
        message: "Trade rejected successfully",
      } as ApiResponse<typeof trade>);
    } catch (error) {
      next(error);
    }
  }

  async completeTrade(req: Request, res: Response, next: NextFunction) {
    try {
      const { tradeId } = req.params;
      const trade = await adminService.completeTrade(tradeId);

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
      const { tradeId } = req.params;
      const { reason } = req.body;
      await adminService.cancelTrade(tradeId, reason);

      res.status(200).json({
        success: true,
        message: "Trade cancelled successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!["user", "admin"].includes(role)) {
        throw new AppError(400, "Invalid role. Must be 'user' or 'admin'");
      }

      const user = await adminService.updateUserRole(userId, role);

      res.status(200).json({
        success: true,
        data: user,
        message: `User role updated to ${role}`,
      } as ApiResponse<typeof user>);
    } catch (error) {
      next(error);
    }
  }

  async getAdminStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getAdminStats();

      res.status(200).json({
        success: true,
        data: stats,
      } as ApiResponse<typeof stats>);
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
