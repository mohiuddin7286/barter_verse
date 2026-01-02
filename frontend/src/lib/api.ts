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
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  setToken(token: string | null) {
    this.token = token;
  }

  async signup(email: string, password: string) {
    return this.client.post('/auth/signup', { email, password });
  }

  async signin(email: string, password: string) {
    return this.client.post('/auth/signin', { email, password });
  }

  async logout() {
    this.token = null;
  }

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
}

export const api = new ApiClient();
