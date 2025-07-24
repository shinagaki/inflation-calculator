import { describe, expect, it } from 'vitest'
import { validateAmount, validateCurrency, validateYear } from '../validators'

describe('validateYear', () => {
  const currentYear = new Date().getFullYear()

  it('有効な年（現在年）でtrueを返す', () => {
    expect(validateYear(currentYear.toString())).toBe(true)
  })

  it('有効な年（1900）でtrueを返す', () => {
    expect(validateYear('1900')).toBe(true)
  })

  it('有効な年（中間値）でtrueを返す', () => {
    expect(validateYear('1980')).toBe(true)
    expect(validateYear('2000')).toBe(true)
  })

  it('1900年未満の年でfalseを返す', () => {
    expect(validateYear('1899')).toBe(false)
    expect(validateYear('1800')).toBe(false)
  })

  it('現在年より大きい年でfalseを返す', () => {
    expect(validateYear((currentYear + 1).toString())).toBe(false)
    expect(validateYear('2100')).toBe(false)
  })

  it('数値でない文字列でfalseを返す', () => {
    expect(validateYear('abc')).toBe(false)
    expect(validateYear('19ab')).toBe(false)
    expect(validateYear('')).toBe(false)
  })

  it('小数点を含む文字列でfalseを返す', () => {
    expect(validateYear('1980.5')).toBe(false)
    expect(validateYear('2000.0')).toBe(false)
  })

  it('先頭に0がある文字列でfalseを返す', () => {
    expect(validateYear('01980')).toBe(false)
    expect(validateYear('0001980')).toBe(false)
  })

  it('負の数でfalseを返す', () => {
    expect(validateYear('-1980')).toBe(false)
  })
})

describe('validateCurrency', () => {
  it('有効な通貨コードでtrueを返す', () => {
    expect(validateCurrency('usd')).toBe(true)
    expect(validateCurrency('jpy')).toBe(true)
    expect(validateCurrency('gbp')).toBe(true)
    expect(validateCurrency('eur')).toBe(true)
  })

  it('無効な通貨コードでfalseを返す', () => {
    expect(validateCurrency('cad')).toBe(false)
    expect(validateCurrency('krw')).toBe(false)
    expect(validateCurrency('bitcoin')).toBe(false)
  })

  it('大文字の通貨コードでfalseを返す', () => {
    expect(validateCurrency('USD')).toBe(false)
    expect(validateCurrency('JPY')).toBe(false)
  })

  it('空文字列でfalseを返す', () => {
    expect(validateCurrency('')).toBe(false)
  })

  it('無効な文字列でfalseを返す', () => {
    expect(validateCurrency('abc')).toBe(false)
    expect(validateCurrency('123')).toBe(false)
  })
})

describe('validateAmount', () => {
  it('有効な金額でtrueを返す', () => {
    expect(validateAmount('100')).toBe(true)
    expect(validateAmount('1000.5')).toBe(true) // 1000.50は1000.5に変換されるため
    expect(validateAmount('0')).toBe(true)
    expect(validateAmount('0.01')).toBe(true)
  })

  it('小数点以下2桁の金額でtrueを返す', () => {
    expect(validateAmount('123.45')).toBe(true)
    expect(validateAmount('1.99')).toBe(true)
  })

  it('負の金額でfalseを返す', () => {
    expect(validateAmount('-100')).toBe(false)
    expect(validateAmount('-0.01')).toBe(false)
  })

  it('最大値を超える金額でfalseを返す', () => {
    const maxAmount = '10000000000000001' // AMOUNT_MAX + 1
    expect(validateAmount(maxAmount)).toBe(false)
  })

  it('数値でない文字列でfalseを返す', () => {
    expect(validateAmount('abc')).toBe(false)
    expect(validateAmount('10abc')).toBe(false)
    expect(validateAmount('')).toBe(false)
  })

  it('小数点以下3桁以上の金額でfalseを返す', () => {
    expect(validateAmount('100.123')).toBe(false)
    expect(validateAmount('1.999')).toBe(false)
  })

  it('先頭に0がある文字列（ただし0.xxは除く）でfalseを返す', () => {
    expect(validateAmount('0100')).toBe(false)
    expect(validateAmount('00.50')).toBe(false)
    // しかし、これらは有効
    expect(validateAmount('0.5')).toBe(true) // 0.50は0.5に変換されるため
    expect(validateAmount('0')).toBe(true)
  })

  it('複数の小数点を含む文字列でfalseを返す', () => {
    expect(validateAmount('100.50.25')).toBe(false)
    expect(validateAmount('1..50')).toBe(false)
  })
})
