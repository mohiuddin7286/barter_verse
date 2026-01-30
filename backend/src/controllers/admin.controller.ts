import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { adminService } from '../services/admin.service';
import { AppError } from '../middleware/error.middleware';

export const listUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const setUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.userId || req.params.userId;
    const { role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: 'userId and role required' });
    }

    const updated = await adminService.updateUserRole(userId, role);

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Admin: Add coins to a user
export const adminAddCoins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, amount, reason } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ message: 'userId and amount required' });
    }

    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newBalance = user.coins + Number(amount);

    const updated = await prisma.profile.update({
      where: { id: userId },
      data: { coins: newBalance },
    });

    // Log transaction
    const transaction = await prisma.coinTransaction.create({
      data: {
        user_id: userId,
        amount: Number(amount),
        reason: reason || 'admin_added',
      },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: updated.id,
          email: updated.email,
          username: updated.username,
          coins: updated.coins,
        },
        transaction,
        new_balance: newBalance,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Deduct coins from a user
export const adminDeductCoins = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, amount, reason } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ message: 'userId and amount required' });
    }

    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deductAmount = Number(amount);
    if (user.coins < deductAmount) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }

    const newBalance = user.coins - deductAmount;

    const updated = await prisma.profile.update({
      where: { id: userId },
      data: { coins: newBalance },
    });

    // Log transaction
    const transaction = await prisma.coinTransaction.create({
      data: {
        user_id: userId,
        amount: -deductAmount,
        reason: reason || 'admin_deducted',
      },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: updated.id,
          email: updated.email,
          username: updated.username,
          coins: updated.coins,
        },
        transaction,
        new_balance: newBalance,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all coin transactions (with user info)
export const getCoinTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    const transactions = await prisma.coinTransaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.coinTransaction.count();

    res.json({
      success: true,
      data: transactions,
      pagination: {
        limit,
        offset,
        total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Get transaction history for a specific user
export const getUserTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const transactions = await prisma.coinTransaction.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.coinTransaction.count({
      where: { user_id: userId },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          coins: user.coins,
        },
        transactions,
        pagination: {
          limit,
          offset,
          total,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Overview stats
export const getAdminStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getAdminStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

// Admin: Trades moderation
export const getAdminTrades = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const trades = await adminService.getAllTrades(status);
    res.json({ success: true, data: trades });
  } catch (err) {
    next(err);
  }
};

export const getAdminTradeById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const trade = await adminService.getTradeById(id);
    res.json({ success: true, data: trade });
  } catch (err) {
    next(err);
  }
};

export const adminAcceptTrade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const trade = await adminService.acceptTrade(id);
    res.json({ success: true, data: trade });
  } catch (err) {
    next(err);
  }
};

export const adminRejectTrade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const trade = await adminService.rejectTrade(id, reason);
    res.json({ success: true, data: trade });
  } catch (err) {
    next(err);
  }
};

export const adminCompleteTrade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const trade = await adminService.completeTrade(id);
    res.json({ success: true, data: trade });
  } catch (err) {
    next(err);
  }
};

export const adminCancelTrade = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const trade = await adminService.cancelTrade(id, reason);
    res.json({ success: true, data: trade });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!userId) throw new AppError(400, 'userId is required');
    const user = await adminService.getUserById(userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
