import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

export const listUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.profile.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        coins: true,
        rating: true,
        role: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const setUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: 'userId and role required' });
    }

    const updated = await prisma.profile.update({
      where: { id: userId },
      data: { role },
    });

    res.json(updated);
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
