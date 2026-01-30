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
  private notificationService = new NotificationService();

  // ============ QUEST MANAGEMENT ============

  async createQuest(data: CreateQuestInput): Promise<any> {
    const validatedData = createQuestSchema.parse(data);
    // TODO: Implement when Quest model exists
    throw new AppError(501, "Quests feature not yet implemented");
  }

  async getQuestById(questId: string): Promise<any> {
    // TODO: Implement when Quest model exists
    throw new AppError(501, "Quests feature not yet implemented");
  }

  async getActiveQuests(category?: string, season?: string): Promise<any[]> {
    // TODO: Implement when Quest model exists
    return [];
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
    // TODO: Implement when Quest model exists
    throw new AppError(501, "Quests feature not yet implemented");
  }

  // ============ QUEST COMPLETION ============

  async getQuestCompletion(questId: string, userId: string): Promise<any> {
    // TODO: Implement when QuestCompletion model exists
    return null;
  }

  async updateQuestProgress(questId: string, userId: string, progress: number): Promise<any> {
    // TODO: Implement when QuestCompletion model exists
    throw new AppError(501, "Quest progress tracking not yet implemented");
  }

  async completeQuest(questId: string, userId: string): Promise<any> {
    // TODO: Implement when Quest and QuestCompletion models exist
    // TODO: Emit quest_completed notification
    throw new AppError(501, "Quest completion not yet implemented");
  }

  async getUserQuestProgress(userId: string, category?: string): Promise<any[]> {
    // TODO: Implement when QuestCompletion model exists
    return [];
  }

  // ============ ACHIEVEMENTS ============

  async getUserAchievements(userId: string): Promise<any[]> {
    // TODO: Implement when Achievement model exists
    return [];
  }

  async checkAndAwardAchievements(userId: string): Promise<void> {
    // TODO: Implement when Achievement model exists
    // This should check various conditions and award achievements
  }

  // ============ XP AND LEVELING ============

  async addXPToUser(userId: string, xpAmount: number, reason?: string): Promise<any> {
    // TODO: Implement when Profile model has xp_points and level fields
    throw new AppError(501, "XP system not yet implemented");
  }

  async getUserXPStats(userId: string): Promise<any> {
    // TODO: Implement when Profile model has xp_points and level fields
    const user = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        coins: true,
        rating: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    return {
      userId: user.id,
      username: user.username,
      total_xp: 0,
      level: 1,
      xp_progress: 0,
      xp_for_next_level: 500,
    };
  }

  // ============ LEADERBOARDS ============

  async getXPLeaderboard(limit = 10): Promise<any[]> {
    // TODO: Implement when Profile model has xp_points field
    const users = await prisma.profile.findMany({
      select: {
        id: true,
        username: true,
        avatar_url: true,
        coins: true,
      },
      orderBy: { coins: "desc" },
      take: limit,
    });

    return users;
  }

  async getLevelLeaderboard(limit = 10): Promise<any[]> {
    // TODO: Implement when Profile model has level field
    return this.getXPLeaderboard(limit);
  }

  // ============ STATISTICS ============

  async getQuestStatistics(): Promise<any> {
    // TODO: Implement when Quest and QuestCompletion models exist
    return {
      total_quests: 0,
      completed_today: 0,
      users_active_today: 0,
      most_completed_quest: null,
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

  private calculateLevelFromXP(xp: number): number {
    const thresholds = [0, 500, 1500, 3000, 5000, 7500, 10000, 13000, 16000, 20000];
    for (let level = thresholds.length - 1; level >= 1; level--) {
      if (xp >= thresholds[level - 1]) return level;
    }
    return 1;
  }
}

export const questsService = new QuestsService();
