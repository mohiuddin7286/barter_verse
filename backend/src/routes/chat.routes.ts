import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Send a message
router.post('/send', verifyToken, async (req: any, res: Response) => {
  try {
    const senderId = req.user.id;
    const { receiver_id, content } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: receiver_id, content',
      });
    }

    if (senderId === receiver_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself',
      });
    }

    // Verify receiver exists
    const receiver = await prisma.profile.findUnique({
      where: { id: receiver_id },
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        sender_id: senderId,
        receiver_id,
        content,
      },
      include: {
        sender: { select: { id: true, username: true, avatar_url: true } },
        receiver: { select: { id: true, username: true, avatar_url: true } },
      },
    });

    // Update or create conversation
    await prisma.conversation.upsert({
      where: {
        user_id_other_user_id: {
          user_id: senderId,
          other_user_id: receiver_id,
        },
      },
      update: {
        last_message: content,
        last_message_at: new Date(),
      },
      create: {
        user_id: senderId,
        other_user_id: receiver_id,
        last_message: content,
        last_message_at: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get conversation with a user
router.get('/conversation/:user_id', verifyToken, async (req: any, res: Response) => {
  try {
    const currentUserId = req.user.id;
    const { user_id } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    if (currentUserId === user_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot get conversation with yourself',
      });
    }

    // Get all messages between the two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: currentUserId, receiver_id: user_id },
          { sender_id: user_id, receiver_id: currentUserId },
        ],
      },
      include: {
        sender: { select: { id: true, username: true, avatar_url: true } },
        receiver: { select: { id: true, username: true, avatar_url: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        sender_id: user_id,
        receiver_id: currentUserId,
        is_read: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    // Get the other user's info
    const otherUser = await prisma.profile.findUnique({
      where: { id: user_id },
      select: { id: true, username: true, avatar_url: true, rating: true, bio: true },
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        otherUser,
        total: messages.length,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all conversations for current user
router.get('/conversations', verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // Get all conversations
    const conversations = await prisma.conversation.findMany({
      where: { user_id: userId },
      include: {
        user: { select: { id: true, username: true, avatar_url: true } },
      },
      orderBy: { last_message_at: 'desc' },
    });

    // Enrich with unread count
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            sender_id: conv.other_user_id,
            receiver_id: userId,
            is_read: false,
          },
        });

        const otherUser = await prisma.profile.findUnique({
          where: { id: conv.other_user_id },
          select: { id: true, username: true, avatar_url: true },
        });

        return {
          ...conv,
          otherUser,
          unread_count: unreadCount,
        };
      })
    );

    res.json({
      success: true,
      data: conversationsWithUnread,
      total: conversationsWithUnread.length,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get unread messages count
router.get('/unread-count', verifyToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const unreadCount = await prisma.message.count({
      where: {
        receiver_id: userId,
        is_read: false,
      },
    });

    res.json({
      success: true,
      data: { unread_count: unreadCount },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Mark message as read
router.put('/:message_id/read', verifyToken, async (req: any, res: Response) => {
  try {
    const { message_id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: message_id },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    if (message.receiver_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to mark this message as read',
      });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: message_id },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Message marked as read',
      data: updatedMessage,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete message (soft delete - just update is_deleted or hard delete)
router.delete('/:message_id', verifyToken, async (req: any, res: Response) => {
  try {
    const { message_id } = req.params;

    const message = await prisma.message.findUnique({
      where: { id: message_id },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only sender can delete their message
    if (message.sender_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this message',
      });
    }

    await prisma.message.delete({
      where: { id: message_id },
    });

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
