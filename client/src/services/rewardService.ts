import api from './api';

export interface Reward {
  id: string;
  name: string;
  description?: string;
  points_required: number;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RewardClaim {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  claimed_at: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  reward?: Reward;
}

export const rewardService = {
  async getAllRewards(includeInactive = false) {
    const response = await api.get(`/rewards?includeInactive=${includeInactive}`);
    return response.data;
  },

  async getRewardById(id: string) {
    const response = await api.get(`/rewards/${id}`);
    return response.data;
  },

  async claimReward(rewardId: string) {
    const response = await api.post('/rewards/claim', { reward_id: rewardId });
    return response.data;
  },

  async getMyClaims(page = 1, limit = 10) {
    const response = await api.get(`/rewards/claims/my?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getAllClaims(page = 1, limit = 10) {
    const response = await api.get(`/rewards/claims/all?page=${page}&limit=${limit}`);
    return response.data;
  },
};
