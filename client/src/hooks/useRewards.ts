import { useState, useEffect } from 'react';
import { rewardService, Reward, RewardClaim } from '../services/rewardService';

export const useRewards = (includeInactive = false) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, [includeInactive]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rewardService.getAllRewards(includeInactive);
      setRewards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rewards');
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (rewardId: string) => {
    try {
      await rewardService.claimReward(rewardId);
      await fetchRewards();
    } catch (err) {
      throw err;
    }
  };

  return {
    rewards,
    loading,
    error,
    claimReward,
    refetch: fetchRewards,
  };
};

export const useRewardClaims = (myClaims = true) => {
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClaims();
  }, [myClaims]);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = myClaims 
        ? await rewardService.getMyClaims()
        : await rewardService.getAllClaims();
      setClaims(data.claims);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  return {
    claims,
    loading,
    error,
    refetch: fetchClaims,
  };
};
