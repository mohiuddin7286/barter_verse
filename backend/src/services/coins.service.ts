import { prisma } from "../prisma/client";
import { AppError } from "../middleware/error.middleware";
import { z } from "zod";

export const spendCoinsSchema = z.object({
  amount: z.number().int().min(1),
  reason: z.string().min(1),
});

export const addCoinsSchema = z.object({
  amount: z.number().int().min(1),
  reason: z.string().min(1),
});

export type SpendCoinsInput = z.infer<typeof spendCoinsSchema>;
export type AddCoinsInput = z.infer<typeof addCoinsSchema>;

export class CoinsService {
  async getBalance(userId: string): Promise<number> {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (!profile) {
      throw new AppError(404, "User not found");
    }

    return profile.coins;
  }

  async addCoins(
    userId: string,
    amount: number,
    reason: string
  ): Promise<{ balance: number; transaction: any }> {
    if (amount <= 0) {
      throw new AppError(400, "Amount must be greater than 0");
    }

    const [profile, transaction] = await Promise.all([
      prisma.profile.update({
        where: { id: userId },
        data: { coins: { increment: amount } },
      }),
      prisma.coinTransaction.create({
        data: {
          user_id: userId,
          amount,
          reason,
        },
      }),
    ]);

    return {
      balance: profile.coins,
      transaction,
    };
  }

  async spendCoins(
    userId: string,
    amount: number,
    reason: string
  ): Promise<{ balance: number; transaction: any }> {
    if (amount <= 0) {
      throw new AppError(400, "Amount must be greater than 0");
    }

    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    if (!profile) {
      throw new AppError(404, "User not found");
    }

    if (profile.coins < amount) {
      throw new AppError(400, "Insufficient coins balance");
    }

    const [updatedProfile, transaction] = await Promise.all([
      prisma.profile.update({
        where: { id: userId },
        data: { coins: { decrement: amount } },
      }),
      prisma.coinTransaction.create({
        data: {
          user_id: userId,
          amount: -amount,
          reason,
        },
      }),
    ]);

    return {
      balance: updatedProfile.coins,
      transaction,
    };
  }

  async getTransactionHistory(
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
    return await prisma.coinTransaction.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: limit,
    });
  }

  async transferCoins(
    fromUserId: string,
    toUserId: string,
    amount: number,
    reason: string
  ): Promise<any> {
    if (amount <= 0) {
      throw new AppError(400, "Amount must be greater than 0");
    }

    // Check sender balance
    const sender = await prisma.profile.findUnique({
      where: { id: fromUserId },
      select: { coins: true },
    });

    if (!sender) {
      throw new AppError(404, "Sender not found");
    }

    if (sender.coins < amount) {
      throw new AppError(400, "Insufficient coins balance");
    }

    // Check recipient exists
    const recipient = await prisma.profile.findUnique({
      where: { id: toUserId },
      select: { id: true },
    });

    if (!recipient) {
      throw new AppError(404, "Recipient not found");
    }

    // Transfer coins
    const transferReason = `Transfer: ${reason}`;

    const result = await prisma.$transaction(async (tx: any) => {
      const updated = await tx.profile.update({
        where: { id: fromUserId },
        data: { coins: { decrement: amount } },
      });

      await tx.profile.update({
        where: { id: toUserId },
        data: { coins: { increment: amount } },
      });

      const senderTx = await tx.coinTransaction.create({
        data: {
          user_id: fromUserId,
          amount: -amount,
          reason: transferReason,
        },
      });

      const recipientTx = await tx.coinTransaction.create({
        data: {
          user_id: toUserId,
          amount,
          reason: transferReason,
        },
      });

      return {
        senderBalance: updated.coins,
        senderTransaction: senderTx,
        recipientTransaction: recipientTx,
      };
    });

    return result;
  }
}
