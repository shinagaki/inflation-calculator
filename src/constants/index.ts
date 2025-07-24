import { Currency } from '../types'

export const currencies: Currency[] = [
  { label: '円', value: 'jpy', emoji: '🇯🇵' },
  { label: 'ドル', value: 'usd', emoji: '🇺🇸' },
  { label: 'ポンド', value: 'gbp', emoji: '🇬🇧' },
  { label: 'ユーロ', value: 'eur', emoji: '🇪🇺' },
]

export const AMOUNT_MAX = 10000000000000000
export const AMOUNT_DEFAULT = 0
export const YEAR_MIN = 1900
export const YEAR_NOW = new Date().getFullYear()
export const YEAR_DEFAULT = 1950
export const URL_DOMAIN = 'imaikura.creco.net'

export const YEAR_LIST = Array.from(
  Array(YEAR_NOW - YEAR_MIN + 1).keys(),
  x => x + YEAR_MIN,
)
