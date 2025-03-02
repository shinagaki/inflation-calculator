import { ExchangeRatesAPI } from '../types';

export const fetchExchangeRates = async (): Promise<ExchangeRatesAPI> => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/exchange_rates',
  );
  const data = await response.json();
  return data.rates;
}; 