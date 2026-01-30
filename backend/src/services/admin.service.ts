import { prisma } from "../prisma/client";
import { AppError } from "../middleware/error.middleware";

export const adminService = {
  getAllUsers: async () => {
    return prisma.profile.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        coins: true,
        role: true,
        created_at: true,
        rating: true,
      },
      orderBy: { created_at: 'desc' },
    });
  },

  getUserById: async (userId: string) => {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, coins: true, role: true },
    });
    if (!user) throw new AppError(404, "User not found");
    return user;
  },

  addCoinsToUser: async (userId: string, amount: number, reason: string) => {
    return prisma.coinTransaction.create({
      data: { user_id: userId, amount, reason },
    });
  },

  removeCoinsFromUser: async (userId: string, amount: number, reason: string) => {
    const user = await prisma.profile.findUnique({ where: { id: userId } });
    if (!user || user.coins < amount) throw new AppError(400, "Not enough coins");

    return prisma.coinTransaction.create({
      data: { user_id: userId, amount: -amount, reason },
    });
  },

  updateUserRole: async (userId: string, role: string) => {
    return prisma.profile.update({
      where: { id: userId },
      data: { role },
    });
  },

  getAllTrades: async (status?: string) => {
    return prisma.trade.findMany({
      where: status ? { status: status.toUpperCase() as any } : undefined,
      include: {
        initiator: { select: { id: true, username: true } },
        responder: { select: { id: true, username: true } },
        listing: true,
      },
    });
  },

  getTradeById: async (tradeId: string) => {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        initiator: { select: { id: true, username: true } },
        responder: { select: { id: true, username: true } },
        listing: true,
      },
    });
    if (!trade) throw new AppError(404, "Trade not found");
    return trade;
  },

  acceptTrade: async (tradeId: string) => {
    return prisma.trade.update({
      where: { id: tradeId },
      data: { status: "ACCEPTED" },
    });
  },

  rejectTrade: async (tradeId: string, reason?: string) => {
    return prisma.trade.update({
      where: { id: tradeId },
      data: { status: "REJECTED", message: reason },
    });
  },

  completeTrade: async (tradeId: string) => {
    return prisma.trade.update({
      where: { id: tradeId },
      data: { status: "COMPLETED" },
    });
  },

  cancelTrade: async (tradeId: string, reason?: string) => {
    return prisma.trade.update({
      where: { id: tradeId },
      data: { status: "REJECTED", message: reason },
    });
  },

  getAdminStats: async () => {
    const [totalUsers, totalListings, activeTrades, coinsAggregate] = await Promise.all([
      prisma.profile.count(),
      prisma.listing.count(),
      prisma.trade.count({ where: { status: { in: ['PENDING', 'ESCROW_LOCKED', 'DELIVERED'] } } }),
      prisma.coinTransaction.aggregate({ _sum: { amount: true } }),
    ]);

    return {
      totalUsers,
      totalListings,
      activeTrades,
      totalCoinsTraded: coinsAggregate._sum.amount ?? 0,
    };
  },
};
