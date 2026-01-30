import { Request, Response } from 'express';
import { chatService } from '../services/chat.service';
import { getChatWebSocketService } from '../services/websocket.service';
import { AppError } from '../middleware/error.middleware';

// ============ CONVERSATION ENDPOINTS ============

/**
 * Get all conversations for the current user
 * GET /api/chat/conversations
 */
export const getConversations = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    const conversations = await chatService.getConversations(userId, Number(limit), Number(offset));
    const total = await chatService.getConversationCount(userId);

    res.json({
      success: true,
      data: conversations,
      pagination: { limit: Number(limit), offset: Number(offset), total },
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch conversations');
  }
};

/**
 * Get online users
 * GET /api/chat/online-users
 */
export const getOnlineUsers = async (req: Request, res: Response) => {
  try {
    const wsService = getChatWebSocketService();
    const onlineUsers = wsService.getOnlineUsers();

    res.json({
      success: true,
      data: { onlineUsers },
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch online users');
  }
};

/**
 * Check if specific user is online
 * GET /api/chat/user-status/:userId
 */
export const getUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const wsService = getChatWebSocketService();
    const isOnline = wsService.isUserOnline(userId);

    res.json({
      success: true,
      data: { userId, isOnline },
    });
  } catch (error) {
    throw new AppError(500, 'Failed to check user status');
  }
};

// ============ MESSAGE ENDPOINTS ============

/**
 * Get messages between current user and another user
 * GET /api/chat/messages/:otherUserId
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { otherUserId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Mark messages as read
    await chatService.markAsRead(userId, otherUserId);

    const messages = await chatService.getMessages(userId, otherUserId, Number(limit), Number(offset));
    const total = await chatService.getMessageCount(userId, otherUserId);

    res.json({
      success: true,
      data: messages,
      pagination: { limit: Number(limit), offset: Number(offset), total },
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch messages');
  }
};

/**
 * Send a message via REST (also triggers WebSocket if user is online)
 * POST /api/chat/send
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      throw new AppError(400, 'Missing receiverId or content');
    }

    const message = await chatService.sendMessage(senderId, receiverId, content);

    // WebSocket notification would be sent from here if available
    // Currently using polling mechanism on frontend

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Failed to send message');
  }
};

/**
 * Update a message
 * PUT /api/chat/messages/:messageId
 */
export const updateMessage = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      throw new AppError(400, 'Content is required');
    }

    const message = await chatService.updateMessage(messageId, userId, content);

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, error instanceof Error ? error.message : 'Failed to update message');
  }
};

/**
 * Delete a message
 * DELETE /api/chat/messages/:messageId
 */
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { messageId } = req.params;

    await chatService.deleteMessage(messageId, userId);

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, error instanceof Error ? error.message : 'Failed to delete message');
  }
};

/**
 * Mark messages as read
 * POST /api/chat/mark-read
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { senderId } = req.body;

    if (!senderId) {
      throw new AppError(400, 'senderId is required');
    }

    await chatService.markAsRead(userId, senderId);

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Failed to mark messages as read');
  }
};

// ============ SEARCH & ANALYTICS ============

/**
 * Search messages
 * GET /api/chat/search
 */
export const searchMessages = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { q, limit = 20, offset = 0 } = req.query;

    if (!q) {
      throw new AppError(400, 'Search query is required');
    }

    const messages = await chatService.searchMessages(userId, String(q), Number(limit), Number(offset));

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'Failed to search messages');
  }
};

/**
 * Get chat statistics for current user
 * GET /api/chat/stats
 */
export const getChatStats = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    const stats = await chatService.getChatStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch chat statistics');
  }
};

/**
 * Get unread message count
 * GET /api/chat/unread-count
 */
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    const unreadCount = await chatService.getUnreadMessageCount(userId);

    res.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch unread count');
  }
};

/**
 * Get recent conversations with pagination
 * GET /api/chat/recent
 */
export const getRecentChats = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const chats = await chatService.getRecentChats(userId, Number(limit));

    res.json({
      success: true,
      data: chats,
    });
  } catch (error) {
    throw new AppError(500, 'Failed to fetch recent chats');
  }
};
