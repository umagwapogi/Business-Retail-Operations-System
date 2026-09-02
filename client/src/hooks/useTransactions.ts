import { useState, useEffect } from 'react';
import { transactionService, Transaction } from '../services/transactionService';

export const useTransactions = (userId?: string, locationId?: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      let data;

      if (userId) {
        data = await transactionService.getUserTransactions(userId);
      } else if (locationId) {
        data = await transactionService.getLocationTransactions(locationId);
      } else {
        data = await transactionService.getMyTransactions();
      }

      setTransactions(data.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId, locationId]);

  const createTransaction = async (transactionData: any) => {
    try {
      await transactionService.createTransaction(transactionData);
      await fetchTransactions();
    } catch (err) {
      throw err;
    }
  };

  return {
    transactions,
    loading,
    error,
    createTransaction,
    refetch: fetchTransactions,
  };
};
