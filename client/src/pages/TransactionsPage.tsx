import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useTransactions } from '../hooks/useTransactions';

const TransactionsPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'PURCHASE' | 'REFUND' | 'POINTS_ADJUSTMENT'>('PURCHASE');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { transactions, loading: transactionsLoading, createTransaction, refetch } = useTransactions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // In a real app, you'd first look up the user by email to get their ID
      // For now, we'll use a placeholder
      const userId = 'placeholder-user-id';
      
      await createTransaction({
        user_id: userId,
        amount: parseFloat(amount),
        type,
        description: description || undefined,
      });

      setSuccess('Transaction created successfully!');
      setEmail('');
      setAmount('');
      setDescription('');
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction Processing</h1>
          <p className="mt-1 text-sm text-gray-500">Process customer transactions and manage points</p>
        </div>

        {/* Transaction Form */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">New Transaction</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Customer Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  className="mt-1 input-field"
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount ($)
                </label>
                <input
                  type="number"
                  id="amount"
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 input-field"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Transaction Type
                </label>
                <select
                  id="type"
                  className="mt-1 input-field"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="PURCHASE">Purchase</option>
                  <option value="REFUND">Refund</option>
                  <option value="POINTS_ADJUSTMENT">Points Adjustment</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <input
                  type="text"
                  id="description"
                  className="mt-1 input-field"
                  placeholder="Transaction details"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Process Transaction'}
              </button>
            </form>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="border-t border-gray-200">
            {transactionsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
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
                          <p className="text-sm text-gray-500">${transaction.amount.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.created_at).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
                {transactions.length === 0 && (
                  <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                    No transactions yet
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

export default TransactionsPage;
