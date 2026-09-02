import api from './api';

export interface Transaction {
  id: string;
  user_id: string;
  staff_id?: string;
  location_id: string;
  type: 'PURCHASE' | 'REFUND' | 'POINTS_ADJUSTMENT' | 'REWARD_REDEMPTION';
  amount: number;
  points_change: number;
  description?: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    role: string;
    points_balance: number;
  };
  staff?: {
    id: string;
    email: string;
    role: string;
  };
  location?: {
    id: string;
    name: string;
  };
}

export interface CreateTransactionData {
  user_id: string;
  amount: number;
  type: 'PURCHASE' | 'REFUND' | 'POINTS_ADJUSTMENT' | 'REWARD_REDEMPTION';
  description?: string;
}

export const transactionService = {
  async createTransaction(data: CreateTransactionData) {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  async getMyTransactions(page = 1, limit = 10) {
    const response = await api.get(`/transactions/my?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getUserTransactions(userId: string, page = 1, limit = 10) {
    const response = await api.get(`/transactions/user/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getLocationTransactions(locationId: string, page = 1, limit = 10) {
    const response = await api.get(`/transactions/location/${locationId}?page=${page}&limit=${limit}`);
    return response.data;
  },
};
