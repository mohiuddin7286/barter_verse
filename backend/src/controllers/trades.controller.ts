import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../prisma/client';

export const getMyTrades = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

    const trades = await prisma.trade.findMany({
      where: {
        OR: [
          { initiator_id: req.user.id },
          { responder_id: req.user.id },
        ],
      },
      include: {
        initiator: { select: { id: true, username: true, avatar_url: true } },
        responder: { select: { id: true, username: true, avatar_url: true } },
        listing: {
          select: {
            id: true,
            title: true,
            category: true,
            images: true, // Fixed: select 'images', not 'image_url'
            price_bc: true,
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
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

    const { id } = req.params;
    const trade = await prisma.trade.findUnique({
      where: { id },
      include: {
        initiator: { select: { id: true, username: true } },
        responder: { select: { id: true, username: true } },
        listing: { select: { id: true, title: true } },
      },
    });

    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    res.json({ data: trade });
  } catch (err) {
    next(err);
  }
};

// 1. CREATE: Deduct coins immediately (Escrow Lock)
export const createTrade = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

    const {
      responder_id, responderUserId,
      listing_id, listingId,
      proposed_listing_id,
      coin_amount, proposedCoins,
      message,
    } = req.body;

    const finalResponderId = responder_id || responderUserId;
    const finalListingId = listing_id || listingId;
    const coinAmount = Number(coin_amount || proposedCoins || 0);

    if (!finalResponderId || !finalListingId) {
      return res.status(400).json({ message: 'responder_id and listing_id are required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Check Balance
      const initiator = await tx.profile.findUnique({ where: { id: req.user!.id } });
      if (!initiator || initiator.coins < coinAmount) {
        throw new Error('Insufficient coins for this trade offer');
      }

      // 2. Create Trade
      const trade = await tx.trade.create({
        data: {
          initiator_id: req.user!.id,
          responder_id: finalResponderId,
          listing_id: finalListingId,
          proposed_listing_id,
          coin_amount: coinAmount,
          message,
          status: 'PENDING',
        },
        include: {
            initiator: { select: { id: true, username: true } },
            responder: { select: { id: true, username: true } },
            listing: { select: { id: true, title: true } },
        }
      });

      // 3. Deduct Coins (Lock in Escrow)
      if (coinAmount > 0) {
        await tx.profile.update({
          where: { id: req.user!.id },
          data: { coins: { decrement: coinAmount } },
        });

        await tx.coinTransaction.create({
          data: {
            user_id: req.user!.id,
            amount: -coinAmount,
            reason: `Escrow Lock: Trade Offer for ${finalListingId}`,
          },
        });
      }

      return trade;
    });

    res.status(201).json({ data: result });
  } catch (err: any) {
    if (err.message === 'Insufficient coins for this trade offer') {
        return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// 2. CONFIRM: Accept (Lock) or Reject (Refund)
export const confirmTrade = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

    const { id } = req.params;
    const { action } = req.body;

    const trade = await prisma.trade.findUnique({ where: { id } });
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    if (trade.responder_id !== req.user.id) {
      return res.status(403).json({ message: 'Only the seller can confirm this trade' });
    }

    if (trade.status !== 'PENDING') {
      return res.status(400).json({ message: 'Trade is not pending' });
    }

    const result = await prisma.$transaction(async (tx) => {
        let status = '';
        if (action === 'accept') {
            status = 'ESCROW_LOCKED';
            await tx.trade.update({ where: { id }, data: { status: 'ESCROW_LOCKED' } }); // Use string literal to satisfy Enum
        } else {
            status = 'REJECTED';
            await tx.trade.update({ where: { id }, data: { status: 'REJECTED' } });

            if (trade.coin_amount > 0) {
                await tx.profile.update({
                    where: { id: trade.initiator_id },
                    data: { coins: { increment: trade.coin_amount } }
                });
                await tx.coinTransaction.create({
                    data: {
                        user_id: trade.initiator_id,
                        amount: trade.coin_amount,
                        reason: `Refund: Trade Rejected by Seller (${trade.id})`
                    }
                });
            }
        }
        return { status };
    });

    res.json({ message: `Trade ${action}ed successfully`, data: result });
  } catch (err) {
    next(err);
  }
};

// 3. CONFIRM DELIVERY
export const confirmDelivery = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
      const { id } = req.params;
  
      const trade = await prisma.trade.findUnique({ where: { id } });
      if (!trade) return res.status(404).json({ message: 'Trade not found' });
  
      if (trade.responder_id !== req.user.id) {
        return res.status(403).json({ message: 'Only the seller can confirm delivery' });
      }
  
      const updated = await prisma.trade.update({
        where: { id },
        data: { status: 'DELIVERED' }, // Use string literal
      });
  
      res.json({ data: updated });
    } catch (err) {
      next(err);
    }
};

// 4. COMPLETE TRADE
export const completeTrade = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

    const { id } = req.params;
    const trade = await prisma.trade.findUnique({ where: { id } });
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    if (trade.initiator_id !== req.user.id) {
      return res.status(403).json({ message: 'Only the buyer can release funds' });
    }

    if (trade.status === 'COMPLETED') {
        return res.status(400).json({ message: 'Trade already completed' });
    }

    const result = await prisma.$transaction(async (tx) => {
        const updatedTrade = await tx.trade.update({
            where: { id },
            data: { status: 'COMPLETED' },
            include: { initiator: true, responder: true }
        });

        if (trade.coin_amount > 0) {
            await tx.profile.update({
                where: { id: trade.responder_id },
                data: { coins: { increment: trade.coin_amount } },
            });
            await tx.coinTransaction.create({
                data: {
                    user_id: trade.responder_id,
                    amount: trade.coin_amount,
                    reason: `Payment: Trade Completed (${trade.id})`,
                },
            });
        }
        return updatedTrade;
    });

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

// 5. CANCEL TRADE
export const cancelTrade = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });

    const { id } = req.params;
    const trade = await prisma.trade.findUnique({ where: { id } });
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    if (trade.status !== 'PENDING') {
        return res.status(400).json({ message: 'Cannot cancel active trade. Use dispute.' });
    }

    if (trade.initiator_id !== req.user.id) {
        return res.status(403).json({ message: 'Only the initiator can cancel this offer' });
    }

    const result = await prisma.$transaction(async (tx) => {
        await tx.trade.update({
            where: { id },
            data: { status: 'CANCELLED' } 
        });

        if (trade.coin_amount > 0) {
            await tx.profile.update({
                where: { id: trade.initiator_id },
                data: { coins: { increment: trade.coin_amount } }
            });
            await tx.coinTransaction.create({
                data: {
                    user_id: trade.initiator_id,
                    amount: trade.coin_amount,
                    reason: `Refund: Trade Cancelled (${trade.id})`
                }
            });
        }
        return { message: 'Trade cancelled and funds refunded' };
    });

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};