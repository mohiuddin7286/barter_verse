import { Notification, NotificationPreference, Prisma } from '@prisma/client';
import { prisma } from '../prisma/client';

export interface CreateNotificationInput {
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_id?: string;
  related_type?: string;
  action_url?: string;
}

export interface NotificationFilters {
  is_read?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

/**
 * Service for managing notifications and notification preferences
 */
export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(input: CreateNotificationInput): Promise<Notification> {
    try {
      const notification = await prisma.notification.create({
        data: {
          user_id: input.user_id,
          type: input.type,
          title: input.title,
          message: input.message,
          related_id: input.related_id,
          related_type: input.related_type,
          action_url: input.action_url,
        },
      });

      return notification;
    } catch (error) {
      throw new Error(`Failed to create notification: ${error}`);
    }
  }

  /**
   * Get notifications for a user with filters
   */
  static async getUserNotifications(
    user_id: string,
    filters: NotificationFilters = {}
  ): Promise<{ notifications: Notification[]; total: number }> {
    try {
      const { is_read, type, limit = 20, offset = 0 } = filters;

      const where: Prisma.NotificationWhereInput = {
        user_id,
        ...(is_read !== undefined && { is_read }),
        ...(type && { type }),
      };

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { created_at: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.notification.count({ where }),
      ]);

      return { notifications, total };
    } catch (error) {
      throw new Error(`Failed to get notifications: ${error}`);
    }
  }

  /**
   * Get unread notifications count for a user
   */
  static async getUnreadCount(user_id: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: { user_id, is_read: false },
      });
    } catch (error) {
      throw new Error(`Failed to get unread count: ${error}`);
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(notification_id: string): Promise<Notification> {
    try {
      return await prisma.notification.update({
        where: { id: notification_id },
        data: {
          is_read: true,
          read_at: new Date(),
        },
      });
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error}`);
    }
  }

  /**
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(notification_ids: string[]): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: { id: { in: notification_ids } },
        data: {
          is_read: true,
          read_at: new Date(),
        },
      });

      return result.count;
    } catch (error) {
      throw new Error(`Failed to mark notifications as read: ${error}`);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(user_id: string): Promise<number> {
    try {
      const result = await prisma.notification.updateMany({
        where: { user_id, is_read: false },
        data: {
          is_read: true,
          read_at: new Date(),
        },
      });

      return result.count;
    } catch (error) {
      throw new Error(`Failed to mark all notifications as read: ${error}`);
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notification_id: string): Promise<Notification> {
    try {
      return await prisma.notification.delete({
        where: { id: notification_id },
      });
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error}`);
    }
  }

  /**
   * Delete multiple notifications
   */
  static async deleteMultiple(notification_ids: string[]): Promise<number> {
    try {
      const result = await prisma.notification.deleteMany({
        where: { id: { in: notification_ids } },
      });

      return result.count;
    } catch (error) {
      throw new Error(`Failed to delete notifications: ${error}`);
    }
  }

  /**
   * Clear all notifications for a user
   */
  static async clearAll(user_id: string): Promise<number> {
    try {
      const result = await prisma.notification.deleteMany({
        where: { user_id },
      });

      return result.count;
    } catch (error) {
      throw new Error(`Failed to clear notifications: ${error}`);
    }
  }

  /**
   * Get notification preference for a user
   */
  static async getPreference(user_id: string): Promise<NotificationPreference | null> {
    try {
      let pref = await prisma.notificationPreference.findUnique({
        where: { user_id },
      });

      // Create default preference if doesn't exist
      if (!pref) {
        pref = await prisma.notificationPreference.create({
          data: { user_id },
        });
      }

      return pref;
    } catch (error) {
      throw new Error(`Failed to get notification preference: ${error}`);
    }
  }

  /**
   * Update notification preferences for a user
   */
  static async updatePreference(
    user_id: string,
    updates: Partial<NotificationPreference>
  ): Promise<NotificationPreference> {
    try {
      // Create default if doesn't exist
      let pref = await prisma.notificationPreference.findUnique({
        where: { user_id },
      });

      if (!pref) {
        pref = await prisma.notificationPreference.create({
          data: { user_id },
        });
      }

      // Update with new values
      const { id, created_at, ...updateData } = updates;
      return await prisma.notificationPreference.update({
        where: { user_id },
        data: updateData as Prisma.NotificationPreferenceUpdateInput,
      });
    } catch (error) {
      throw new Error(`Failed to update notification preference: ${error}`);
    }
  }

  /**
   * Check if notifications are enabled for a specific type
   */
  static async isNotificationEnabled(
    user_id: string,
    type: string,
    channel: 'email' | 'in_app' = 'in_app'
  ): Promise<boolean> {
    try {
      const pref = await this.getPreference(user_id);
      
      if (!pref) return true; // Default to enabled

      // Check general enable
      const channelKey = channel === 'email' ? 'email_enabled' : 'in_app_enabled';
      if (!pref[channelKey as keyof NotificationPreference]) {
        return false;
      }

      // Check specific type enable
      const typeKey = `${channel}_${type}` as keyof NotificationPreference;
      if (typeKey in pref) {
        return pref[typeKey] === true;
      }

      return true;
    } catch (error) {
      return true; // Default to enabled on error
    }
  }

  /**
   * Get recent notifications for quick view
   */
  static async getRecentNotifications(user_id: string, limit = 5): Promise<Notification[]> {
    try {
      return await prisma.notification.findMany({
        where: { user_id },
        orderBy: { created_at: 'desc' },
        take: limit,
      });
    } catch (error) {
      throw new Error(`Failed to get recent notifications: ${error}`);
    }
  }

  /**
   * Get notifications grouped by type
   */
  static async getNotificationsByType(
    user_id: string
  ): Promise<{ [key: string]: Notification[] }> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { user_id },
        orderBy: { created_at: 'desc' },
      });

      return notifications.reduce(
        (acc, notif) => {
          if (!acc[notif.type]) {
            acc[notif.type] = [];
          }
          acc[notif.type].push(notif);
          return acc;
        },
        {} as { [key: string]: Notification[] }
      );
    } catch (error) {
      throw new Error(`Failed to get notifications by type: ${error}`);
    }
  }

  /**
   * Batch create notifications for multiple users
   */
  static async createBatchNotifications(
    user_ids: string[],
    input: Omit<CreateNotificationInput, 'user_id'>
  ): Promise<Notification[]> {
    try {
      return await Promise.all(
        user_ids.map((user_id) =>
          this.createNotification({ ...input, user_id })
        )
      );
    } catch (error) {
      throw new Error(`Failed to create batch notifications: ${error}`);
    }
  }
}
