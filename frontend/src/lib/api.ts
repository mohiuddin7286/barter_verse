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

    // Add interceptor to include token in requests
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string | null) {
    this.token = token;
  }

  // Auth endpoints
  async signup(email: string, password: string) {
    return this.client.post('/auth/signup', { email, password });
  }

  async signin(email: string, password: string) {
    return this.client.post('/auth/signin', { email, password });
  }

  async logout() {
    this.token = null;
  }

  // Listings endpoints
  async getListings(page = 1, limit = 10, category?: string, search?: string) {
    const params: any = { page, limit };
    if (category) params.category = category;
    if (search) params.search = search;
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

  // Coins endpoints
  async getBalance(userId: string) {
    return this.client.get(`/coins/balance/${userId}`);
  }

  async addCoins(userId: string, amount: number, reason?: string) {
    return this.client.post('/coins/add', { userId, amount, reason });
  }

  async spendCoins(userId: string, amount: number, reason?: string) {
    return this.client.post('/coins/spend', { userId, amount, reason });
  }

  async transferCoins(fromUserId: string, toUserId: string, amount: number) {
    return this.client.post('/coins/transfer', { fromUserId, toUserId, amount });
  }

  async getTransactionHistory(userId: string, limit = 50) {
    return this.client.get(`/coins/history/${userId}`, { params: { limit } });
  }

  // Trades endpoints
  async getTrades(userId: string, direction?: 'incoming' | 'outgoing') {
    const params: any = {};
    if (direction) params.direction = direction;
    return this.client.get(`/trades/${userId}`, { params });
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

  // Health check
  async health() {
    return this.client.get('/health');
  }
}

export const api = new ApiClient();
