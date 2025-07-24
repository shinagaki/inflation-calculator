import { ExchangeRatesAPI } from '../types'

interface CacheData<T> {
  data: T
  timestamp: number
  expiresAt: number
}

const CACHE_PREFIX = 'inflation-calc'
const EXCHANGE_RATES_KEY = `${CACHE_PREFIX}-exchange-rates`
const DEFAULT_TTL = 10 * 60 * 1000 // 10分

class CacheManager {
  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  private setItem<T>(key: string, data: T, ttl: number): void {
    if (!this.isLocalStorageAvailable()) return

    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    }

    try {
      localStorage.setItem(key, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('キャッシュの保存に失敗しました:', error)
    }
  }

  private getItem<T>(key: string): T | null {
    if (!this.isLocalStorageAvailable()) return null

    try {
      const item = localStorage.getItem(key)
      if (!item) return null

      const cacheData: CacheData<T> = JSON.parse(item)

      // 有効期限チェック
      if (Date.now() > cacheData.expiresAt) {
        localStorage.removeItem(key)
        return null
      }

      return cacheData.data
    } catch (error) {
      console.warn('キャッシュの読み込みに失敗しました:', error)
      return null
    }
  }

  private removeItem(key: string): void {
    if (!this.isLocalStorageAvailable()) return

    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('キャッシュの削除に失敗しました:', error)
    }
  }

  // 為替レート専用メソッド
  setExchangeRates(rates: ExchangeRatesAPI, ttl: number = DEFAULT_TTL): void {
    this.setItem(EXCHANGE_RATES_KEY, rates, ttl)
  }

  getExchangeRates(): ExchangeRatesAPI | null {
    return this.getItem<ExchangeRatesAPI>(EXCHANGE_RATES_KEY)
  }

  clearExchangeRates(): void {
    this.removeItem(EXCHANGE_RATES_KEY)
  }

  // 全キャッシュクリア
  clearAll(): void {
    if (!this.isLocalStorageAvailable()) return

    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('キャッシュの全削除に失敗しました:', error)
    }
  }

  // キャッシュ情報の取得
  getCacheInfo(): { [key: string]: { timestamp: number; expiresAt: number } } {
    if (!this.isLocalStorageAvailable()) return {}

    const info: { [key: string]: { timestamp: number; expiresAt: number } } = {}

    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          const item = localStorage.getItem(key)
          if (item) {
            const cacheData = JSON.parse(item)
            info[key] = {
              timestamp: cacheData.timestamp,
              expiresAt: cacheData.expiresAt,
            }
          }
        }
      })
    } catch (error) {
      console.warn('キャッシュ情報の取得に失敗しました:', error)
    }

    return info
  }
}

export const cacheManager = new CacheManager()
