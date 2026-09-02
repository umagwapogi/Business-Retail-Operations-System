import React from 'react';
import Layout from '../components/Layout';
import { useRewards, useRewardClaims } from '../hooks/useRewards';
import { useAuth } from '../hooks/useAuth';

const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const { rewards, loading: rewardsLoading, claimReward } = useRewards();
  const { claims, loading: claimsLoading } = useRewardClaims(true);

  const handleClaim = async (rewardId: string) => {
    try {
      await claimReward(rewardId);
      alert('Reward claimed successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to claim reward');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rewards Catalog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your balance: <span className="font-semibold text-primary-600">{user?.points_balance || 0} points</span>
          </p>
        </div>

        {/* Available Rewards */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Available Rewards</h3>
          </div>
          <div className="border-t border-gray-200">
            {rewardsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{reward.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {reward.points_required} pts
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {reward.stock_quantity} available
                      </span>
                      <button
                        onClick={() => handleClaim(reward.id)}
                        disabled={(user?.points_balance || 0) < reward.points_required || reward.stock_quantity <= 0}
                        className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {(user?.points_balance || 0) < reward.points_required ? 'Not enough points' : 
                         reward.stock_quantity <= 0 ? 'Out of stock' : 'Claim'}
                      </button>
                    </div>
                  </div>
                ))}
                {rewards.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No rewards available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* My Claims */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">My Reward Claims</h3>
          </div>
          <div className="border-t border-gray-200">
            {claimsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {claims.map((claim) => (
                  <li key={claim.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{claim.reward?.name}</p>
                          <p className="text-sm text-gray-500">{claim.points_spent} points spent</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          claim.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          claim.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {claim.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(claim.claimed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
                {claims.length === 0 && (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    No reward claims yet
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RewardsPage;
