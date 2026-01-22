import { Router } from 'express';
import { authRequired } from '../middleware/auth.middleware';
import * as chatController from '../controllers/chat.controller';

const router = Router();

// Get list of all conversations for the current user
router.get('/conversations', authRequired, chatController.getConversations);

// Get messages exchanged with a specific user
router.get('/messages/:otherUserId', authRequired, chatController.getMessages);

// Send a new message
router.post('/send', authRequired, chatController.sendMessage);

// Get unread count (Optional, if you implemented this in controller)
// router.get('/unread-count', authMiddleware, chatController.getUnreadCount);

export default router;
