import { useState, useEffect } from 'react';
import { ExchangeRatesAPI } from '../types';
import { fetchExchangeRates } from '../services/api';

export const useExchangeRates = () => {
  const [rates, setRates] = useState<ExchangeRatesAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadRates = async () => {
      try {
        const data = await fetchExchangeRates();
        setRates(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch rates'));
      } finally {
        setLoading(false);
      }
    };

    loadRates();
  }, []);

  return { rates, loading, error };
}; 