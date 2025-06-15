import { useState, useEffect } from 'react';
import { ExchangeRatesAPI } from '../types';
import { fetchExchangeRates, ApiError } from '../services/api';

interface UseExchangeRatesReturn {
  rates: ExchangeRatesAPI | null;
  loading: boolean;
  error: Error | null;
  isUsingFallback: boolean;
  retryCount: number;
  retry: () => void;
}

export const useExchangeRates = (): UseExchangeRatesReturn => {
  const [rates, setRates] = useState<ExchangeRatesAPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const loadRates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchExchangeRates();
      setRates(data);
      setIsUsingFallback(false);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isNetworkError) {
          setError(new Error('ネットワーク接続を確認してください'));
        } else {
          setError(err);
        }
      } else {
        setError(err instanceof Error ? err : new Error('予期しないエラーが発生しました'));
      }
      
      // エラーでもフォールバックデータがある場合は設定
      if (rates === null) {
        // フォールバックデータを手動設定（APIが完全に失敗した場合の最後の手段）
        const fallbackRates: ExchangeRatesAPI = {
          jpy: { name: 'Japanese Yen', unit: 'JPY', value: 1, type: 'fiat' },
          usd: { name: 'US Dollar', unit: 'USD', value: 0.0067, type: 'fiat' },
          gbp: { name: 'British Pound Sterling', unit: 'GBP', value: 0.0053, type: 'fiat' },
          eur: { name: 'Euro', unit: 'EUR', value: 0.0061, type: 'fiat' },
        };
        setRates(fallbackRates);
        setIsUsingFallback(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    setRetryCount(prev => prev + 1);
    loadRates();
  };

  useEffect(() => {
    loadRates();
  }, []);

  return { 
    rates, 
    loading, 
    error, 
    isUsingFallback, 
    retryCount,
    retry 
  };
}; 