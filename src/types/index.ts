export interface ExchangeRatesAPI {
  [key: string]: ExchangeRate;
}

export interface ExchangeRate {
  name: string;
  unit: string;
  value: number;
  type: string;
}

export interface Currency {
  label: string;
  value: string;
  emoji: string;
}

export type CpiType = Record<string, string>; 