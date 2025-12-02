import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../prisma/client';

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
