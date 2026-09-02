import api from './api';

export interface DashboardAnalytics {
  overview: {
    totalUsers: number;
    totalTransactions: number;
    totalRewardsClaimed: number;
    totalPointsIssued: number;
  };
  recentTransactions: any[];
  topCustomers: any[];
  revenueByType: any[];
}

export interface UserAnalytics {
  user: {
    id: string;
    email: string;
    points_balance: number;
    role: string;
    created_at: string;
  };
  stats: {
    transactionCount: number;
    totalPointsEarned: number;
    totalPointsSpent: number;
    rewardClaimsCount: number;
  };
  recentTransactions: any[];
  rewardClaims: any[];
}

export const analyticsService = {
  async getDashboardAnalytics() {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  async getMyAnalytics() {
    const response = await api.get('/analytics/my');
    return response.data;
  },

  async getUserAnalytics(userId: string) {
    const response = await api.get(`/analytics/user/${userId}`);
    return response.data;
  },

  async getLocationAnalytics(locationId: string) {
    const response = await api.get(`/analytics/location/${locationId}`);
    return response.data;
  },

  async getAuditLogs(page = 1, limit = 50) {
    const response = await api.get(`/analytics/audit-logs?page=${page}&limit=${limit}`);
    return response.data;
  },
};
