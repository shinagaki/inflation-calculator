export const calculateInflationAdjustedAmount = (
  amount: number,
  cpi: number,
  cpiNow: number,
  currencyRate: number,
): number => {
  if (cpi && cpiNow && currencyRate) {
    return Math.round(amount * (cpiNow / cpi) * currencyRate)
  }
  return NaN
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP').format(amount)
}

/**
 * 西暦を和暦に変換する
 * 遷移年（1912, 1926, 1989, 2019）は新しい元号を使用
 */
export const toJapaneseEra = (year: number): string | null => {
  if (year >= 2019) return `令和${year - 2018 === 1 ? '元' : year - 2018}年`
  if (year >= 1989) return `平成${year - 1988 === 1 ? '元' : year - 1988}年`
  if (year >= 1926) return `昭和${year - 1925 === 1 ? '元' : year - 1925}年`
  if (year >= 1912) return `大正${year - 1911 === 1 ? '元' : year - 1911}年`
  if (year >= 1868) return `明治${year - 1867}年`
  return null
}
