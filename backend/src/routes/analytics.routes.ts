import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import * as analyticsController from '../controllers/analytics.controller';

const router = Router();

// ============ DASHBOARD ============

/**
 * Get complete dashboard summary
 * GET /api/analytics/dashboard?days=30
 */
router.get('/dashboard', authRequired, analyticsController.getDashboardSummary);

// ============ USER ANALYTICS ============

/**
 * Get user analytics
 * GET /api/analytics/users?days=30
 */
router.get('/users', authRequired, analyticsController.getUserAnalytics);

/**
 * Get top rated users
 * GET /api/analytics/users/top-rated?limit=10
 */
router.get('/users/top-rated', authRequired, analyticsController.getTopRatedUsers);

/**
 * Get most active users
 * GET /api/analytics/users/most-active?limit=10&days=30
 */
router.get('/users/most-active', authRequired, analyticsController.getMostActiveUsers);

// ============ TRADE ANALYTICS ============

/**
 * Get trade analytics
 * GET /api/analytics/trades?days=30
 */
router.get('/trades', authRequired, analyticsController.getTradeAnalytics);

/**
 * Get top traders
 * GET /api/analytics/trades/top-traders?limit=10&days=30
 */
router.get('/trades/top-traders', authRequired, analyticsController.getTopTraders);

// ============ COMMUNITY ANALYTICS ============

/**
 * Get community analytics
 * GET /api/analytics/community?days=30
 */
router.get('/community', authRequired, analyticsController.getCommunityAnalytics);

// ============ SESSION ANALYTICS ============

/**
 * Get session analytics
 * GET /api/analytics/sessions?days=30
 */
router.get('/sessions', authRequired, analyticsController.getSessionAnalytics);

// ============ REVIEW ANALYTICS ============

/**
 * Get review analytics
 * GET /api/analytics/reviews?days=30
 */
router.get('/reviews', authRequired, analyticsController.getReviewAnalytics);

// ============ LISTINGS ANALYTICS ============

/**
 * Get listings analytics
 * GET /api/analytics/listings?days=30
 */
router.get('/listings', authRequired, analyticsController.getListingsAnalytics);

// ============ SYSTEM HEALTH ============

/**
 * Get system health metrics
 * GET /api/analytics/health
 */
router.get('/health', authRequired, analyticsController.getSystemHealth);

// ============ EXPORT ============

/**
 * Export analytics as CSV
 * GET /api/analytics/export/csv?days=30
 */
router.get('/export/csv', authRequired, analyticsController.exportAnalyticsCSV);

export default router;
