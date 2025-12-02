import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../prisma/client';

export const getMyTrades = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const trades = await prisma.trade.findMany({
      where: {
        OR: [
          { initiator_id: req.user.id },
          { responder_id: req.user.id },
        ],
      },
      include: {
        initiator: { select: { id: true, username: true } },
        responder: { select: { id: true, username: true } },
        listing: {
          select: {
            id: true,
            title: true,
            category: true,
            image_url: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(trades);
  } catch (err) {
    next(err);
  }
};

export const createTrade = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const {
      responder_id,
      listing_id,
      proposed_listing_id,
      coin_amount,
      message,
    } = req.body;

    const trade = await prisma.trade.create({
      data: {
        initiator_id: req.user.id,
        responder_id,
        listing_id,
        proposed_listing_id,
        coin_amount: coin_amount ?? 0,
        message,
      },
    });

    res.status(201).json(trade);
  } catch (err) {
    next(err);
  }
};
