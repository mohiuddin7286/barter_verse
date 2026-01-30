import express from 'express';
import { authRequired } from '../middleware/auth.middleware';
import * as questsController from '../controllers/quests.controller';

const router = express.Router();

// ============ QUEST MANAGEMENT (ADMIN) ============

// Create quest (admin only)
router.post('/admin/create', authRequired, questsController.createQuest);

// Get all active quests by category/season
router.get('/active', questsController.getActiveQuests);

// Get specific quest types
router.get('/daily', questsController.getDailyQuests);
router.get('/weekly', questsController.getWeeklyQuests);
router.get('/seasonal/:season', questsController.getSeasonalQuests);

// Get specific quest
router.get('/:questId', questsController.getQuestById);

// Toggle quest active status (admin)
router.patch('/:questId/toggle', authRequired, questsController.toggleQuestActive);

// ============ QUEST COMPLETION (USER) ============

// Get user's active quests
router.get('/user/active', authRequired, questsController.getUserQuests);

// Get specific quest completion status
router.get('/:questId/completion', authRequired, questsController.getQuestCompletion);

// Update quest progress
router.patch('/:questId/progress', authRequired, questsController.updateQuestProgress);

// Complete a quest
router.post('/:questId/complete', authRequired, questsController.completeQuest);

// Reset quest progress
router.post('/:questId/reset', authRequired, questsController.resetQuestProgress);

// ============ ACHIEVEMENTS ============

// Get current user's achievements
router.get('/achievements/me', authRequired, questsController.getUserAchievements);

// Get specific user's achievements
router.get('/achievements/user/:userId', questsController.getUserAchievementsByUser);

// Get achievement details
router.get('/achievement/:achievementId', questsController.getAchievementById);

// ============ LEVELS & XP ============

// Get current user's level
router.get('/level/me', authRequired, questsController.getUserLevel);

// Get specific user's level
router.get('/level/:userId', questsController.getUserLevelByUser);

// Add XP to user (admin)
router.post('/xp/add', authRequired, questsController.addXPToUser);

// ============ LEADERBOARDS ============

// XP leaderboard
router.get('/leaderboard/xp', questsController.getTopUsersByXP);

// Level leaderboard
router.get('/leaderboard/level', questsController.getTopUsersByLevel);

// User stats
router.get('/stats/me', authRequired, questsController.getUserStats);

// Global stats
router.get('/stats/global', questsController.getGlobalStats);

export default router;
