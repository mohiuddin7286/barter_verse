import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../prisma/client';
import { CoinsService } from '../services/coins.service';

const coinsService = new CoinsService();

export const getMyCoins = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

    const user = await prisma.profile.findUnique({
      where: { id: req.user.id },
      select: { coins: true },
    });

    res.json({ coins: user?.coins ?? 0 });
  } catch (err) {
    next(err);
  }
};

export const getMyCoinTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

    const txs = await prisma.coinTransaction.findMany({
      where: { user_id: req.user.id },
      orderBy: { created_at: 'desc' },
    });

    res.json(txs);
  } catch (err) {
    next(err);
  }
};

// Add coins to the current authenticated user
export const addCoins = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

    const { amount, reason } = req.body;
    const result = await coinsService.addCoins(req.user.id, Number(amount), reason || 'manual');

    res.json({ data: { new_balance: result.balance, transaction: result.transaction } });
  } catch (err) {
    next(err);
  }
};

// Spend coins for the current authenticated user
export const spendCoins = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

    const { amount, reason } = req.body;
    const result = await coinsService.spendCoins(req.user.id, Number(amount), reason || 'spend');

    res.json({ data: { new_balance: result.balance, transaction: result.transaction } });
  } catch (err) {
    next(err);
  }
};

// Transfer coins from authenticated user to another user
export const transferCoins = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

    const { toUserId, amount } = req.body;
    const result = await coinsService.transferCoins(req.user.id, toUserId, Number(amount), 'transfer');

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};
