import { describe, it, expect } from 'vitest'
import { calculateInflationAdjustedAmount, formatCurrency } from '../calculations'

describe('calculateInflationAdjustedAmount', () => {
  it('正常な値で正しく計算される', () => {
    // 1980年の100ドル、CPI: 82.4→ 現在のCPI: 310.3、為替レート: 150
    const result = calculateInflationAdjustedAmount(100, 82.4, 310.3, 150)
    const expected = Math.round(100 * (310.3 / 82.4) * 150)
    expect(result).toBe(expected)
    expect(result).toBe(56487) // 実際の計算結果
  })

  it('小数点を含む計算でも正しく丸められる', () => {
    const result = calculateInflationAdjustedAmount(123.45, 100, 200, 1.5)
    expect(result).toBe(370) // 123.45 * 2 * 1.5 = 370.35 → 四捨五入で370
  })

  it('CPIが0の場合はNaNを返す', () => {
    const result = calculateInflationAdjustedAmount(100, 0, 200, 150)
    expect(result).toBeNaN()
  })

  it('cpiNowが0の場合はNaNを返す', () => {
    const result = calculateInflationAdjustedAmount(100, 100, 0, 150)
    expect(result).toBeNaN()
  })

  it('currencyRateが0の場合はNaNを返す', () => {
    const result = calculateInflationAdjustedAmount(100, 100, 200, 0)
    expect(result).toBeNaN()
  })

  it('負の値でも計算される', () => {
    const result = calculateInflationAdjustedAmount(-100, 100, 200, 1.5)
    expect(result).toBe(-300)
  })

  it('とても大きな数値でも計算される', () => {
    const result = calculateInflationAdjustedAmount(1000000, 50, 100, 2)
    expect(result).toBe(4000000)
  })
})

describe('formatCurrency', () => {
  it('整数が正しくフォーマットされる', () => {
    expect(formatCurrency(1000)).toBe('1,000')
    expect(formatCurrency(1234567)).toBe('1,234,567')
  })

  it('0が正しくフォーマットされる', () => {
    expect(formatCurrency(0)).toBe('0')
  })

  it('負の数が正しくフォーマットされる', () => {
    expect(formatCurrency(-1000)).toBe('-1,000')
  })

  it('小数点以下はそのまま表示される', () => {
    expect(formatCurrency(1000.4)).toBe('1,000.4')
    expect(formatCurrency(1000.6)).toBe('1,000.6')
  })

  it('とても大きな数値が正しくフォーマットされる', () => {
    expect(formatCurrency(1000000000)).toBe('1,000,000,000')
  })
})