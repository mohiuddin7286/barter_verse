import { prisma } from "../prisma/client";
import { AppError } from "../middleware/error.middleware";
import { z } from "zod";
import { NotificationService } from "./notifications.service";

// Validation Schemas
export const createQuestSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(2000),
  category: z.enum(["Daily", "Weekly", "Seasonal"]),
  type: z.enum(["Post", "Trade", "Session", "Review", "Invite"]),
  xp_reward: z.number().min(10).max(1000),
  coin_reward: z.number().min(0).max(1000).default(0),
  progress_target: z.number().min(1).max(1000),
  icon: z.string().optional(),
  season: z.string().optional(),
});

export type CreateQuestInput = z.infer<typeof createQuestSchema>;

type QuestProgressItem = {
  quest_id: string;
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  xp_reward: number;
  coin_reward: number;
  progress_target: number;
  icon: string | null;
  is_active: boolean;
  season: string | null;
  progress: number;
  completed: boolean;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

/**
 * Quests Service
 * DEPRECATION NOTICE: This service references Quest, QuestCompletion, and Achievement models
 * that do not exist in the current Prisma schema. These models need to be created in the
 * Prisma schema and migrated to the database for this service to function properly.
 * 
 * TODO: Create migration for Quest, QuestCompletion, and Achievement models
 * TODO: Add level and xp_points fields to Profile model
 */
export class QuestsService {
  // ============ QUEST MANAGEMENT ============

  async createQuest(data: CreateQuestInput): Promise<any> {
    const validatedData = createQuestSchema.parse(data);
    return prisma.quest.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        type: validatedData.type,
        xp_reward: validatedData.xp_reward,
        coin_reward: validatedData.coin_reward,
        progress_target: validatedData.progress_target,
        icon: validatedData.icon,
        season: validatedData.season,
        is_active: true,
      },
    });
  }

  async getQuestById(questId: string): Promise<any> {
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      include: {
        completions: {
          select: {
            id: true,
            user_id: true,
            progress: true,
            completed: true,
            completed_at: true,
          },
        },
      },
    });

    if (!quest) {
      throw new AppError(404, "Quest not found");
    }

    return quest;
  }

  async getActiveQuests(category?: string, season?: string): Promise<any[]> {
    return prisma.quest.findMany({
      where: {
        is_active: true,
        ...(category ? { category } : {}),
        ...(season ? { season } : {}),
      },
      orderBy: [{ category: "asc" }, { created_at: "desc" }],
    });
  }

  async getDailyQuests(): Promise<any[]> {
    return this.getActiveQuests("Daily");
  }

  async getWeeklyQuests(): Promise<any[]> {
    return this.getActiveQuests("Weekly");
  }

  async getSeasonalQuests(season: string): Promise<any[]> {
    return this.getActiveQuests("Seasonal", season);
  }

  async toggleQuestActive(questId: string, isActive: boolean): Promise<any> {
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!quest) {
      throw new AppError(404, "Quest not found");
    }

    return prisma.quest.update({
      where: { id: questId },
      data: { is_active: isActive },
    });
  }

  // ============ QUEST COMPLETION ============

  async getQuestCompletion(questId: string, userId: string): Promise<any> {
    return prisma.questCompletion.findUnique({
      where: {
        quest_id_user_id: {
          quest_id: questId,
          user_id: userId,
        },
      },
      include: {
        quest: true,
      },
    });
  }

  async updateQuestProgress(questId: string, userId: string, progress: number): Promise<any> {
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
      select: { id: true, progress_target: true },
    });

    if (!quest) {
      throw new AppError(404, "Quest not found");
    }

    const normalizedProgress = Math.max(0, Math.min(progress, quest.progress_target));
    const existing = await prisma.questCompletion.findUnique({
      where: {
        quest_id_user_id: {
          quest_id: questId,
          user_id: userId,
        },
      },
    });

    return prisma.questCompletion.upsert({
      where: {
        quest_id_user_id: {
          quest_id: questId,
          user_id: userId,
        },
      },
      create: {
        quest_id: questId,
        user_id: userId,
        progress: normalizedProgress,
        completed: false,
      },
      update: {
        progress: normalizedProgress,
        completed: existing?.completed ?? false,
        completed_at: existing?.completed_at ?? null,
      },
      include: {
        quest: true,
      },
    });
  }

  async completeQuest(questId: string, userId: string): Promise<any> {
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!quest) {
      throw new AppError(404, "Quest not found");
    }

    const completion = await prisma.questCompletion.findUnique({
      where: {
        quest_id_user_id: {
          quest_id: questId,
          user_id: userId,
        },
      },
    });

    if (completion?.completed) {
      return {
        completion,
        xp_awarded: 0,
        coin_awarded: 0,
        already_completed: true,
      };
    }

    const currentProgress = completion?.progress ?? 0;
    if (currentProgress < quest.progress_target) {
      throw new AppError(400, "Quest progress is not complete yet");
    }

    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.profile.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          coins: true,
          xp_points: true,
          level: true,
        },
      });

      if (!user) {
        throw new AppError(404, "User not found");
      }

      const newXp = user.xp_points + quest.xp_reward;
      const newLevel = this.calculateLevelFromXP(newXp);
      const newCoins = user.coins + quest.coin_reward;

      const updatedUser = await tx.profile.update({
        where: { id: userId },
        data: {
          xp_points: newXp,
          level: newLevel,
          coins: newCoins,
        },
        select: {
          id: true,
          username: true,
          coins: true,
          xp_points: true,
          level: true,
        },
      });

      const updatedCompletion = await tx.questCompletion.upsert({
        where: {
          quest_id_user_id: {
            quest_id: questId,
            user_id: userId,
          },
        },
        create: {
          quest_id: questId,
          user_id: userId,
          progress: quest.progress_target,
          completed: true,
          completed_at: now,
        },
        update: {
          progress: quest.progress_target,
          completed: true,
          completed_at: now,
        },
        include: {
          quest: true,
        },
      });

      if (quest.coin_reward > 0) {
        await tx.coinTransaction.create({
          data: {
            user_id: userId,
            amount: quest.coin_reward,
            reason: `Quest reward: ${quest.title}`,
          },
        });
      }

      return {
        completion: updatedCompletion,
        user: updatedUser,
      };
    });

    await NotificationService.createNotification({
      user_id: userId,
      type: "quest_completed",
      title: "Quest Completed",
      message: `You completed \"${quest.title}\" and earned ${quest.xp_reward} XP${quest.coin_reward > 0 ? ` and ${quest.coin_reward} BC` : ""}.`,
      related_id: questId,
      related_type: "quest",
      action_url: "/quests",
    });

    await this.checkAndAwardAchievements(userId);

    return {
      completion: result.completion,
      xp_awarded: quest.xp_reward,
      coin_awarded: quest.coin_reward,
      user: result.user,
      already_completed: false,
    };
  }

  async getUserQuestProgress(userId: string, category?: string): Promise<any[]> {
    const quests = await prisma.quest.findMany({
      where: {
        is_active: true,
        ...(category ? { category } : {}),
      },
      orderBy: [{ category: "asc" }, { created_at: "desc" }],
      include: {
        completions: {
          where: { user_id: userId },
          take: 1,
        },
      },
    });

    return quests.map((quest) => {
      const completion = quest.completions[0];
      return {
        quest_id: quest.id,
        id: quest.id,
        title: quest.title,
        description: quest.description,
        category: quest.category,
        type: quest.type,
        xp_reward: quest.xp_reward,
        coin_reward: quest.coin_reward,
        progress_target: quest.progress_target,
        icon: quest.icon,
        is_active: quest.is_active,
        season: quest.season,
        created_at: quest.created_at,
        updated_at: quest.updated_at,
        progress: completion?.progress ?? 0,
        completed: completion?.completed ?? false,
        completed_at: completion?.completed_at ?? null,
      } as QuestProgressItem;
    });
  }

  // ============ ACHIEVEMENTS ============

  async getUserAchievements(userId: string): Promise<any[]> {
    return prisma.achievement.findMany({
      where: { user_id: userId },
      orderBy: { earned_at: "desc" },
    });
  }

  async checkAndAwardAchievements(userId: string): Promise<void> {
    const [completedQuestCount, userStats] = await Promise.all([
      prisma.questCompletion.count({
        where: { user_id: userId, completed: true },
      }),
      prisma.profile.findUnique({
        where: { id: userId },
        select: { xp_points: true, level: true },
      }),
    ]);

    if (!userStats) {
      return;
    }

    const awardIfMissing = async (
      title: string,
      description: string,
      icon?: string,
      badge_color?: string
    ) => {
      const existing = await prisma.achievement.findFirst({
        where: {
          user_id: userId,
          title,
        },
      });

      if (existing) {
        return;
      }

      await prisma.achievement.create({
        data: {
          user_id: userId,
          title,
          description,
          icon,
          badge_color,
        },
      });

      await NotificationService.createNotification({
        user_id: userId,
        type: "achievement",
        title: "Achievement Unlocked",
        message: `You earned the \"${title}\" achievement.`,
        related_id: userId,
        related_type: "achievement",
        action_url: "/profile",
      });
    };

    if (completedQuestCount >= 1) {
      await awardIfMissing(
        "First Quest",
        "Complete your first quest.",
        "trophy",
        "bronze"
      );
    }

    if (completedQuestCount >= 10) {
      await awardIfMissing(
        "Quest Apprentice",
        "Complete 10 quests.",
        "sparkles",
        "silver"
      );
    }

    if (userStats.xp_points >= 1000) {
      await awardIfMissing(
        "XP Collector",
        "Earn 1,000 XP.",
        "zap",
        "bronze"
      );
    }

    if (userStats.level >= 5) {
      await awardIfMissing(
        "Seasoned Trader",
        "Reach level 5.",
        "crown",
        "silver"
      );
    }
  }

  // ============ XP AND LEVELING ============

  async addXPToUser(userId: string, xpAmount: number, reason?: string): Promise<any> {
    if (xpAmount <= 0) {
      throw new AppError(400, "XP amount must be greater than zero");
    }

    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        xp_points: true,
        level: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const newXp = user.xp_points + xpAmount;
    const newLevel = this.calculateLevelFromXP(newXp);

    const updatedUser = await prisma.profile.update({
      where: { id: userId },
      data: {
        xp_points: newXp,
        level: newLevel,
      },
      select: {
        id: true,
        username: true,
        xp_points: true,
        level: true,
        coins: true,
      },
    });

    await this.checkAndAwardAchievements(userId);

    return {
      userId: updatedUser.id,
      username: updatedUser.username,
      xp_awarded: xpAmount,
      total_xp: updatedUser.xp_points,
      current_xp: updatedUser.xp_points,
      level: updatedUser.level,
      xp_for_level: this.getNextLevelThreshold(updatedUser.level),
      xp_for_next_level: this.getNextLevelThreshold(updatedUser.level),
      xp_progress_to_next: this.getXPIntoCurrentLevel(updatedUser.xp_points, updatedUser.level),
      reason: reason || null,
    };
  }

  async getUserXPStats(userId: string): Promise<any> {
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        coins: true,
        rating: true,
        xp_points: true,
        level: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return {
      userId: user.id,
      username: user.username,
      total_xp: user.xp_points,
      current_xp: user.xp_points,
      level: user.level,
      xp_progress: this.getXPIntoCurrentLevel(user.xp_points, user.level),
      xp_progress_to_next: this.getXPIntoCurrentLevel(user.xp_points, user.level),
      xp_for_level: this.getNextLevelThreshold(user.level),
      xp_for_next_level: this.getNextLevelThreshold(user.level),
      xp_remaining: Math.max(0, this.getNextLevelThreshold(user.level) - user.xp_points),
    };
  }

  // ============ LEADERBOARDS ============

  async getXPLeaderboard(limit = 10): Promise<any[]> {
    const users = await prisma.profile.findMany({
      select: {
        id: true,
        username: true,
        display_name: true,
        avatar_url: true,
        coins: true,
        xp_points: true,
        level: true,
      },
      orderBy: [{ xp_points: "desc" }, { level: "desc" }],
      take: limit,
    });

    return users.map((user) => ({
      ...user,
      total_xp: user.xp_points,
      current_xp: user.xp_points,
    }));
  }

  async getLevelLeaderboard(limit = 10): Promise<any[]> {
    const users = await prisma.profile.findMany({
      select: {
        id: true,
        username: true,
        display_name: true,
        avatar_url: true,
        coins: true,
        xp_points: true,
        level: true,
      },
      orderBy: [{ level: "desc" }, { xp_points: "desc" }],
      take: limit,
    });

    return users.map((user) => ({
      ...user,
      total_xp: user.xp_points,
      current_xp: user.xp_points,
    }));
  }

  // ============ STATISTICS ============

  async getQuestStatistics(): Promise<any> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalQuests, completedToday, activeUsersToday, mostCompletedQuest] = await Promise.all([
      prisma.quest.count(),
      prisma.questCompletion.count({
        where: {
          completed: true,
          completed_at: {
            gte: todayStart,
          },
        },
      }),
      prisma.questCompletion.groupBy({
        by: ["user_id"],
        where: {
          completed: true,
          completed_at: {
            gte: todayStart,
          },
        },
        _count: {
          user_id: true,
        },
      }),
      prisma.questCompletion.groupBy({
        by: ["quest_id"],
        where: { completed: true },
        _count: {
          quest_id: true,
        },
        orderBy: {
          _count: {
            quest_id: "desc",
          },
        },
        take: 1,
      }),
    ]);

    let mostCompletedQuestData = null;
    if (mostCompletedQuest.length > 0) {
      const quest = await prisma.quest.findUnique({
        where: { id: mostCompletedQuest[0].quest_id },
        select: {
          id: true,
          title: true,
          category: true,
          type: true,
        },
      });

      if (quest) {
        mostCompletedQuestData = {
          ...quest,
          completions: mostCompletedQuest[0]._count.quest_id,
        };
      }
    }

    return {
      total_quests: totalQuests,
      completed_today: completedToday,
      users_active_today: activeUsersToday.length,
      most_completed_quest: mostCompletedQuestData,
    };
  }

  // ============ HELPER METHODS ============

  private getXPForLevel(level: number): number {
    const thresholds: Record<number, number> = {
      1: 0,
      2: 500,
      3: 1500,
      4: 3000,
      5: 5000,
      6: 7500,
      7: 10000,
      8: 13000,
      9: 16000,
      10: 20000,
    };
    return thresholds[level] || 0;
  }

  private getNextLevelThreshold(level: number): number {
    const nextLevelThreshold = this.getXPForLevel(level + 1);
    if (nextLevelThreshold > 0) {
      return nextLevelThreshold;
    }

    return this.getXPForLevel(level) || 1;
  }

  private getXPIntoCurrentLevel(xp: number, level: number): number {
    const currentLevelThreshold = this.getXPForLevel(level);
    return Math.max(0, xp - currentLevelThreshold);
  }

  private calculateLevelFromXP(xp: number): number {
    const thresholds = [0, 500, 1500, 3000, 5000, 7500, 10000, 13000, 16000, 20000];
    for (let level = thresholds.length - 1; level >= 1; level--) {
      if (xp >= thresholds[level - 1]) return level;
    }
    return 1;
  }
}

export const questsService = new QuestsService();
