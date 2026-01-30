import io, { Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string;
  };
  content: string;
  timestamp: Date;
}

interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
}

interface UserStatus {
  userId: string;
  isOnline: boolean;
}

type MessageEventHandler = (message: Message) => void;
type TypingEventHandler = (user: TypingUser) => void;
type UserStatusEventHandler = (status: UserStatus) => void;
type ConnectionEventHandler = () => void;
type ErrorEventHandler = (error: Error) => void;

export class ChatWebSocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;
  private isConnected = false;
  private messageHandlers: Set<MessageEventHandler> = new Set();
  private typingHandlers: Set<TypingEventHandler> = new Set();
  private userStatusHandlers: Set<UserStatusEventHandler> = new Set();
  private connectionHandlers: Set<ConnectionEventHandler> = new Set();
  private disconnectionHandlers: Set<ConnectionEventHandler> = new Set();
  private errorHandlers: Set<ErrorEventHandler> = new Set();
  private currentConversation: string | null = null;

  constructor(serverUrl = 'http://localhost:5000', token?: string) {
    this.token = token || localStorage.getItem('auth_token');
    this.initializeSocket(serverUrl);
  }

  private initializeSocket(serverUrl: string): void {
    this.socket = io(serverUrl, {
      auth: {
        token: this.token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
    });

    // ============ CONNECTION EVENTS ============
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
      this.connectionHandlers.forEach((handler) => handler());
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      this.isConnected = false;
      this.disconnectionHandlers.forEach((handler) => handler());
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.errorHandlers.forEach((handler) => handler(new Error(error)));
    });

    // ============ MESSAGE EVENTS ============
    this.socket.on('receive_message', (message: Message) => {
      console.log('📨 Received message:', message);
      this.messageHandlers.forEach((handler) => handler(message));
    });

    this.socket.on('message_deleted', (payload: { messageId: string }) => {
      console.log('🗑️  Message deleted:', payload.messageId);
      // Emit as a special deletion event
      this.messageHandlers.forEach((handler) =>
        handler({
          id: payload.messageId,
          senderId: '',
          sender: { id: '', username: '', avatar_url: '' },
          content: '[DELETED]',
          timestamp: new Date(),
        })
      );
    });

    // ============ TYPING EVENTS ============
    this.socket.on('user_typing', (user: TypingUser) => {
      console.log('⌨️  User typing:', user);
      this.typingHandlers.forEach((handler) => handler(user));
    });

    this.socket.on('user_viewing_conversation', (payload: { userId: string; isViewing: boolean }) => {
      console.log('👁️  User viewing:', payload);
    });

    // ============ USER STATUS EVENTS ============
    this.socket.on('user_online_status', (status: UserStatus) => {
      console.log('🟢 User status:', status);
      this.userStatusHandlers.forEach((handler) => handler(status));
    });

    this.socket.on('messages_read', (payload: { userId: string }) => {
      console.log('✅ Messages read by:', payload.userId);
    });
  }

  // ============ PUBLIC CONNECTION METHODS ============

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      const onConnect = () => {
        clearTimeout(timeout);
        this.socket?.off('connect', onConnect);
        resolve();
      };

      this.socket?.on('connect', onConnect);
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  public setToken(token: string): void {
    this.token = token;
    if (this.socket?.connected) {
      this.socket.auth = { token };
      this.socket.connect();
    }
  }

  public isSocketConnected(): boolean {
    return this.isConnected;
  }

  // ============ MESSAGE SENDING METHODS ============

  /**
   * Send message via WebSocket (real-time)
   * Falls back to REST if WebSocket not available
   */
  public async sendMessage(
    receiverId: string,
    content: string,
    callback?: (result: { success: boolean; messageId?: string; error?: string }) => void
  ): Promise<void> {
    if (!this.isConnected) {
      callback?.({ success: false, error: 'WebSocket not connected. Use REST API instead.' });
      return;
    }

    this.socket!.emit('send_message', { receiverId, content }, callback);
  }

  /**
   * Emit typing indicator
   */
  public emitTyping(receiverId: string): void {
    if (!this.isConnected) return;
    this.socket!.emit('typing', { receiverId, isTyping: true });
  }

  /**
   * Stop typing indicator
   */
  public emitStopTyping(receiverId: string): void {
    if (!this.isConnected) return;
    this.socket!.emit('stop_typing', { receiverId });
  }

  /**
   * Mark messages as read
   */
  public markAsRead(senderId: string): void {
    if (!this.isConnected) return;
    this.socket!.emit('mark_as_read', { senderId });
  }

  /**
   * Delete message
   */
  public deleteMessage(
    messageId: string,
    callback?: (result: { success: boolean; error?: string }) => void
  ): void {
    if (!this.isConnected) {
      callback?.({ success: false, error: 'WebSocket not connected' });
      return;
    }

    this.socket!.emit('delete_message', { messageId }, callback);
  }

  // ============ CONVERSATION MANAGEMENT ============

  /**
   * Join a conversation room
   */
  public joinConversation(otherUserId: string): void {
    if (!this.isConnected) {
      console.warn('WebSocket not connected. Cannot join conversation.');
      return;
    }

    this.currentConversation = otherUserId;
    this.socket!.emit('join_conversation', { otherUserId });
  }

  /**
   * Leave current conversation
   */
  public leaveConversation(otherUserId: string): void {
    if (!this.isConnected) return;

    this.currentConversation = null;
    this.socket!.emit('leave_conversation', { otherUserId });
  }

  // ============ EVENT LISTENERS ============

  /**
   * Listen for incoming messages
   */
  public onMessage(handler: MessageEventHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Listen for typing indicators
   */
  public onTyping(handler: TypingEventHandler): () => void {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  /**
   * Listen for user online/offline status
   */
  public onUserStatus(handler: UserStatusEventHandler): () => void {
    this.userStatusHandlers.add(handler);
    return () => this.userStatusHandlers.delete(handler);
  }

  /**
   * Listen for connection events
   */
  public onConnect(handler: ConnectionEventHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  /**
   * Listen for disconnection events
   */
  public onDisconnect(handler: ConnectionEventHandler): () => void {
    this.disconnectionHandlers.add(handler);
    return () => this.disconnectionHandlers.delete(handler);
  }

  /**
   * Listen for errors
   */
  public onError(handler: ErrorEventHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  // ============ UTILITY METHODS ============

  /**
   * Remove all event listeners
   */
  public removeAllListeners(): void {
    this.messageHandlers.clear();
    this.typingHandlers.clear();
    this.userStatusHandlers.clear();
    this.connectionHandlers.clear();
    this.disconnectionHandlers.clear();
    this.errorHandlers.clear();
  }

  /**
   * Get raw socket instance for advanced use cases
   */
  public getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
let chatWebSocketClient: ChatWebSocketClient | null = null;

export function initializeChatWebSocket(serverUrl?: string, token?: string): ChatWebSocketClient {
  if (!chatWebSocketClient) {
    chatWebSocketClient = new ChatWebSocketClient(serverUrl, token);
  }
  return chatWebSocketClient;
}

export function getChatWebSocket(): ChatWebSocketClient {
  if (!chatWebSocketClient) {
    chatWebSocketClient = new ChatWebSocketClient();
  }
  return chatWebSocketClient;
}
