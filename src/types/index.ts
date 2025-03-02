export interface ExchangeRatesAPI {
  [key: string]: ExchangeRate;
}

export interface ExchangeRate {
  value: number;
}

export interface Currency {
  label: string;
  value: string;
  emoji: string;
}

export type CpiType = Record<string, string>; 