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
  const { 
    rates: currencyRates, 
    loading, 
    error: ratesError, 
    isUsingFallback 
  } = useExchangeRates();

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
      // CPIデータの検証
      const cpiLine = (cpiAll as CpiType[]).find(data => data.year === year);
      if (!cpiLine) {
        return {
          result: undefined,
          resultStatement: '',
          shareStatement: '',
          error: `${year}年のCPIデータが見つかりません`,
        };
      }
      
      const cpi = Number(cpiLine[currency]);
      if (!cpi || cpi <= 0) {
        return {
          result: undefined,
          resultStatement: '',
          shareStatement: '',
          error: `${year}年の${currency.toUpperCase()}のCPIデータが無効です`,
        };
      }
      
      // 現在年のCPIデータ取得
      let cpiNowLine = (cpiAll as CpiType[]).find(data => data.year === YEAR_NOW.toString());
      if (!cpiNowLine) {
        cpiNowLine = (cpiAll as CpiType[]).find(data => data.year === (YEAR_NOW - 1).toString());
      }
      
      if (!cpiNowLine) {
        return {
          result: undefined,
          resultStatement: '',
          shareStatement: '',
          error: '現在年のCPIデータが見つかりません',
        };
      }
      
      const cpiNow = Number(cpiNowLine[currency]);
      if (!cpiNow || cpiNow <= 0) {
        return {
          result: undefined,
          resultStatement: '',
          shareStatement: '',
          error: `現在年の${currency.toUpperCase()}のCPIデータが無効です`,
        };
      }
      
      // 為替レートの検証
      if (!currencyRates[currency]) {
        return {
          result: undefined,
          resultStatement: '',
          shareStatement: '',
          error: `${currency.toUpperCase()}の為替レートが取得できません`,
        };
      }
      
      const exchangeRate = currencyRates.jpy.value / currencyRates[currency].value;
      if (!exchangeRate || exchangeRate <= 0) {
        return {
          result: undefined,
          resultStatement: '',
          shareStatement: '',
          error: '為替レートの計算に失敗しました',
        };
      }
      
      const result = calculateInflationAdjustedAmount(Number(amount), cpi, cpiNow, exchangeRate);
      
      if (Number.isNaN(result)) {
        return {
          result: undefined,
          resultStatement: '',
          shareStatement: '',
          error: '計算結果が無効です。入力値を確認してください',
        };
      }
      
      const resultStatement = `${formatCurrency(result)}円${isUsingFallback ? '（参考値）' : ''}`;
      const currencyInfo = currencies.find(data => data.value === currency);
      const shareStatement = `${year}年の${formatCurrency(Number(amount))}${currencyInfo?.label}は${formatCurrency(result)}円${isUsingFallback ? '（参考値）' : ''}`;

      return {
        result,
        resultStatement,
        shareStatement,
        error: isUsingFallback ? '為替レートは参考値です' : null,
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