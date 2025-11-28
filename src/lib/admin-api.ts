// Admin API Client Methods
// Add these methods to src/lib/api.ts or create a separate admin api file

import axios from "axios";

export const adminApi = {
  // User Management
  getAllUsers: async (token: string) => {
    return axios.get("/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getUserById: async (userId: string, token: string) => {
    return axios.get(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateUserRole: async (
    userId: string,
    role: string,
    token: string
  ) => {
    return axios.put(
      `/admin/users/${userId}/role`,
      { role },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Coin Management
  addCoins: async (
    userId: string,
    amount: number,
    reason: string,
    token: string
  ) => {
    return axios.post(
      "/admin/coins/add",
      { userId, amount, reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  removeCoins: async (
    userId: string,
    amount: number,
    reason: string,
    token: string
  ) => {
    return axios.post(
      "/admin/coins/remove",
      { userId, amount, reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Trade Management
  getAllTrades: async (status?: string, token?: string) => {
    const url = status ? `/admin/trades?status=${status}` : "/admin/trades";
    return axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getTradeById: async (tradeId: string, token: string) => {
    return axios.get(`/admin/trades/${tradeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  acceptTrade: async (tradeId: string, token: string) => {
    return axios.put(
      `/admin/trades/${tradeId}/accept`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  rejectTrade: async (tradeId: string, reason: string, token: string) => {
    return axios.put(
      `/admin/trades/${tradeId}/reject`,
      { reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  completeTrade: async (tradeId: string, token: string) => {
    return axios.put(
      `/admin/trades/${tradeId}/complete`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  cancelTrade: async (
    tradeId: string,
    reason: string,
    token: string
  ) => {
    return axios.put(
      `/admin/trades/${tradeId}/cancel`,
      { reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Admin Stats
  getAdminStats: async (token: string) => {
    return axios.get("/admin/stats/overview", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
