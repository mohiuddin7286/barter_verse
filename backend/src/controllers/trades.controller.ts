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

    res.json({ data: trades });
  } catch (err) {
    next(err);
  }
};

export const getTradeById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const { id } = req.params;
    const trade = await prisma.trade.findUnique({
      where: { id },
      include: {
        initiator: { select: { id: true, username: true } },
        responder: { select: { id: true, username: true } },
        listing: { select: { id: true, title: true } },
      },
    });

    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    res.json({ data: trade });
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

    // Accept both camelCase (from frontend) and snake_case (from API)
    const {
      responder_id,
      responderUserId,
      listing_id,
      listingId,
      proposed_listing_id,
      coin_amount,
      message,
    } = req.body;

    const finalResponderId = responder_id || responderUserId;
    const finalListingId = listing_id || listingId;

    // Validate required fields
    if (!finalResponderId || !finalListingId) {
      return res.status(400).json({ message: 'responder_id and listing_id are required' });
    }

    const trade = await prisma.trade.create({
      data: {
        initiator_id: req.user.id,
        responder_id: finalResponderId,
        listing_id: finalListingId,
        proposed_listing_id,
        coin_amount: coin_amount ?? 0,
        message,
        status: 'PENDING',
      },
      include: {
        initiator: { select: { id: true, username: true } },
        responder: { select: { id: true, username: true } },
        listing: { select: { id: true, title: true } },
      },
    });

    res.status(201).json({ data: trade });
  } catch (err) {
    next(err);
  }
};

export const confirmTrade = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    const trade = await prisma.trade.findUnique({ where: { id } });
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    // Only responder can accept/reject
    if (trade.responder_id !== req.user.id) {
      return res.status(403).json({ message: 'You cannot confirm this trade' });
    }

    const status = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
    const updated = await prisma.trade.update({
      where: { id },
      data: { status },
      include: {
        initiator: { select: { id: true, username: true } },
        responder: { select: { id: true, username: true } },
      },
    });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const completeTrade = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const { id } = req.params;

    const trade = await prisma.trade.findUnique({ where: { id } });
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    // Only initiator or responder can complete
    if (trade.initiator_id !== req.user.id && trade.responder_id !== req.user.id) {
      return res.status(403).json({ message: 'You cannot complete this trade' });
    }

    const updated = await prisma.trade.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        initiator: { select: { id: true, username: true } },
        responder: { select: { id: true, username: true } },
      },
    });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};

export const cancelTrade = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated' });
    }

    const { id } = req.params;

    const trade = await prisma.trade.findUnique({ where: { id } });
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    // Only initiator can cancel (or responder if not yet accepted)
    if (trade.initiator_id !== req.user.id && (trade.responder_id !== req.user.id || trade.status === 'ACCEPTED')) {
      return res.status(403).json({ message: 'You cannot cancel this trade' });
    }

    const updated = await prisma.trade.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        initiator: { select: { id: true, username: true } },
        responder: { select: { id: true, username: true } },
      },
    });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
};
