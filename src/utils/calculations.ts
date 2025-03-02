export const calculateInflationAdjustedAmount = (
  amount: number,
  cpi: number,
  cpiNow: number,
  currencyRate: number
): number => {
  if (cpi && cpiNow && currencyRate) {
    return Math.round(amount * (cpiNow / cpi) * currencyRate);
  }
  return NaN;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP').format(amount);
}; 