import { Request, Response } from 'express';
import { prisma } from '../prisma/client';

// 1. Get All Conversations for current user
export const getConversations = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user_id: userId }, { other_user_id: userId }]
      },
      orderBy: { updated_at: 'desc' },
      include: {
        user: { select: { id: true, username: true, avatar_url: true } } // Fetch details
      }
    });

    // Format data to show the "Other" user correctly
    const formatted = await Promise.all(conversations.map(async (conv) => {
      const otherUserId = conv.user_id === userId ? conv.other_user_id : conv.user_id;
      const otherUser = await prisma.profile.findUnique({
        where: { id: otherUserId },
        select: { id: true, username: true, avatar_url: true, display_name: true }
      });
      
      return {
        id: conv.id,
        otherUser,
        lastMessage: conv.last_message,
        time: conv.updated_at
      };
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch chats" });
  }
};

// 2. Get Messages for a specific chat
export const getMessages = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { otherUserId } = req.params;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: userId }
        ]
      },
      orderBy: { created_at: 'asc' } // Oldest first
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

// 3. Send a Message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!content || !receiverId) return res.status(400).json({ message: "Missing data" });

    // A. Save Message
    const message = await prisma.message.create({
      data: {
        sender_id: senderId,
        receiver_id: receiverId,
        content
      }
    });

    // B. Update/Create Conversation for Sender
    await prisma.conversation.upsert({
      where: { user_id_other_user_id: { user_id: senderId, other_user_id: receiverId } },
      update: { last_message: content, last_message_at: new Date() },
      create: { user_id: senderId, other_user_id: receiverId, last_message: content, last_message_at: new Date() }
    });

    // C. Update/Create Conversation for Receiver (So they see it too)
    await prisma.conversation.upsert({
      where: { user_id_other_user_id: { user_id: receiverId, other_user_id: senderId } },
      update: { last_message: content, last_message_at: new Date() },
      create: { user_id: receiverId, other_user_id: senderId, last_message: content, last_message_at: new Date() }
    });

    res.json({ success: true, data: message });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};