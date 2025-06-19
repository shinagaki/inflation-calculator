import { useState, useEffect } from 'react';
import { CpiType } from '../types';

interface UseCpiDataReturn {
  cpiData: CpiType[] | null;
  loading: boolean;
  error: Error | null;
}

export const useCpiData = (): UseCpiDataReturn => {
  const [cpiData, setCpiData] = useState<CpiType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadCpiData = async () => {
      try {
        // 動的インポートでコード分割
        const { default: data } = await import('../data/cpi_all.json');
        setCpiData(data as CpiType[]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('CPIデータの読み込みに失敗しました'));
      } finally {
        setLoading(false);
      }
    };

    loadCpiData();
  }, []);

  return { cpiData, loading, error };
};