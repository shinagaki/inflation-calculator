import { ExchangeRatesAPI } from '../types'

interface RetryOptions {
  maxRetries?: number
  delay?: number
}

// エラー種別の判定
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public isNetworkError = false,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 遅延関数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// リトライ機能付きfetch
const fetchWithRetry = async (
  url: string,
  options: RetryOptions = {},
): Promise<Response> => {
  const { maxRetries = 3, delay: retryDelay = 1000 } = options

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
        )
      }

      return response
    } catch (error) {
      const isLastAttempt = attempt === maxRetries

      if (error instanceof ApiError) {
        // HTTP エラーの場合、5xx系のみリトライ
        if (error.status && error.status >= 500 && !isLastAttempt) {
          await delay(retryDelay * Math.pow(2, attempt)) // 指数バックオフ
          continue
        }
        throw error
      }

      // ネットワークエラーの場合
      if (!isLastAttempt) {
        await delay(retryDelay * Math.pow(2, attempt))
        continue
      }

      throw new ApiError('ネットワークエラーが発生しました', undefined, true)
    }
  }

  throw new ApiError('リトライ上限に達しました')
}

// フォールバック用の静的な為替レートデータ
const FALLBACK_RATES: ExchangeRatesAPI = {
  jpy: { name: 'Japanese Yen', unit: 'JPY', value: 1, type: 'fiat' },
  usd: { name: 'US Dollar', unit: 'USD', value: 0.0067, type: 'fiat' },
  gbp: {
    name: 'British Pound Sterling',
    unit: 'GBP',
    value: 0.0053,
    type: 'fiat',
  },
  eur: { name: 'Euro', unit: 'EUR', value: 0.0061, type: 'fiat' },
}

export const fetchExchangeRates = async (): Promise<ExchangeRatesAPI> => {
  try {
    const response = await fetchWithRetry(
      'https://api.coingecko.com/api/v3/exchange_rates',
      { maxRetries: 3, delay: 1000 },
    )

    const data = await response.json()

    // データの妥当性チェック
    if (!data.rates || typeof data.rates !== 'object') {
      throw new ApiError('無効なAPIレスポンス形式です')
    }

    // 必要な通貨が含まれているかチェック
    const requiredCurrencies = ['jpy', 'usd', 'gbp', 'eur']
    for (const currency of requiredCurrencies) {
      if (!data.rates[currency]) {
        throw new ApiError(`必要な通貨データが不足しています: ${currency}`)
      }
    }

    return data.rates
  } catch (error) {
    console.warn(
      '為替レートAPI取得に失敗しました。フォールバックデータを使用します:',
      error,
    )

    // フォールバックデータを返す
    return FALLBACK_RATES
  }
}
