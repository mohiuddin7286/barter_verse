import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      // Prioritize internal state, fallback to localStorage
      const storedToken = localStorage.getItem('auth_token');
      const activeToken = this.token || storedToken;

      if (activeToken) {
        config.headers.Authorization = `Bearer ${activeToken}`;
      } else {
        console.log(`📤 Request to ${config.url} WITHOUT token`);
      }
      return config;
    });
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
        localStorage.setItem('auth_token', token);
        console.log('API token set');
    } else {
        localStorage.removeItem('auth_token');
        console.log('API token cleared');
    }
  }

  // --- Auth & User Management ---
  async signup(email: string, password: string) {
    return this.client.post('/auth/signup', { email, password });
  }

  async signin(email: string, password: string) {
    return this.client.post('/auth/signin', { email, password });
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async updateProfile(data: { display_name?: string; bio?: string; avatar_url?: string; location?: string; email?: string }) {
    return this.client.patch('/users/profile', data);
  }

  async updateSettings(data: any) {
    return this.client.patch('/users/settings', data);
  }

  async getUserProfile(userId: string) {
    return this.client.get(`/users/${userId}`);
  }

  // --- Listings ---
  async getListings(page = 1, limit = 10, category?: string, search?: string, sort?: string, minPrice?: number, maxPrice?: number) {
    const params: any = { page, limit };
    if (category && category !== 'all') params.category = category;
    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    return this.client.get('/listings', { params });
  }

  async getListingById(id: string) {
    return this.client.get(`/listings/${id}`);
  }

  async getUserListings(userId: string) {
    return this.client.get(`/listings/user/${userId}`);
  }

  async createListing(data: any) {
    return this.client.post('/listings', data);
  }

  async updateListing(id: string, data: any) {
    return this.client.patch(`/listings/${id}`, data);
  }

  async deleteListing(id: string) {
    return this.client.delete(`/listings/${id}`);
  }

  async archiveListing(id: string) {
    return this.client.patch(`/listings/${id}`, { status: 'ARCHIVED' });
  }

  // --- Barter Coins (Wallet) ---
  async getBalance() {
    return this.client.get('/coins');
  }

  async addCoins(amount: number, reason?: string) {
    return this.client.post('/coins/add', { amount, reason });
  }

  async spendCoins(amount: number, reason?: string) {
    return this.client.post('/coins/spend', { amount, reason });
  }

  async transferCoins(toUserId: string, amount: number) {
    return this.client.post('/coins/transfer', { toUserId, amount });
  }

  async getTransactionHistory(limit = 50) {
    return this.client.get('/coins/transactions', { params: { limit } });
  }

  // --- Trading System ---
  async getTrades(direction?: 'incoming' | 'outgoing') {
    const params: any = {};
    if (direction) params.direction = direction;
    return this.client.get('/trades', { params });
  }

  async getTradeById(id: string) {
    return this.client.get(`/trades/${id}`);
  }

  async createTrade(data: any) {
    return this.client.post('/trades', data);
  }

  async confirmTrade(id: string, action: 'accept' | 'reject') {
    return this.client.patch(`/trades/${id}/confirm`, { action });
  }

  async completeTrade(id: string) {
    return this.client.patch(`/trades/${id}/complete`, {});
  }

  async cancelTrade(id: string) {
    return this.client.patch(`/trades/${id}/cancel`, {});
  }

  // --- Reviews ---
  async createReview(data: any) {
    return this.client.post('/reviews', data);
  }

  async getReviews(userId: string) {
    return this.client.get(`/reviews/user/${userId}`);
  }

  async getMyReviews() {
    return this.client.get('/reviews/my-reviews/given');
  }

  async deleteReview(id: string) {
    return this.client.delete(`/reviews/${id}`);
  }

  async health() {
    return this.client.get('/health');
  }

  // --- Community (Discussions) ---
  async getPosts(page = 1, limit = 10, tag?: string) {
    const params: any = { page, limit };
    if (tag && tag !== 'all') params.tag = tag;
    return this.client.get('/community/posts', { params });
  }

  async getPostById(postId: string) {
    return this.client.get(`/community/posts/${postId}`);
  }

  async createPost(data: { title: string; content: string; tag?: string }) {
    return this.client.post('/community/posts', data);
  }

  async updatePost(postId: string, data: { title?: string; content?: string; tag?: string }) {
    return this.client.put(`/community/posts/${postId}`, data);
  }

  async deletePost(postId: string) {
    return this.client.delete(`/community/posts/${postId}`);
  }

  async likePost(postId: string) {
    return this.client.post(`/community/posts/${postId}/like`, {});
  }

  async unlikePost(postId: string) {
    return this.client.delete(`/community/posts/${postId}/like`);
  }

  async createComment(postId: string, content: string) {
    return this.client.post(`/community/posts/${postId}/comments`, { content });
  }

  async updateComment(commentId: string, content: string) {
    return this.client.put(`/community/comments/${commentId}`, { content });
  }

  async deleteComment(commentId: string) {
    return this.client.delete(`/community/comments/${commentId}`);
  }

  async getPostComments(postId: string, page = 1, limit = 20) {
    return this.client.get(`/community/posts/${postId}/comments`, { params: { page, limit } });
  }

  async searchPosts(query: string) {
    return this.client.get('/community/search', { params: { q: query } });
  }

  async getPostsByTag(tag: string, page = 1, limit = 10) {
    return this.client.get(`/community/tags/${tag}`, { params: { page, limit } });
  }

  async getAuthorPosts(authorId: string, page = 1, limit = 10) {
    return this.client.get(`/community/users/${authorId}/posts`, { params: { page, limit } });
  }

  async getTrendingPosts() {
    return this.client.get('/community/trending/posts');
  }

  // --- Reviews & Ratings ---
  async createReview(data: { target_user_id: string; rating: number; comment: string; trade_id?: string; listing_id?: string }) {
    return this.client.post('/reviews', data);
  }

  async getReviewsForUser(userId: string, page = 1, limit = 10) {
    return this.client.get(`/reviews/user/${userId}`, { params: { page, limit } });
  }

  async getReviewById(reviewId: string) {
    return this.client.get(`/reviews/${reviewId}`);
  }

  async getUserReviewsGiven(page = 1, limit = 10) {
    return this.client.get('/reviews/my-reviews/given', { params: { page, limit } });
  }

  async updateReview(reviewId: string, data: { rating?: number; comment?: string }) {
    return this.client.put(`/reviews/${reviewId}`, data);
  }

  async deleteReview(reviewId: string) {
    return this.client.delete(`/reviews/${reviewId}`);
  }

  async getUserRating(userId: string) {
    return this.client.get(`/reviews/rating/${userId}`);
  }

  async getTopRatedUsers(limit = 10) {
    return this.client.get('/reviews/top-rated', { params: { limit } });
  }

  async getRecentlyReviewedUsers(limit = 10) {
    return this.client.get('/reviews/recent/users', { params: { limit } });
  }

  async getReviewStatistics() {
    return this.client.get('/reviews/stats/overview');
  }

  async searchReviews(query: string, page = 1, limit = 10) {
    return this.client.get('/reviews/search', { params: { q: query, page, limit } });
  }

  async filterReviewsByRating(userId: string, minRating: number, maxRating?: number, page = 1, limit = 10) {
    const params: any = { minRating, page, limit };
    if (maxRating !== undefined) params.maxRating = maxRating;
    return this.client.get(`/reviews/filter/rating/${userId}`, { params });
  }

  // --- Chat System (NEW) ---
  async getConversations() {
    return this.client.get('/chat/conversations');
  }

  async getMessages(otherUserId: string) {
    return this.client.get(`/chat/messages/${otherUserId}`);
  }

  async sendMessage(receiverId: string, content: string) {
    return this.client.post('/chat/send', { receiverId, content });
  }
  // --- Location / Map ---
  async getEcoMapItems() {
    return this.client.get('/location/map');
  }

  // --- Sessions / Skill Booking ---
  async createSession(data: { participant_id: string; skill_title: string; scheduled_at: string; description?: string; duration_minutes?: number; location?: string; meeting_link?: string }) {
    return this.client.post('/sessions', data);
  }

  async getSessionById(sessionId: string) {
    return this.client.get(`/sessions/${sessionId}`);
  }

  async getSessionsAsProvider(status?: string, page = 1, limit = 10) {
    const params: any = { page, limit };
    if (status) params.status = status;
    return this.client.get('/sessions/my-sessions/provider', { params });
  }

  async getSessionsAsParticipant(status?: string, page = 1, limit = 10) {
    const params: any = { page, limit };
    if (status) params.status = status;
    return this.client.get('/sessions/my-sessions/participant', { params });
  }

  async getUserSessions(userId: string, page = 1, limit = 10) {
    return this.client.get(`/sessions/user/${userId}`, { params: { page, limit } });
  }

  async updateSession(sessionId: string, data: { skill_title?: string; description?: string; scheduled_at?: string; duration_minutes?: number; location?: string; meeting_link?: string }) {
    return this.client.put(`/sessions/${sessionId}`, data);
  }

  async cancelSession(sessionId: string, reason?: string) {
    return this.client.delete(`/sessions/${sessionId}`, { data: { reason } });
  }

  async startSession(sessionId: string) {
    return this.client.post(`/sessions/${sessionId}/start`, {});
  }

  async completeSession(sessionId: string, data: { feedback?: string; rating?: number; notes?: string }) {
    return this.client.post(`/sessions/${sessionId}/complete`, data);
  }

  async markSessionNoShow(sessionId: string) {
    return this.client.post(`/sessions/${sessionId}/no-show`, {});
  }

  async getProviderAvailability(providerId: string, startDate: string, endDate: string) {
    return this.client.get(`/sessions/availability/${providerId}`, { params: { startDate, endDate } });
  }

  async getAvailableSlots(providerId: string, date: string, slotDuration?: number) {
    const params: any = { date };
    if (slotDuration) params.slotDuration = slotDuration;
    return this.client.get(`/sessions/slots/${providerId}`, { params });
  }

  async getSessionStats(userId?: string) {
    const params: any = {};
    if (userId) params.userId = userId;
    return this.client.get('/sessions/stats/overview', { params });
  }

  async getProviderStats(providerId: string) {
    return this.client.get(`/sessions/stats/provider/${providerId}`);
  }

  async getUpcomingSessions(days?: number) {
    const params: any = {};
    if (days) params.days = days;
    return this.client.get('/sessions/upcoming', { params });
  }

  // --- Admin (moderation) ---
  async getAdminStats() {
    return this.client.get('/admin/stats/overview');
  }

  async getAdminUsers() {
    return this.client.get('/admin/users');
  }

  async getAdminUser(userId: string) {
    return this.client.get(`/admin/users/${userId}`);
  }

  async updateUserRole(userId: string, role: string) {
    return this.client.put(`/admin/users/${userId}/role`, { role });
  }

  async addCoinsToUser(userId: string, amount: number, reason?: string) {
    return this.client.post('/admin/coins/add', { userId, amount, reason });
  }

  async deductCoinsFromUser(userId: string, amount: number, reason?: string) {
    return this.client.post('/admin/coins/deduct', { userId, amount, reason });
  }

  async getAdminTransactions(limit = 20, offset = 0) {
    return this.client.get('/admin/transactions', { params: { limit, offset } });
  }

  async getAdminUserTransactions(userId: string, limit = 20, offset = 0) {
    return this.client.get(`/admin/users/${userId}/transactions`, { params: { limit, offset } });
  }

  async getAdminTrades(status?: string) {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    return this.client.get('/admin/trades', { params });
  }

  async getAdminTradeById(id: string) {
    return this.client.get(`/admin/trades/${id}`);
  }

  async adminAcceptTrade(id: string) {
    return this.client.put(`/admin/trades/${id}/accept`);
  }

  async adminRejectTrade(id: string, reason?: string) {
    return this.client.put(`/admin/trades/${id}/reject`, { reason });
  }

  async adminCompleteTrade(id: string) {
    return this.client.put(`/admin/trades/${id}/complete`);
  }

  async adminCancelTrade(id: string, reason?: string) {
    return this.client.put(`/admin/trades/${id}/cancel`, { reason });
  }

  // ============ REAL-TIME CHAT ENDPOINTS ============

  // --- Conversation Methods ---
  async getConversations(limit = 50, offset = 0) {
    return this.client.get('/chat/conversations', { params: { limit, offset } });
  }

  async getOnlineUsers() {
    return this.client.get('/chat/online-users');
  }

  async getUserStatus(userId: string) {
    return this.client.get(`/chat/user-status/${userId}`);
  }

  async getRecentChats(limit = 10) {
    return this.client.get('/chat/recent', { params: { limit } });
  }

  // --- Message Methods ---
  async getMessages(otherUserId: string, limit = 50, offset = 0) {
    return this.client.get(`/chat/messages/${otherUserId}`, { params: { limit, offset } });
  }

  async sendMessage(receiverId: string, content: string) {
    return this.client.post('/chat/send', { receiverId, content });
  }

  async updateMessage(messageId: string, content: string) {
    return this.client.put(`/chat/messages/${messageId}`, { content });
  }

  async deleteMessage(messageId: string) {
    return this.client.delete(`/chat/messages/${messageId}`);
  }

  async markAsRead(senderId: string) {
    return this.client.post('/chat/mark-read', { senderId });
  }

  // --- Search & Analytics ---
  async searchMessages(query: string, limit = 20, offset = 0) {
    return this.client.get('/chat/search', { params: { q: query, limit, offset } });
  }

  async getChatStats() {
    return this.client.get('/chat/stats');
  }

  async getUnreadCount() {
    return this.client.get('/chat/unread-count');
  }

  // ============ ANALYTICS ENDPOINTS ============

  // --- Dashboard ---
  async getDashboardSummary(days = 30) {
    return this.client.get('/analytics/dashboard', { params: { days } });
  }

  // --- User Analytics ---
  async getUserAnalytics(days = 30) {
    return this.client.get('/analytics/users', { params: { days } });
  }

  async getTopRatedUsers(limit = 10) {
    return this.client.get('/analytics/users/top-rated', { params: { limit } });
  }

  async getMostActiveUsers(limit = 10, days = 30) {
    return this.client.get('/analytics/users/most-active', { params: { limit, days } });
  }

  // --- Trade Analytics ---
  async getTradeAnalytics(days = 30) {
    return this.client.get('/analytics/trades', { params: { days } });
  }

  async getTopTraders(limit = 10, days = 30) {
    return this.client.get('/analytics/trades/top-traders', { params: { limit, days } });
  }

  // --- Community Analytics ---
  async getCommunityAnalytics(days = 30) {
    return this.client.get('/analytics/community', { params: { days } });
  }

  // --- Session Analytics ---
  async getSessionAnalytics(days = 30) {
    return this.client.get('/analytics/sessions', { params: { days } });
  }

  // --- Review Analytics ---
  async getReviewAnalytics(days = 30) {
    return this.client.get('/analytics/reviews', { params: { days } });
  }

  // --- Listings Analytics ---
  async getListingsAnalytics(days = 30) {
    return this.client.get('/analytics/listings', { params: { days } });
  }

  // --- System Health ---
  async getSystemHealth() {
    return this.client.get('/analytics/health');
  }

  // --- Export ---
  async exportAnalyticsCSV(days = 30) {
    return this.client.get('/analytics/export/csv', { params: { days } });
  }

  // ============ QUESTS & XP ENDPOINTS ============

  // --- Quest Management ---
  async getActiveQuests(category?: string, season?: string) {
    const params: any = {};
    if (category) params.category = category;
    if (season) params.season = season;
    return this.client.get('/quests/active', { params });
  }

  async getDailyQuests() {
    return this.client.get('/quests/daily');
  }

  async getWeeklyQuests() {
    return this.client.get('/quests/weekly');
  }

  async getSeasonalQuests(season: string) {
    return this.client.get(`/quests/seasonal/${season}`);
  }

  async getQuestById(questId: string) {
    return this.client.get(`/quests/${questId}`);
  }

  // --- User Quests ---
  async getUserQuests(status?: string, limit = 10, page = 1) {
    const params: any = { limit, page };
    if (status) params.status = status;
    return this.client.get('/quests/user/active', { params });
  }

  async getQuestCompletion(questId: string) {
    return this.client.get(`/quests/${questId}/completion`);
  }

  async updateQuestProgress(questId: string, progress: number) {
    return this.client.patch(`/quests/${questId}/progress`, { progress });
  }

  async completeQuest(questId: string) {
    return this.client.post(`/quests/${questId}/complete`, {});
  }

  async resetQuestProgress(questId: string) {
    return this.client.post(`/quests/${questId}/reset`, {});
  }

  // --- Achievements ---
  async getUserAchievements() {
    return this.client.get('/quests/achievements/me');
  }

  async getUserAchievementsByUser(userId: string) {
    return this.client.get(`/quests/achievements/user/${userId}`);
  }

  async getAchievementById(achievementId: string) {
    return this.client.get(`/quests/achievement/${achievementId}`);
  }

  // --- Levels & XP ---
  async getUserLevel() {
    return this.client.get('/quests/level/me');
  }

  async getUserLevelByUser(userId: string) {
    return this.client.get(`/quests/level/${userId}`);
  }

  async addXPToUser(userId: string, xp_amount: number, reason?: string) {
    return this.client.post('/quests/xp/add', { userId, xp_amount, reason });
  }

  // --- Leaderboards ---
  async getTopUsersByXP(limit = 10) {
    return this.client.get('/quests/leaderboard/xp', { params: { limit } });
  }

  async getTopUsersByLevel(limit = 10) {
    return this.client.get('/quests/leaderboard/level', { params: { limit } });
  }

  async getUserStats() {
    return this.client.get('/quests/stats/me');
  }

  async getGlobalStats() {
    return this.client.get('/quests/stats/global');
  }

  // ============ NOTIFICATIONS ============

  // Get all notifications with filters
  async getNotifications(isRead?: boolean, type?: string, limit = 20, offset = 0) {
    return this.client.get('/notifications', {
      params: {
        ...(isRead !== undefined && { is_read: isRead }),
        ...(type && { type }),
        limit,
        offset,
      },
    });
  }

  // Get recent notifications for dropdown
  async getRecentNotifications(limit = 5) {
    return this.client.get('/notifications/recent', { params: { limit } });
  }

  // Get unread notifications count
  async getUnreadNotificationCount() {
    return this.client.get('/notifications/unread');
  }

  // Get notifications grouped by type
  async getGroupedNotifications() {
    return this.client.get('/notifications/grouped');
  }

  // Mark single notification as read
  async markNotificationAsRead(notificationId: string) {
    return this.client.patch(`/notifications/${notificationId}/read`);
  }

  // Mark multiple notifications as read
  async markMultipleNotificationsAsRead(notificationIds: string[]) {
    return this.client.post('/notifications/read-multiple', { notification_ids: notificationIds });
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    return this.client.post('/notifications/read-all');
  }

  // Delete a single notification
  async deleteNotification(notificationId: string) {
    return this.client.delete(`/notifications/${notificationId}`);
  }

  // Delete multiple notifications
  async deleteMultipleNotifications(notificationIds: string[]) {
    return this.client.post('/notifications/delete-multiple', { notification_ids: notificationIds });
  }

  // Clear all notifications
  async clearAllNotifications() {
    return this.client.delete('/notifications/clear-all');
  }

  // Get notification preferences
  async getNotificationPreferences() {
    return this.client.get('/notifications/preferences');
  }

  // Update notification preferences
  async updateNotificationPreferences(preferences: Record<string, boolean | string>) {
    return this.client.patch('/notifications/preferences', preferences);
  }

  // Send test notification (for development)
  async sendTestNotification(title?: string, message?: string) {
    return this.client.post('/notifications/test', { title, message });
  }
}

export const api = new ApiClient();