import { prisma } from "../prisma/client";
import { Trade, TradeStatus } from "@prisma/client";
import { AppError } from "../middleware/error.middleware";
import { z } from "zod";

export const createTradeSchema = z.object({
  listing_id: z.string().uuid(),
  proposed_listing_id: z.string().uuid().optional(),
  coin_amount: z.number().int().min(0).optional().default(0),
  message: z.string().optional(),
});

export const confirmTradeSchema = z.object({
  accepted: z.boolean(),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type ConfirmTradeInput = z.infer<typeof confirmTradeSchema>;

export class TradesService {
  async createTrade(
    initiatorId: string,
    data: CreateTradeInput
  ): Promise<Trade> {
    // Verify listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: data.listing_id },
    });

    if (!listing) {
      throw new AppError(404, "Listing not found");
    }

    // Check if user is not the owner
    if (listing.owner_id === initiatorId) {
      throw new AppError(400, "Cannot trade your own listing");
    }

    // If proposing a listing, verify it exists
    if (data.proposed_listing_id) {
      const proposedListing = await prisma.listing.findUnique({
        where: { id: data.proposed_listing_id },
      });

      if (!proposedListing) {
        throw new AppError(404, "Proposed listing not found");
      }

      if (proposedListing.owner_id !== initiatorId) {
        throw new AppError(400, "You can only propose your own listings");
      }
    }

    const trade = await prisma.trade.create({
      data: {
        initiator_id: initiatorId,
        responder_id: listing.owner_id,
        listing_id: data.listing_id,
        proposed_listing_id: data.proposed_listing_id,
        coin_amount: data.coin_amount || 0,
        message: data.message,
      },
    });

    return trade;
  }

  async getTrades(userId: string, type: "incoming" | "outgoing" = "incoming"): Promise<Trade[]> {
    const where =
      type === "incoming"
        ? { responder_id: userId }
        : { initiator_id: userId };

    return await prisma.trade.findMany({
      where,
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            rating: true,
          },
        },
        responder: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            rating: true,
          },
        },
        listing: true,
      },
      orderBy: { created_at: "desc" },
    });
  }

  async getTradeById(id: string): Promise<Trade> {
    const trade = await prisma.trade.findUnique({
      where: { id },
      include: {
        initiator: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            rating: true,
            bio: true,
          },
        },
        responder: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            rating: true,
            bio: true,
          },
        },
        listing: {
          include: {
            owner: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!trade) {
      throw new AppError(404, "Trade not found");
    }

    return trade;
  }

  async confirmTrade(
    id: string,
    userId: string,
    accepted: boolean
  ): Promise<Trade> {
    const trade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!trade) {
      throw new AppError(404, "Trade not found");
    }

    // Only responder can confirm
    if (trade.responder_id !== userId) {
      throw new AppError(403, "Only responder can confirm this trade");
    }

    if (trade.status !== TradeStatus.PENDING) {
      throw new AppError(400, "Trade can only be confirmed if pending");
    }

    const updatedTrade = await prisma.trade.update({
      where: { id },
      data: {
        status: accepted ? TradeStatus.ACCEPTED : TradeStatus.REJECTED,
      },
    });

    return updatedTrade;
  }

  async completeTrade(id: string, userId: string): Promise<Trade> {
    const trade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!trade) {
      throw new AppError(404, "Trade not found");
    }

    // Either participant can complete
    if (trade.initiator_id !== userId && trade.responder_id !== userId) {
      throw new AppError(403, "Unauthorized to complete this trade");
    }

    if (trade.status !== TradeStatus.ACCEPTED) {
      throw new AppError(400, "Trade must be accepted before completing");
    }

    // Update listing status and handle coin transfer if needed
    const result = await prisma.$transaction(async (tx: any) => {
      // Update listing status to TRADED
      await tx.listing.update({
        where: { id: trade.listing_id },
        data: { status: "TRADED" },
      });

      // Handle coin transfer if coins were part of the trade
      if (trade.coin_amount > 0) {
        const payer =
          trade.initiator_id === userId ? trade.responder_id : trade.initiator_id;
        const receiver =
          trade.initiator_id === userId ? trade.initiator_id : trade.responder_id;

        await tx.profile.update({
          where: { id: payer },
          data: { coins: { decrement: trade.coin_amount } },
        });

        await tx.profile.update({
          where: { id: receiver },
          data: { coins: { increment: trade.coin_amount } },
        });

        // Log transactions
        await tx.coinTransaction.create({
          data: {
            user_id: payer,
            amount: -trade.coin_amount,
            reason: `Trade completion - to ${receiver}`,
          },
        });

        await tx.coinTransaction.create({
          data: {
            user_id: receiver,
            amount: trade.coin_amount,
            reason: `Trade completion - from ${payer}`,
          },
        });
      }

      // Update trade status
      return await tx.trade.update({
        where: { id },
        data: { status: TradeStatus.COMPLETED },
      });
    });

    return result;
  }

  async cancelTrade(id: string, userId: string): Promise<Trade> {
    const trade = await prisma.trade.findUnique({
      where: { id },
    });

    if (!trade) {
      throw new AppError(404, "Trade not found");
    }

    // Only initiator can cancel
    if (trade.initiator_id !== userId) {
      throw new AppError(403, "Only initiator can cancel this trade");
    }

    if (trade.status !== TradeStatus.PENDING) {
      throw new AppError(400, "Can only cancel pending trades");
    }

    return await prisma.trade.delete({
      where: { id },
    }) as Trade;
  }
}
