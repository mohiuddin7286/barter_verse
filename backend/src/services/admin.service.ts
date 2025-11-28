import { prisma } from "@/prisma/client";
import { AppError } from "@/middleware/error.middleware";

export const adminService = {
  // User Management
  getAllUsers: async () => {
    const users = await prisma.profile.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        avatar_url: true,
        bio: true,
        coins: true,
        rating: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: { created_at: "desc" },
    });
    return users;
  },

  getUserById: async (userId: string) => {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        listings: true,
        coin_transactions: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  },

  updateUserRole: async (userId: string, role: string) => {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const updatedUser = await prisma.profile.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        coins: true,
        rating: true,
      },
    });

    return updatedUser;
  },

  // Coin Management
  addCoinsToUser: async (
    userId: string,
    amount: number,
    reason: string
  ) => {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    // Update user coins
    const updatedUser = await prisma.profile.update({
      where: { id: userId },
      data: {
        coins: {
          increment: amount,
        },
      },
    });

    // Record transaction
    await prisma.coinTransaction.create({
      data: {
        user_id: userId,
        amount,
        reason,
      },
    });

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        coins: updatedUser.coins,
      },
      transaction: {
        amount,
        reason,
        type: "added",
      },
    };
  },

  removeCoinsFromUser: async (
    userId: string,
    amount: number,
    reason: string
  ) => {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.coins < amount) {
      throw new AppError(400, "User has insufficient coins");
    }

    // Update user coins
    const updatedUser = await prisma.profile.update({
      where: { id: userId },
      data: {
        coins: {
          decrement: amount,
        },
      },
    });

    // Record transaction
    await prisma.coinTransaction.create({
      data: {
        user_id: userId,
        amount: -amount,
        reason,
      },
    });

    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        coins: updatedUser.coins,
      },
      transaction: {
        amount,
        reason,
        type: "removed",
      },
    };
  },

  // Trade Management
  getAllTrades: async (status?: string) => {
    const trades = await prisma.trade.findMany({
      where: status ? { status: status as any } : {},
      include: {
        initiator: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        responder: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return trades;
  },

  getTradeById: async (tradeId: string) => {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        initiator: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        responder: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
        listing: true,
      },
    });

    if (!trade) {
      throw new AppError(404, "Trade not found");
    }

    return trade;
  },

  acceptTrade: async (tradeId: string) => {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      throw new AppError(404, "Trade not found");
    }

    if (trade.status !== "PENDING") {
      throw new AppError(400, "Trade can only be accepted if it is pending");
    }

    const updatedTrade = await prisma.trade.update({
      where: { id: tradeId },
      data: { status: "ACCEPTED" },
      include: {
        initiator: true,
        responder: true,
        listing: true,
      },
    });

    return updatedTrade;
  },

  rejectTrade: async (tradeId: string, reason?: string) => {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      throw new AppError(404, "Trade not found");
    }

    if (trade.status !== "PENDING") {
      throw new AppError(400, "Trade can only be rejected if it is pending");
    }

    const updatedTrade = await prisma.trade.update({
      where: { id: tradeId },
      data: {
        status: "REJECTED",
        message: reason || trade.message,
      },
      include: {
        initiator: true,
        responder: true,
        listing: true,
      },
    });

    return updatedTrade;
  },

  completeTrade: async (tradeId: string) => {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      throw new AppError(404, "Trade not found");
    }

    if (trade.status !== "ACCEPTED") {
      throw new AppError(400, "Trade can only be completed if it is accepted");
    }

    const updatedTrade = await prisma.trade.update({
      where: { id: tradeId },
      data: { status: "COMPLETED" },
      include: {
        initiator: true,
        responder: true,
        listing: true,
      },
    });

    return updatedTrade;
  },

  cancelTrade: async (tradeId: string, reason?: string) => {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
    });

    if (!trade) {
      throw new AppError(404, "Trade not found");
    }

    if (trade.status === "COMPLETED") {
      throw new AppError(400, "Cannot cancel a completed trade");
    }

    await prisma.trade.update({
      where: { id: tradeId },
      data: {
        status: "REJECTED",
        message: reason || "Cancelled by admin",
      },
    });

    return { success: true };
  },

  // Admin Stats
  getAdminStats: async () => {
    const [totalUsers, totalTrades, totalCoins, tradesByStatus] =
      await Promise.all([
        prisma.profile.count(),
        prisma.trade.count(),
        prisma.profile.aggregate({
          _sum: {
            coins: true,
          },
        }),
        prisma.trade.groupBy({
          by: ["status"],
          _count: true,
        }),
      ]);

    const adminUsers = await prisma.profile.count({
      where: { role: "admin" },
    });

    const regularUsers = totalUsers - adminUsers;

    return {
      totalUsers,
      adminUsers,
      regularUsers,
      totalTrades,
      totalCoinsInCirculation: totalCoins._sum.coins || 0,
      tradesByStatus: tradesByStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  },
};
