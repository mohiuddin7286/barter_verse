import axios from "axios";

const adminClient = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

export const adminApi = {
  // User Management
  getAllUsers: async (token: string) => {
    return adminClient.get("/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getUserById: async (userId: string, token: string) => {
    return adminClient.get(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateUserRole: async (
    userId: string,
    role: string,
    token: string
  ) => {
    return adminClient.put(
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
    return adminClient.post(
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
    return adminClient.post(
      "/admin/coins/deduct",
      { userId, amount, reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Trade Management
  getAllTrades: async (status?: string, token?: string) => {
    const url = status ? `/admin/trades?status=${status}` : "/admin/trades";
    return adminClient.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getTradeById: async (tradeId: string, token: string) => {
    return adminClient.get(`/admin/trades/${tradeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  acceptTrade: async (tradeId: string, token: string) => {
    return adminClient.put(
      `/admin/trades/${tradeId}/accept`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  rejectTrade: async (tradeId: string, reason: string, token: string) => {
    return adminClient.put(
      `/admin/trades/${tradeId}/reject`,
      { reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  completeTrade: async (tradeId: string, token: string) => {
    return adminClient.put(
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
    return adminClient.put(
      `/admin/trades/${tradeId}/cancel`,
      { reason },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },

  // Admin Stats
  getAdminStats: async (token: string) => {
    return adminClient.get("/admin/stats/overview", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
