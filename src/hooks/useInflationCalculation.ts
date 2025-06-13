import { useMemo } from 'react';
import { useExchangeRates } from './useExchangeRates';
import { calculateInflationAdjustedAmount, formatCurrency } from '../utils/calculations';
import { currencies, YEAR_NOW } from '../constants';
import { CpiType } from '../types';
import cpiAll from '../data/cpi_all.json';

interface UseInflationCalculationParams {
  year: string;
  currency: string;
  amount: string;
}

interface InflationResult {
  result: number | undefined;
  resultStatement: string;
  shareStatement: string;
  loading: boolean;
  error: string | null;
}

export const useInflationCalculation = ({
  year,
  currency,
  amount,
}: UseInflationCalculationParams): InflationResult => {
  const { rates: currencyRates, loading, error: ratesError } = useExchangeRates();

  const calculation = useMemo(() => {
    if (loading || !currencyRates) {
      return {
        result: undefined,
        resultStatement: '',
        shareStatement: '',
        error: ratesError?.message || null,
      };
    }

    try {
      const cpiLine = (cpiAll as CpiType[]).find(data => data.year === year);
      const cpi = cpiLine ? Number(cpiLine[currency]) || 0 : 0;
      
      let cpiNowLine = (cpiAll as CpiType[]).find(data => data.year === YEAR_NOW.toString());
      if (!cpiNowLine) {
        cpiNowLine = (cpiAll as CpiType[]).find(data => data.year === (YEAR_NOW - 1).toString());
      }
      const cpiNow = cpiNowLine ? Number(cpiNowLine[currency]) || 0 : 0;
      
      const exchangeRate = currencyRates.jpy.value / currencyRates[currency].value;
      const result = calculateInflationAdjustedAmount(Number(amount), cpi, cpiNow, exchangeRate);
      
      const resultStatement = `${formatCurrency(result)}円`;
      const currencyInfo = currencies.find(data => data.value === currency);
      const shareStatement = `${year}年の${formatCurrency(Number(amount))}${currencyInfo?.label}は${resultStatement}`;

      return {
        result,
        resultStatement,
        shareStatement,
        error: null,
      };
    } catch (err) {
      return {
        result: undefined,
        resultStatement: '',
        shareStatement: '',
        error: err instanceof Error ? err.message : '計算エラーが発生しました',
      };
    }
  }, [year, currency, amount, currencyRates, loading, ratesError]);

  return {
    ...calculation,
    loading,
  };
};