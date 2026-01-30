import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notifications.service';
import { AuthRequest } from '../types/express';
import { AppError } from '../middleware/error.middleware';

/**
 * Controller for notification endpoints
 */
export class NotificationController {
  /**
   * Get all notifications for authenticated user
   * GET /api/notifications
   */
  static async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        throw new AppError(401, 'Unauthorized');
      }

      const { is_read, type, limit = 20, offset = 0 } = req.query;

      const filters = {
        is_read: is_read ? is_read === 'true' : undefined,
        type: type as string | undefined,
        limit: parseInt(limit as string) || 20,
        offset: parseInt(offset as string) || 0,
      };

      const { notifications, total } = await NotificationService.getUserNotifications(
        user_id,
        filters
      );

      res.json({
        success: true,
        data: {
          notifications,
          total,
          limit: filters.limit,
          offset: filters.offset,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent notifications for dropdown
   * GET /api/notifications/recent
   */
  static async getRecentNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        throw new AppError(401, 'Unauthorized');
      }

      const limit = parseInt(req.query.limit as string) || 5;
      const notifications = await NotificationService.getRecentNotifications(user_id, limit);
      const unreadCount = await NotificationService.getUnreadCount(user_id);

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get unread notification count
   * GET /api/notifications/unread
   */
  static async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        throw new AppError(401, 'Unauthorized');
      }

      const unreadCount = await NotificationService.getUnreadCount(user_id);

      res.json({
        success: true,
        data: { unreadCount },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notifications grouped by type
   * GET /api/notifications/grouped
   */
  static async getGroupedNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        throw new AppError(401, 'Unauthorized');
      }

      const grouped = await NotificationService.getNotificationsByType(user_id);

      res.json({
        success: true,
        data: grouped,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a single notification as read
   * PATCH /api/notifications/:notificationId/read
   */
  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const user_id = req.user?.id;

      if (!user_id) {
        throw new AppError(401, 'Unauthorized');
      }

      const notification = await NotificationService.markAsRead(notificationId);

      if (notification.user_id !== user_id) {
        throw new AppError(403, 'Forbidden');
      }

      res.json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark multiple notifications as read
   * POST /api/notifications/read-multiple
   */
  static async markMultipleAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        throw new AppError(401, 'Unauthorized');
      }

      const { notification_ids } = req.body;

      if (!Array.isArray(notification_ids)) {
        throw new AppError(400, 'notification_ids must be an array');
      }

      const count = await NotificationService.markMultipleAsRead(notification_ids);

      res.json({
        success: true,
        data: { marked: count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   * POST /api/notifications/read-all
   */
  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        throw new AppError(401, 'Unauthorized');
      }

      const count = await NotificationService.markAllAsRead(user_id);

      res.json({
        success: true,
        data: { marked: count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a notification
   * DELETE /api/notifications/:notificationId
   */
  static async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.params;
      const user_id = req.user?.id;

      if (!user_id) {
        throw new AppError(401, 'Unauthorized');
      }

      const notification = await NotificationService.deleteNotification(notificationId);

      if (notification.user_id !== user_id) {
        throw new AppError(403, 'Forbidden');
      }

      res.json({
        success: true,
        data: { deleted: true },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete multiple notifications
   * POST /api/notifications/delete-multiple
   */
  static async deleteMultiple(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        throw new AppError(401, 'Unauthorized');
      }

      const { notification_ids } = req.body;

      if (!Array.isArray(notification_ids)) {
        throw new AppError(400, 'notification_ids must be an array');
      }

      const count = await NotificationService.deleteMultiple(notification_ids);

      res.json({
        success: true,
        data: { deleted: count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear all notifications
   * DELETE /api/notifications/clear-all
   */
  static async clearAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        throw new AppError(401, 'Unauthorized');
      }

      const count = await NotificationService.clearAll(user_id);

      res.json({
        success: true,
        data: { cleared: count },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notification preferences
   * GET /api/notifications/preferences
   */
  static async getPreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        throw new AppError(401, 'Unauthorized');
      }

      const preferences = await NotificationService.getPreference(user_id);

      res.json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update notification preferences
   * PATCH /api/notifications/preferences
   */
  static async updatePreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        throw new AppError(401, 'Unauthorized');
      }

      const preferences = await NotificationService.updatePreference(user_id, req.body);

      res.json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Test notification (admin only)
   * POST /api/notifications/test
   */
  static async testNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        throw new AppError(401, 'Unauthorized');
      }

      const { title = 'Test Notification', message = 'This is a test notification' } = req.body;

      const notification = await NotificationService.createNotification({
        user_id,
        type: 'test',
        title,
        message,
      });

      res.json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }
}
