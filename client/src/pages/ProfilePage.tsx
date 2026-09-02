import React from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { useUserAnalytics } from '../hooks/useAnalytics';

const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { analytics, loading } = useUserAnalytics();

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Account Information</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.role}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Points Balance</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.points_balance || 0}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user ? new Date(user.created_at || '').toLocaleDateString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Activity Statistics</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Total Transactions</dt>
                <dd className="mt-1 text-sm text-gray-900">{analytics?.stats.transactionCount || 0}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Total Points Earned</dt>
                <dd className="mt-1 text-sm text-gray-900">{analytics?.stats.totalPointsEarned || 0}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Total Points Spent</dt>
                <dd className="mt-1 text-sm text-gray-900">{analytics?.stats.totalPointsSpent || 0}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Rewards Claimed</dt>
                <dd className="mt-1 text-sm text-gray-900">{analytics?.stats.rewardClaimsCount || 0}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {analytics?.recentTransactions.slice(0, 5).map((transaction: any) => (
                <li key={transaction.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          transaction.points_change > 0 ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <span className={`text-sm font-medium ${
                            transaction.points_change > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.points_change > 0 ? '+' : ''}{transaction.points_change}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{transaction.type}</p>
                        <p className="text-sm text-gray-500">{transaction.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </li>
              ))}
              {analytics?.recentTransactions.length === 0 && (
                <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                  No recent activity
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
