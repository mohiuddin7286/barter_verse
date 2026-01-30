import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { QuestsService } from '../services/quests.service';
import { createQuestSchema } from '../services/quests.service';
import { AppError } from '../middleware/error.middleware';
import { prisma } from '../prisma/client';

const questsService = new QuestsService();

// ============ QUEST MANAGEMENT (ADMIN) ============

export const createQuest = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createQuestSchema.parse(req.body);
    const quest = await questsService.createQuest(validatedData);
    res.status(201).json({ success: true, quest });
  } catch (error: any) {
    throw new AppError(400, error.message || 'Failed to create quest');
  }
};

export const getActiveQuests = async (req: Request, res: Response) => {
  try {
    const { category, season } = req.query;
    const quests = await questsService.getActiveQuests(
      category as string | undefined,
      season as string | undefined
    );
    res.json({ success: true, quests });
  } catch (error: any) {
    throw new AppError(500, 'Failed to fetch quests');
  }
};

export const getDailyQuests = async (_req: Request, res: Response) => {
  try {
    const quests = await questsService.getDailyQuests();
    res.json({ success: true, quests });
  } catch (error: any) {
    throw new AppError(500, 'Failed to fetch daily quests');
  }
};

export const getWeeklyQuests = async (_req: Request, res: Response) => {
  try {
    const quests = await questsService.getWeeklyQuests();
    res.json({ success: true, quests });
  } catch (error: any) {
    throw new AppError(500, 'Failed to fetch weekly quests');
  }
};

export const getSeasonalQuests = async (req: Request, res: Response) => {
  try {
    const { season } = req.params;
    const quests = await questsService.getSeasonalQuests(season);
    res.json({ success: true, quests });
  } catch (error: any) {
    throw new AppError(500, 'Failed to fetch seasonal quests');
  }
};

export const getQuestById = async (req: Request, res: Response) => {
  try {
    const { questId } = req.params;
    const quest = await questsService.getQuestById(questId);
    res.json({ success: true, quest });
  } catch (error: any) {
    throw new AppError(404, error.message || 'Quest not found');
  }
};

export const toggleQuestActive = async (req: AuthRequest, res: Response) => {
  try {
    const { questId } = req.params;
    const { is_active } = req.body;
    const quest = await questsService.toggleQuestActive(questId, is_active);
    res.json({ success: true, quest });
  } catch (error: any) {
    throw new AppError(400, error.message || 'Failed to toggle quest');
  }
};

// ============ QUEST COMPLETION ============

export const getUserQuests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category, limit = 10, page = 1 } = req.query;
    const quests = await questsService.getUserQuestProgress(
      userId,
      category as string | undefined
    );
    res.json({ success: true, quests });
  } catch (error: any) {
    throw new AppError(500, 'Failed to fetch user quests');
  }
};

export const getQuestCompletion = async (req: AuthRequest, res: Response) => {
  try {
    const { questId } = req.params;
    const userId = req.user!.id;
    const completion = await questsService.getQuestCompletion(questId, userId);
    res.json({ success: true, completion });
  } catch (error: any) {
    throw new AppError(404, error.message || 'Quest completion not found');
  }
};

export const updateQuestProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { questId } = req.params;
    const { progress } = req.body;
    const userId = req.user!.id;
    const completion = await questsService.updateQuestProgress(
      questId,
      userId,
      progress
    );
    res.json({ success: true, completion });
  } catch (error: any) {
    throw new AppError(400, error.message || 'Failed to update progress');
  }
};

export const completeQuest = async (req: AuthRequest, res: Response) => {
  try {
    const { questId } = req.params;
    const userId = req.user!.id;
    const result = await questsService.completeQuest(questId, userId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    throw new AppError(400, error.message || 'Failed to complete quest');
  }
};

export const resetQuestProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { questId } = req.params;
    const userId = req.user!.id;
    // Mark completion as incomplete for this quest
    const completion = await questsService.getQuestCompletion(questId, userId);
    if (completion) {
      await questsService.updateQuestProgress(questId, userId, 0);
    }
    res.json({ success: true, message: 'Quest progress reset' });
  } catch (error: any) {
    throw new AppError(400, error.message || 'Failed to reset progress');
  }
};

// ============ ACHIEVEMENTS ============

export const getUserAchievements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const achievements = await questsService.getUserAchievements(userId);
    res.json({ success: true, achievements });
  } catch (error: any) {
    throw new AppError(500, 'Failed to fetch achievements');
  }
};

export const getUserAchievementsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const achievements = await questsService.getUserAchievements(userId);
    res.json({ success: true, achievements });
  } catch (error: any) {
    throw new AppError(500, 'Failed to fetch achievements');
  }
};

export const getAchievementById = async (req: Request, res: Response) => {
  try {
    const { achievementId } = req.params;
    // TODO: Implement when Achievement model exists in Prisma
    throw new AppError(501, 'Achievement system not yet implemented');
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Failed to fetch achievement');
  }
};

// ============ LEVELS & XP ============

export const getUserLevel = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const stats = await questsService.getUserXPStats(userId);
    res.json({ success: true, ...stats });
  } catch (error: any) {
    throw new AppError(500, 'Failed to fetch level information');
  }
};

export const getUserLevelByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const stats = await questsService.getUserXPStats(userId);
    res.json({ success: true, ...stats });
  } catch (error: any) {
    throw new AppError(500, 'Failed to fetch level information');
  }
};

export const addXPToUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, xp_amount, reason } = req.body;
    const result = await questsService.addXPToUser(userId, xp_amount, reason);
    res.json({ success: true, ...result });
  } catch (error: any) {
    throw new AppError(400, error.message || 'Failed to add XP');
  }
};

// ============ LEADERBOARDS ============

export const getTopUsersByXP = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const users = await questsService.getXPLeaderboard(parseInt(limit as string));
    res.json({ success: true, users });
  } catch (error: any) {
    throw new AppError(500, 'Failed to fetch leaderboard');
  }
};

export const getTopUsersByLevel = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const users = await questsService.getLevelLeaderboard(parseInt(limit as string));
    res.json({ success: true, users });
  } catch (error: any) {
    throw new AppError(500, 'Failed to fetch leaderboard');
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const stats = await questsService.getUserXPStats(userId);
    res.json({ success: true, stats });
  } catch (error: any) {
    throw new AppError(500, 'Failed to fetch user stats');
  }
};

export const getGlobalStats = async (_req: Request, res: Response) => {
  try {
    const stats = await questsService.getQuestStatistics();
    res.json({ success: true, stats });
  } catch (error: any) {
    throw new AppError(500, 'Failed to fetch global stats');
  }
};
