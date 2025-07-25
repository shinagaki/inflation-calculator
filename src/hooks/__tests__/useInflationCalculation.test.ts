import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as useCpiDataHook from '../useCpiData'
import * as useExchangeRatesHook from '../useExchangeRates'
import { useInflationCalculation } from '../useInflationCalculation'

// useExchangeRatesフックをモック
vi.mock('../useExchangeRates')
const mockUseExchangeRates = vi.mocked(useExchangeRatesHook.useExchangeRates)

// useCpiDataフックをモック
vi.mock('../useCpiData')
const mockUseCpiData = vi.mocked(useCpiDataHook.useCpiData)

const mockCpiData = [
  { year: '1980', jpy: '100', usd: '82.4', gbp: '78.9', eur: '85.2' },
  { year: '2000', jpy: '110', usd: '172.2', gbp: '156.1', eur: '158.8' },
  { year: '2023', jpy: '140', usd: '307.3', gbp: '295.5', eur: '285.1' },
  { year: '2024', jpy: '142', usd: '310.3', gbp: '298.2', eur: '287.8' },
]

const mockExchangeRates = {
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

describe('useInflationCalculation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // デフォルトで成功状態をセット
    mockUseExchangeRates.mockReturnValue({
      rates: mockExchangeRates,
      loading: false,
      error: null,
      isUsingFallback: false,
      retryCount: 0,
      retry: vi.fn(),
    })
    mockUseCpiData.mockReturnValue({
      cpiData: mockCpiData,
      loading: false,
      error: null,
    })
  })

  describe('正常なケース', () => {
    it('有効なパラメータで正しく計算される', () => {
      const { result } = renderHook(() =>
        useInflationCalculation({
          year: '1980',
          currency: 'usd',
          amount: '100',
        }),
      )

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.result).toBeTypeOf('number')
      expect(result.current.result).not.toBeNaN()
      expect(result.current.resultStatement).toContain('円')
      expect(result.current.shareStatement).toContain('1980年')
      expect(result.current.shareStatement).toContain('100ドル')
    })

    it('現在年のCPIが見つからない場合、前年のCPIを使用する', () => {
      // 現在年のデータが存在しない場合のテスト
      const { result } = renderHook(() =>
        useInflationCalculation({
          year: '2000',
          currency: 'usd',
          amount: '500',
        }),
      )

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.result).toBeTypeOf('number')
    })

    it('JPY通貨の場合も正しく計算される', () => {
      const { result } = renderHook(() =>
        useInflationCalculation({
          year: '2000',
          currency: 'jpy',
          amount: '10000',
        }),
      )

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.shareStatement).toContain('円')
    })
  })

  describe('ローディング状態', () => {
    it('為替レートのローディング中は適切な状態を返す', () => {
      mockUseExchangeRates.mockReturnValue({
        rates: null,
        loading: true,
        error: null,
        isUsingFallback: false,
        retryCount: 0,
        retry: vi.fn(),
      })
      mockUseCpiData.mockReturnValue({
        cpiData: mockCpiData,
        loading: false,
        error: null,
      })

      const { result } = renderHook(() =>
        useInflationCalculation({
          year: '1980',
          currency: 'usd',
          amount: '100',
        }),
      )

      expect(result.current.loading).toBe(true)
      expect(result.current.result).toBeUndefined()
      expect(result.current.resultStatement).toBe('')
      expect(result.current.shareStatement).toBe('')
    })
  })

  describe('エラーハンドリング', () => {
    it('為替レートのエラーを適切に処理する', () => {
      const errorMessage = 'API Error'
      mockUseExchangeRates.mockReturnValue({
        rates: null,
        loading: false,
        error: new Error(errorMessage),
        isUsingFallback: false,
        retryCount: 0,
        retry: vi.fn(),
      })
      mockUseCpiData.mockReturnValue({
        cpiData: mockCpiData,
        loading: false,
        error: null,
      })

      const { result } = renderHook(() =>
        useInflationCalculation({
          year: '1980',
          currency: 'usd',
          amount: '100',
        }),
      )

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
      expect(result.current.result).toBeUndefined()
    })

    it('存在しない年のCPIデータでも適切に処理する', () => {
      mockUseCpiData.mockReturnValue({
        cpiData: mockCpiData,
        loading: false,
        error: null,
      })
      const { result } = renderHook(() =>
        useInflationCalculation({
          year: '1800', // 存在しない年
          currency: 'usd',
          amount: '100',
        }),
      )

      expect(result.current.loading).toBe(false)
      expect(result.current.result).toBeUndefined()
      expect(result.current.error).toContain('CPIデータが見つかりません')
    })

    it('存在しない通貨でも適切に処理する', () => {
      const { result } = renderHook(() =>
        useInflationCalculation({
          year: '1980',
          currency: 'cad', // 存在しない通貨
          amount: '100',
        }),
      )

      expect(result.current.loading).toBe(false)
      // 存在しない通貨の場合、currencyRates[currency]がundefinedになるためエラーが発生する可能性
    })
  })

  describe('パラメータの変更時の再計算', () => {
    it('年を変更すると再計算される', () => {
      const { result, rerender } = renderHook(
        ({ year }) =>
          useInflationCalculation({
            year,
            currency: 'usd',
            amount: '100',
          }),
        {
          initialProps: { year: '1980' },
        },
      )

      const firstResult = result.current.result

      rerender({ year: '2000' })

      expect(result.current.result).not.toBe(firstResult)
    })

    it('通貨を変更すると再計算される', () => {
      const { result, rerender } = renderHook(
        ({ currency }) =>
          useInflationCalculation({
            year: '1980',
            currency,
            amount: '100',
          }),
        {
          initialProps: { currency: 'usd' },
        },
      )

      const firstResult = result.current.result

      rerender({ currency: 'gbp' })

      expect(result.current.result).not.toBe(firstResult)
    })

    it('金額を変更すると再計算される', () => {
      const { result, rerender } = renderHook(
        ({ amount }) =>
          useInflationCalculation({
            year: '1980',
            currency: 'usd',
            amount,
          }),
        {
          initialProps: { amount: '100' },
        },
      )

      const firstResult = result.current.result

      rerender({ amount: '200' })

      expect(result.current.result).not.toBe(firstResult)
    })
  })

  describe('結果フォーマット', () => {
    it('resultStatementが適切にフォーマットされる', () => {
      const { result } = renderHook(() =>
        useInflationCalculation({
          year: '1980',
          currency: 'usd',
          amount: '100',
        }),
      )

      expect(result.current.resultStatement).toMatch(/^\d{1,3}(,\d{3})*円$/)
    })

    it('shareStatementが適切にフォーマットされる', () => {
      const { result } = renderHook(() =>
        useInflationCalculation({
          year: '1980',
          currency: 'usd',
          amount: '100',
        }),
      )

      // バイラルメッセージ形式に変更されたため、基本的な情報が含まれているかをチェック
      expect(result.current.shareStatement).toContain('1980年')
      expect(result.current.shareStatement).toContain('100ドル')
      expect(result.current.shareStatement).toContain('円')
      expect(result.current.shareStatement).toContain('#今いくら')
    })

    it('GBPの場合、shareStatementにポンドが含まれる', () => {
      const { result } = renderHook(() =>
        useInflationCalculation({
          year: '1980',
          currency: 'gbp',
          amount: '50',
        }),
      )

      expect(result.current.shareStatement).toContain('ポンド')
    })
  })
})
