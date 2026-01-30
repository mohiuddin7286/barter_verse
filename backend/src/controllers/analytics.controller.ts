import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { AppError } from '../middleware/error.middleware';

/**
 * Analytics Controller
 * Handles analytics dashboard endpoints
 */

// ============ DASHBOARD ENDPOINTS ============

/**
 * Get complete dashboard summary
 * GET /api/analytics/dashboard
 */
export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const summary = await analyticsService.getDashboardSummary(Number(days));

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch dashboard summary');
  }
};

// ============ USER ANALYTICS ============

/**
 * Get user analytics
 * GET /api/analytics/users
 */
export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const analytics = await analyticsService.getUserAnalytics(Number(days));

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch user analytics');
  }
};

/**
 * Get top rated users
 * GET /api/analytics/users/top-rated
 */
export const getTopRatedUsers = async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const users = await analyticsService.getTopRatedUsers(Number(limit));

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch top rated users');
  }
};

/**
 * Get most active users
 * GET /api/analytics/users/most-active
 */
export const getMostActiveUsers = async (req: Request, res: Response) => {
  try {
    const { limit = 10, days = 30 } = req.query;

    const users = await analyticsService.getMostActiveUsers(Number(limit), Number(days));

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch most active users');
  }
};

// ============ TRADE ANALYTICS ============

/**
 * Get trade analytics
 * GET /api/analytics/trades
 */
export const getTradeAnalytics = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const analytics = await analyticsService.getTradeAnalytics(Number(days));

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch trade analytics');
  }
};

/**
 * Get top traders
 * GET /api/analytics/trades/top-traders
 */
export const getTopTraders = async (req: Request, res: Response) => {
  try {
    const { limit = 10, days = 30 } = req.query;

    const traders = await analyticsService.getTopTraders(Number(limit), Number(days));

    res.json({
      success: true,
      data: traders,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch top traders');
  }
};

// ============ COMMUNITY ANALYTICS ============

/**
 * Get community analytics
 * GET /api/analytics/community
 */
export const getCommunityAnalytics = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const analytics = await analyticsService.getCommunityAnalytics(Number(days));

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch community analytics');
  }
};

// ============ SESSION ANALYTICS ============

/**
 * Get skillshare session analytics
 * GET /api/analytics/sessions
 */
export const getSessionAnalytics = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const analytics = await analyticsService.getSessionAnalytics(Number(days));

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch session analytics');
  }
};

// ============ REVIEW ANALYTICS ============

/**
 * Get review analytics
 * GET /api/analytics/reviews
 */
export const getReviewAnalytics = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const analytics = await analyticsService.getReviewAnalytics(Number(days));

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch review analytics');
  }
};

// ============ LISTINGS ANALYTICS ============

/**
 * Get listings analytics
 * GET /api/analytics/listings
 */
export const getListingsAnalytics = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const analytics = await analyticsService.getListingsAnalytics(Number(days));

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch listings analytics');
  }
};

// ============ SYSTEM HEALTH ============

/**
 * Get system health metrics
 * GET /api/analytics/health
 */
export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    const health = await analyticsService.getSystemHealthAnalytics();

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch system health');
  }
};

// ============ EXPORT ============

/**
 * Export analytics as CSV
 * GET /api/analytics/export/csv
 */
export const exportAnalyticsCSV = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const csv = await analyticsService.exportAnalyticsAsCSV(Number(days));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics.csv"');
    res.send(csv);
  } catch (error) {
    throw new AppError(500, 'Failed to export analytics');
  }
};
