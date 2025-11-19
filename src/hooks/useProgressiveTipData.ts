import { useState, useEffect } from 'react';

interface TipData {
  totalTransactions: number;
  isLoading: boolean;
  error: Error | null;
}

export function useProgressiveTipData(): TipData {
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Mock progressive loading - replace with actual API call
        setTotalTransactions(142857);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { totalTransactions, isLoading, error };
}