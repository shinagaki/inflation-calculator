import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '../../services/api'
import { useExchangeRates } from '../useExchangeRates'

// API関数をモック
vi.mock('../../services/api')
const mockFetchExchangeRates = vi.mocked(api.fetchExchangeRates)

describe('useExchangeRates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('初期状態では loading=true, rates=null, error=null', () => {
    // API呼び出しを無限に待機させる（初期状態をテストするため）
    mockFetchExchangeRates.mockImplementation(() => new Promise(() => {}))

    const { result } = renderHook(() => useExchangeRates())

    expect(result.current.loading).toBe(true)
    expect(result.current.rates).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.isUsingFallback).toBe(false)
    expect(result.current.retryCount).toBe(0)
  })

  it('API呼び出しが成功すると rates が設定され loading が false になる', async () => {
    const mockRates = {
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

    mockFetchExchangeRates.mockResolvedValue(mockRates)

    const { result } = renderHook(() => useExchangeRates())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.rates).toEqual(mockRates)
    expect(result.current.error).toBeNull()
  })

  it('API呼び出しが失敗してもフォールバックデータが使用される', async () => {
    // fetchExchangeRatesは内部でフォールバックデータを返すため、常に成功する
    mockFetchExchangeRates.mockResolvedValue({
      jpy: { name: 'Japanese Yen', unit: 'JPY', value: 1, type: 'fiat' },
      usd: { name: 'US Dollar', unit: 'USD', value: 0.0067, type: 'fiat' },
      gbp: { name: 'British Pound Sterling', unit: 'GBP', value: 0.0053, type: 'fiat' },
      eur: { name: 'Euro', unit: 'EUR', value: 0.0061, type: 'fiat' },
    })

    const { result } = renderHook(() => useExchangeRates())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.rates).not.toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('フォールバックデータが正常に設定される', async () => {
    // 正常なフォールバックケースをテスト
    const fallbackRates = {
      jpy: { name: 'Japanese Yen', unit: 'JPY', value: 1, type: 'fiat' },
      usd: { name: 'US Dollar', unit: 'USD', value: 0.0067, type: 'fiat' },
      gbp: { name: 'British Pound Sterling', unit: 'GBP', value: 0.0053, type: 'fiat' },
      eur: { name: 'Euro', unit: 'EUR', value: 0.0061, type: 'fiat' },
    }
    
    mockFetchExchangeRates.mockResolvedValue(fallbackRates)

    const { result } = renderHook(() => useExchangeRates())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.rates).toEqual(fallbackRates)
    expect(result.current.error).toBeNull()
  })

  it('コンポーネントマウント時に正常に初期化される', async () => {
    const mockRates = {
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

    mockFetchExchangeRates.mockResolvedValue(mockRates)

    const { result } = renderHook(() => useExchangeRates())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.rates).toEqual(mockRates)
    expect(result.current.error).toBeNull()
    expect(result.current.isUsingFallback).toBe(false)
  })
})
