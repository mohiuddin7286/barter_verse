import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { AuthRequest, JwtPayload } from '../types';

export const authRequired = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ')
    ? header.slice(7)
    : undefined;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('Missing JWT_SECRET');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await prisma.profile.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    // convenience properties used across controllers
    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (err) {
    console.error('authRequired error:', err);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
};
