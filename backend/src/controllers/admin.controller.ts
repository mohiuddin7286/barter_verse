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
