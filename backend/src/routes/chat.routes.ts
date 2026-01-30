import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import * as chatController from '../controllers/chat.controller';

const router = Router();

// ============ CONVERSATION ENDPOINTS ============

/**
 * Get all conversations for current user
 * GET /api/chat/conversations
 */
router.get('/conversations', authRequired, chatController.getConversations);

/**
 * Get online users
 * GET /api/chat/online-users
 */
router.get('/online-users', authRequired, chatController.getOnlineUsers);

/**
 * Check if specific user is online
 * GET /api/chat/user-status/:userId
 */
router.get('/user-status/:userId', authRequired, chatController.getUserStatus);

// ============ MESSAGE ENDPOINTS ============

/**
 * Get messages with specific user
 * GET /api/chat/messages/:otherUserId
 */
router.get('/messages/:otherUserId', authRequired, chatController.getMessages);

/**
 * Send a message via REST
 * POST /api/chat/send
 */
router.post('/send', authRequired, chatController.sendMessage);

/**
 * Update a message
 * PUT /api/chat/messages/:messageId
 */
router.put('/messages/:messageId', authRequired, chatController.updateMessage);

/**
 * Delete a message
 * DELETE /api/chat/messages/:messageId
 */
router.delete('/messages/:messageId', authRequired, chatController.deleteMessage);

/**
 * Mark messages as read
 * POST /api/chat/mark-read
 */
router.post('/mark-read', authRequired, chatController.markAsRead);

// ============ SEARCH & ANALYTICS ============

/**
 * Search messages
 * GET /api/chat/search?q=query
 */
router.get('/search', authRequired, chatController.searchMessages);

/**
 * Get chat statistics
 * GET /api/chat/stats
 */
router.get('/stats', authRequired, chatController.getChatStats);

/**
 * Get unread message count
 * GET /api/chat/unread-count
 */
router.get('/unread-count', authRequired, chatController.getUnreadCount);

/**
 * Get recent chats
 * GET /api/chat/recent
 */
router.get('/recent', authRequired, chatController.getRecentChats);

export default router;
