import express from 'express';
import { NotificationController } from '../controllers/notifications.controller';
import { authRequired } from '../middleware/auth.middleware';

const router = express.Router();

// All notification routes require authentication
router.use(authRequired);

// Get notifications with filters
router.get('/', NotificationController.getNotifications);

// Get recent notifications (for dropdown)
router.get('/recent', NotificationController.getRecentNotifications);

// Get unread count
router.get('/unread', NotificationController.getUnreadCount);

// Get notifications grouped by type
router.get('/grouped', NotificationController.getGroupedNotifications);

// Mark single as read
router.patch('/:notificationId/read', NotificationController.markAsRead);

// Mark multiple as read
router.post('/read-multiple', NotificationController.markMultipleAsRead);

// Mark all as read
router.post('/read-all', NotificationController.markAllAsRead);

// Delete single notification
router.delete('/:notificationId', NotificationController.deleteNotification);

// Delete multiple notifications
router.post('/delete-multiple', NotificationController.deleteMultiple);

// Clear all notifications
router.delete('/clear-all', NotificationController.clearAll);

// Get preferences
router.get('/preferences', NotificationController.getPreferences);

// Update preferences
router.patch('/preferences', NotificationController.updatePreferences);

// Test notification (for development)
router.post('/test', NotificationController.testNotification);

export default router;
