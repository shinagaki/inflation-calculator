import { YEAR_MIN, YEAR_NOW, AMOUNT_MAX } from '../constants';

export const validateYear = (year: string): boolean => {
  const yearNumber = Math.trunc(Number(year));
  return (
    !Number.isNaN(yearNumber) &&
    year === yearNumber.toString() &&
    yearNumber >= YEAR_MIN &&
    yearNumber <= YEAR_NOW
  );
};

export const validateCurrency = (currency: string): boolean => {
  const currenciesAvailable = ['usd', 'jpy', 'gbp', 'eur'];
  return currenciesAvailable.includes(currency);
};

export const validateAmount = (amount: string): boolean => {
  const amountNumber = Number(parseFloat(amount).toFixed(2));
  return (
    !Number.isNaN(amountNumber) &&
    amount === amountNumber.toString() &&
    amountNumber >= 0 &&
    amountNumber <= AMOUNT_MAX
  );
}; 