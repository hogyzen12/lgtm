import { useState, useEffect } from 'react';

interface ValidatorData {
  totalValueUSD: number;
  activatedStake: number;
}

export function useValidatorData(refreshInterval: number = 60000) {
  const [data, setData] = useState<ValidatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Mock data for now - replace with actual API call
        const mockData: ValidatorData = {
          totalValueUSD: 10500000,
          activatedStake: 71428
        };
        setData(mockData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { data, loading, error };
}