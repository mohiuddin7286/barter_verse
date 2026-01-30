import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '../prisma/client';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

interface MessagePayload {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
}

interface TypingPayload {
  userId: string;
  username: string;
  receiverId: string;
  isTyping: boolean;
}

interface OnlinePayload {
  userId: string;
  username: string;
  isOnline: boolean;
}

export class ChatWebSocketService {
  private io: SocketIOServer;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGINS
          ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
          : ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication failed: No token provided'));
        }

        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded: any = jwt.verify(token, jwtSecret);

        socket.userId = decoded.id;

        // Get user info
        const user = await prisma.profile.findUnique({
          where: { id: decoded.id },
          select: { id: true, username: true, avatar_url: true },
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.username = user.username;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`✅ User connected: ${socket.username} (${socket.userId})`);

      // Track user connection
      if (socket.userId) {
        if (!this.userSockets.has(socket.userId)) {
          this.userSockets.set(socket.userId, new Set());
        }
        this.userSockets.get(socket.userId)!.add(socket.id);
        this.socketUsers.set(socket.id, socket.userId);

        // Broadcast user online status
        this.broadcastUserOnlineStatus(socket.userId, true);
      }

      // ============ MESSAGE EVENTS ============

      socket.on('send_message', (payload: MessagePayload, callback) => {
        this.handleSendMessage(socket, payload, callback);
      });

      socket.on('typing', (payload: TypingPayload) => {
        this.handleTyping(socket, payload);
      });

      socket.on('stop_typing', (payload: { receiverId: string }) => {
        this.handleStopTyping(socket, payload);
      });

      socket.on('mark_as_read', (payload: { senderId: string }) => {
        this.handleMarkAsRead(socket, payload);
      });

      // ============ CONVERSATION EVENTS ============

      socket.on('join_conversation', (payload: { otherUserId: string }) => {
        this.handleJoinConversation(socket, payload);
      });

      socket.on('leave_conversation', (payload: { otherUserId: string }) => {
        this.handleLeaveConversation(socket, payload);
      });

      socket.on('delete_message', (payload: { messageId: string }, callback) => {
        this.handleDeleteMessage(socket, payload, callback);
      });

      // ============ DISCONNECT EVENTS ============

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.username}:`, error);
      });
    });
  }

  // ============ MESSAGE HANDLERS ============

  private async handleSendMessage(
    socket: AuthenticatedSocket,
    payload: MessagePayload,
    callback?: Function
  ): Promise<void> {
    try {
      if (!socket.userId) {
        callback?.({ success: false, error: 'Not authenticated' });
        return;
      }

      const { receiverId, content } = payload;

      if (!content || !receiverId) {
        callback?.({ success: false, error: 'Missing content or receiverId' });
        return;
      }

      // Save message to database
      const message = await prisma.message.create({
        data: {
          sender_id: socket.userId,
          receiver_id: receiverId,
          content,
        },
        include: {
          sender: { select: { id: true, username: true, avatar_url: true } },
        },
      });

      // Update/Create conversations
      await Promise.all([
        prisma.conversation.upsert({
          where: {
            user_id_other_user_id: {
              user_id: socket.userId,
              other_user_id: receiverId,
            },
          },
          update: { last_message: content, last_message_at: new Date(), updated_at: new Date() },
          create: {
            user_id: socket.userId,
            other_user_id: receiverId,
            last_message: content,
            last_message_at: new Date(),
          },
        }),
        prisma.conversation.upsert({
          where: {
            user_id_other_user_id: {
              user_id: receiverId,
              other_user_id: socket.userId,
            },
          },
          update: { last_message: content, last_message_at: new Date(), updated_at: new Date() },
          create: {
            user_id: receiverId,
            other_user_id: socket.userId,
            last_message: content,
            last_message_at: new Date(),
          },
        }),
      ]);

      // Emit to receiver
      this.emitToUser(receiverId, 'receive_message', {
        id: message.id,
        sender: message.sender,
        content,
        timestamp: message.created_at,
      });

      // Acknowledge to sender
      callback?.({ success: true, messageId: message.id });
    } catch (error) {
      console.error('Error sending message:', error);
      callback?.({ success: false, error: 'Failed to send message' });
    }
  }

  private handleTyping(socket: AuthenticatedSocket, payload: TypingPayload): void {
    const { receiverId } = payload;

    this.emitToUser(receiverId, 'user_typing', {
      userId: socket.userId,
      username: socket.username,
      isTyping: true,
    });
  }

  private handleStopTyping(socket: AuthenticatedSocket, payload: { receiverId: string }): void {
    const { receiverId } = payload;

    this.emitToUser(receiverId, 'user_typing', {
      userId: socket.userId,
      username: socket.username,
      isTyping: false,
    });
  }

  private async handleMarkAsRead(socket: AuthenticatedSocket, payload: { senderId: string }): Promise<void> {
    try {
      if (!socket.userId) return;

      const { senderId } = payload;

      await prisma.message.updateMany({
        where: {
          sender_id: senderId,
          receiver_id: socket.userId,
          is_read: false,
        },
        data: {
          is_read: true,
          read_at: new Date(),
        },
      });

      // Notify sender that messages were read
      this.emitToUser(senderId, 'messages_read', {
        userId: socket.userId,
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  private handleJoinConversation(socket: AuthenticatedSocket, payload: { otherUserId: string }): void {
    const roomId = this.getConversationRoom(socket.userId!, payload.otherUserId);
    socket.join(roomId);

    // Notify other user that this user is viewing conversation
    this.emitToUser(payload.otherUserId, 'user_viewing_conversation', {
      userId: socket.userId,
      isViewing: true,
    });
  }

  private handleLeaveConversation(socket: AuthenticatedSocket, payload: { otherUserId: string }): void {
    const roomId = this.getConversationRoom(socket.userId!, payload.otherUserId);
    socket.leave(roomId);

    // Notify other user that this user left conversation
    this.emitToUser(payload.otherUserId, 'user_viewing_conversation', {
      userId: socket.userId,
      isViewing: false,
    });
  }

  private async handleDeleteMessage(
    socket: AuthenticatedSocket,
    payload: { messageId: string },
    callback?: Function
  ): Promise<void> {
    try {
      if (!socket.userId) {
        callback?.({ success: false, error: 'Not authenticated' });
        return;
      }

      const { messageId } = payload;

      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        callback?.({ success: false, error: 'Message not found' });
        return;
      }

      // Only sender can delete
      if (message.sender_id !== socket.userId) {
        callback?.({ success: false, error: 'Unauthorized' });
        return;
      }

      await prisma.message.delete({
        where: { id: messageId },
      });

      // Notify receiver
      this.emitToUser(message.receiver_id, 'message_deleted', {
        messageId,
      });

      callback?.({ success: true });
    } catch (error) {
      console.error('Error deleting message:', error);
      callback?.({ success: false, error: 'Failed to delete message' });
    }
  }

  private handleDisconnect(socket: AuthenticatedSocket): void {
    if (socket.userId) {
      console.log(`❌ User disconnected: ${socket.username} (${socket.userId})`);

      // Remove socket mapping
      const sockets = this.userSockets.get(socket.userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          this.userSockets.delete(socket.userId);
          this.broadcastUserOnlineStatus(socket.userId, false);
        }
      }

      this.socketUsers.delete(socket.id);
    }
  }

  // ============ UTILITY METHODS ============

  private emitToUser(userId: string, event: string, data: any): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.forEach((socketId) => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  private broadcastUserOnlineStatus(userId: string, isOnline: boolean): void {
    this.io.emit('user_online_status', {
      userId,
      isOnline,
      timestamp: new Date(),
    });
  }

  private getConversationRoom(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }

  // ============ PUBLIC METHODS ============

  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  public getUserSockets(userId: string): Set<string> | undefined {
    return this.userSockets.get(userId);
  }

  public getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

let chatWebSocketService: ChatWebSocketService;

export function initializeWebSocket(httpServer: HTTPServer): ChatWebSocketService {
  chatWebSocketService = new ChatWebSocketService(httpServer);
  return chatWebSocketService;
}

export function getChatWebSocketService(): ChatWebSocketService {
  return chatWebSocketService;
}
