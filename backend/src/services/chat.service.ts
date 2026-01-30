import { prisma } from '../prisma/client';
import { Prisma } from '@prisma/client';
import { NotificationService } from './notifications.service';

export class ChatService {
  // ============ CONVERSATION METHODS ============

  async getConversations(userId: string, limit = 50, offset = 0) {
    const conversations = await prisma.conversation.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    // Fetch other user details separately
    const withOtherUsers = await Promise.all(conversations.map(async (conv) => {
      const otherUser = await prisma.profile.findUnique({
        where: { id: conv.other_user_id },
        select: {
          id: true,
          username: true,
          avatar_url: true,
          display_name: true,
          bio: true,
        },
      });

      return {
        id: conv.id,
        userId: conv.other_user_id,
        username: otherUser?.username,
        name: otherUser?.display_name || '',
        avatar: otherUser?.avatar_url,
        bio: otherUser?.bio,
        lastMessage: conv.last_message,
        lastMessageAt: conv.last_message_at,
        createdAt: conv.created_at,
      };
    }));

    return withOtherUsers;
  }

  async getConversationCount(userId: string): Promise<number> {
    return prisma.conversation.count({
      where: { user_id: userId },
    });
  }

  async getOrCreateConversation(userId: string, otherUserId: string) {
    return prisma.conversation.upsert({
      where: {
        user_id_other_user_id: {
          user_id: userId,
          other_user_id: otherUserId,
        },
      },
      update: {},
      create: {
        user_id: userId,
        other_user_id: otherUserId,
      },
    });
  }

  // ============ MESSAGE METHODS ============

  async getMessages(userId: string, otherUserId: string, limit = 50, offset = 0) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { sender_id: userId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return messages.reverse().map((msg) => ({
      id: msg.id,
      senderId: msg.sender_id,
      sender: msg.sender,
      receiverId: msg.receiver_id,
      content: msg.content,
      isRead: msg.is_read,
      readAt: msg.read_at,
      timestamp: msg.created_at,
    }));
  }

  async getMessageCount(userId: string, otherUserId: string): Promise<number> {
    return prisma.message.count({
      where: {
        OR: [
          { sender_id: userId, receiver_id: otherUserId },
          { sender_id: otherUserId, receiver_id: userId },
        ],
      },
    });
  }

  async sendMessage(senderId: string, receiverId: string, content: string) {
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    if (senderId === receiverId) {
      throw new Error('Cannot send message to yourself');
    }

    // Verify both users exist
    const [sender, receiver] = await Promise.all([
      prisma.profile.findUnique({ where: { id: senderId } }),
      prisma.profile.findUnique({ where: { id: receiverId } }),
    ]);

    if (!sender || !receiver) {
      throw new Error('One or both users do not exist');
    }

    const message = await prisma.message.create({
      data: {
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
    });

    // Update conversations for both users
    await Promise.all([
      this.updateConversationLastMessage(senderId, receiverId, content),
      this.updateConversationLastMessage(receiverId, senderId, content),
    ]);

    // Send notification to receiver
    try {
      await NotificationService.createNotification({
        user_id: receiverId,
        type: 'message',
        title: 'New Message',
        message: `${sender.username} sent you a message: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        related_id: message.id,
        related_type: 'message',
        action_url: `/chat/${senderId}`,
      });
    } catch (err) {
      console.error('Failed to send message notification:', err);
    }

    return {
      id: message.id,
      senderId: message.sender_id,
      sender: message.sender,
      receiverId: message.receiver_id,
      content: message.content,
      timestamp: message.created_at,
    };
  }

  async updateMessage(messageId: string, senderId: string, content: string) {
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender_id !== senderId) {
      throw new Error('Unauthorized: Only sender can edit message');
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: content.trim(),
      },
    });

    return {
      id: updatedMessage.id,
      senderId: updatedMessage.sender_id,
      receiverId: updatedMessage.receiver_id,
      content: updatedMessage.content,
      timestamp: updatedMessage.created_at,
    };
  }

  async deleteMessage(messageId: string, senderId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender_id !== senderId) {
      throw new Error('Unauthorized: Only sender can delete message');
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    return { success: true };
  }

  async markAsRead(userId: string, senderId: string) {
    await prisma.message.updateMany({
      where: {
        sender_id: senderId,
        receiver_id: userId,
        is_read: false,
      },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });

    return { success: true };
  }

  // ============ SEARCH & FILTER METHODS ============

  async searchMessages(userId: string, query: string, limit = 20, offset = 0) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ sender_id: userId }, { receiver_id: userId }],
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      skip: offset,
    });

    return messages.map((msg) => ({
      id: msg.id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: msg.content,
      timestamp: msg.created_at,
    }));
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    return prisma.message.count({
      where: {
        receiver_id: userId,
        is_read: false,
      },
    });
  }

  async getConversationUnreadCount(userId: string, otherUserId: string): Promise<number> {
    return prisma.message.count({
      where: {
        receiver_id: userId,
        sender_id: otherUserId,
        is_read: false,
      },
    });
  }

  async getUnreadConversations(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    const withUnreadCount = await Promise.all(conversations.map(async (conv) => {
      const otherUser = await prisma.profile.findUnique({
        where: { id: conv.other_user_id },
        select: {
          id: true,
          username: true,
          avatar_url: true,
        },
      });

      const unreadCount = await prisma.message.count({
        where: {
          sender_id: conv.other_user_id,
          receiver_id: userId,
          is_read: false,
        },
      });

      return {
        userId: otherUser?.id,
        username: otherUser?.username,
        avatar: otherUser?.avatar_url,
        unreadCount,
      };
    }));

    return withUnreadCount.filter(conv => conv.unreadCount > 0);
  }

  // ============ ANALYTICS METHODS ============

  async getChatStats(userId: string) {
    const [messagesSent, messagesReceived, conversationCount, unreadCount] = await Promise.all([
      prisma.message.count({ where: { sender_id: userId } }),
      prisma.message.count({ where: { receiver_id: userId } }),
      this.getConversationCount(userId),
      this.getUnreadMessageCount(userId),
    ]);

    return {
      messagesSent,
      messagesReceived,
      conversationCount,
      unreadCount,
    };
  }

  async getRecentChats(userId: string, limit = 10) {
    return this.getConversations(userId, limit, 0);
  }

  // ============ PRIVATE HELPER METHODS ============

  private async updateConversationLastMessage(userId: string, otherUserId: string, lastMessage: string) {
    return prisma.conversation.upsert({
      where: {
        user_id_other_user_id: {
          user_id: userId,
          other_user_id: otherUserId,
        },
      },
      update: {
        last_message: lastMessage,
        last_message_at: new Date(),
        updated_at: new Date(),
      },
      create: {
        user_id: userId,
        other_user_id: otherUserId,
        last_message: lastMessage,
        last_message_at: new Date(),
      },
    });
  }
}

export const chatService = new ChatService();
