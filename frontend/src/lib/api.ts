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
  async getPosts() {
    return this.client.get('/community/posts');
  }

  async createPost(data: { title: string; content: string; tag?: string }) {
    return this.client.post('/community/posts', data);
  }

  async likePost(postId: string) {
    return this.client.post(`/community/posts/${postId}/like`, {});
  }

  async commentPost(postId: string, content: string) {
    return this.client.post(`/community/posts/${postId}/comment`, { content });
  }

  async getPostComments(postId: string) {
    return this.client.get(`/community/posts/${postId}/comments`);
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
  async createSession(data: { participant_id: string; skill_title: string; scheduled_at: string; duration_minutes?: number }) {
    return this.client.post('/sessions/create', data);
  }

  async getSessionById(id: string) {
    return this.client.get(`/sessions/${id}`);
  }
}

export const api = new ApiClient();