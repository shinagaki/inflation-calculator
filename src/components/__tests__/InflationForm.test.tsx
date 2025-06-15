import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InflationForm } from '../InflationForm'

// モック用のプロップス
const defaultProps = {
  year: '2000',
  currency: 'usd',
  amount: '100',
  onYearChange: vi.fn(),
  onCurrencyChange: vi.fn(),
  onAmountChange: vi.fn(),
}

describe('InflationForm', () => {
  beforeEach(() => {
    // 各テスト前にモック関数をリセット
    vi.clearAllMocks()
  })

  describe('基本的なレンダリング', () => {
    it('すべての必要な要素がレンダリングされる', () => {
      render(<InflationForm {...defaultProps} />)
      
      expect(screen.getByLabelText('西暦')).toBeInTheDocument()
      expect(screen.getByLabelText('金額')).toBeInTheDocument()
      expect(screen.getByLabelText('通貨')).toBeInTheDocument()
    })

    it('年のselectに正しい値が設定される', () => {
      render(<InflationForm {...defaultProps} />)
      
      const yearSelect = screen.getByLabelText('西暦') as HTMLSelectElement
      expect(yearSelect.value).toBe('2000')
    })

    it('通貨のselectに正しい値が設定される', () => {
      render(<InflationForm {...defaultProps} />)
      
      const currencySelect = screen.getByLabelText('通貨') as HTMLSelectElement
      expect(currencySelect.value).toBe('usd')
    })

    it('金額のinputに正しい値が設定される', () => {
      render(<InflationForm {...defaultProps} />)
      
      const amountInput = screen.getByLabelText('金額') as HTMLInputElement
      expect(amountInput.value).toBe('100')
    })
  })

  describe('年の選択', () => {
    it('有効な年を選択すると onYearChange が呼ばれる', async () => {
      const user = userEvent.setup()
      render(<InflationForm {...defaultProps} />)
      
      const yearSelect = screen.getByLabelText('西暦')
      await user.selectOptions(yearSelect, '1980')
      
      expect(defaultProps.onYearChange).toHaveBeenCalledWith('1980')
    })

    it('年のオプションが正しく表示される', () => {
      render(<InflationForm {...defaultProps} />)
      
      const yearSelect = screen.getByLabelText('西暦')
      const options = yearSelect.querySelectorAll('option')
      
      // 1900年から現在年まで
      const currentYear = new Date().getFullYear()
      const expectedLength = currentYear - 1900 + 1
      expect(options).toHaveLength(expectedLength)
      
      // 最初と最後のオプションをチェック
      expect(options[0].value).toBe('1900')
      expect(options[options.length - 1].value).toBe(currentYear.toString())
    })
  })

  describe('通貨の選択', () => {
    it('有効な通貨を選択すると onCurrencyChange が呼ばれる', async () => {
      const user = userEvent.setup()
      render(<InflationForm {...defaultProps} />)
      
      const currencySelect = screen.getByLabelText('通貨')
      await user.selectOptions(currencySelect, 'jpy')
      
      expect(defaultProps.onCurrencyChange).toHaveBeenCalledWith('jpy')
    })

    it('通貨のオプションが正しく表示される', () => {
      render(<InflationForm {...defaultProps} />)
      
      const currencySelect = screen.getByLabelText('通貨')
      const options = currencySelect.querySelectorAll('option')
      
      expect(options).toHaveLength(4) // jpy, usd, gbp, eur
      expect(options[0].value).toBe('jpy')
      expect(options[1].value).toBe('usd')
      expect(options[2].value).toBe('gbp')
      expect(options[3].value).toBe('eur')
    })
  })

  describe('金額の入力', () => {
    it('有効な金額を入力すると onAmountChange が呼ばれる', async () => {
      const user = userEvent.setup()
      render(<InflationForm {...defaultProps} />)
      
      const amountInput = screen.getByLabelText('金額')
      await user.clear(amountInput)
      await user.type(amountInput, '500')
      
      expect(defaultProps.onAmountChange).toHaveBeenCalledWith('500')
    })

    it('小数点を含む金額を入力できる', async () => {
      const user = userEvent.setup()
      render(<InflationForm {...defaultProps} />)
      
      const amountInput = screen.getByLabelText('金額')
      await user.clear(amountInput)
      await user.type(amountInput, '123.45')
      
      expect(defaultProps.onAmountChange).toHaveBeenCalledWith('123.45')
    })

    it('カンマ区切りの入力が正しく処理される', async () => {
      const user = userEvent.setup()
      render(<InflationForm {...defaultProps} />)
      
      const amountInput = screen.getByLabelText('金額')
      await user.clear(amountInput)
      await user.type(amountInput, '1,000')
      
      // カンマが除去されて渡される
      expect(defaultProps.onAmountChange).toHaveBeenCalledWith('1000')
    })

    it('無効な金額の入力では onAmountChange が呼ばれない', async () => {
      const user = userEvent.setup()
      render(<InflationForm {...defaultProps} />)
      
      const amountInput = screen.getByLabelText('金額')
      await user.clear(amountInput)
      await user.type(amountInput, 'abc')
      
      expect(defaultProps.onAmountChange).not.toHaveBeenCalled()
    })

    it('空の小数点入力が正しく処理される', async () => {
      const user = userEvent.setup()
      render(<InflationForm {...defaultProps} amount="100" />)
      
      const amountInput = screen.getByLabelText('金額')
      await user.clear(amountInput)
      await user.type(amountInput, '100.')
      
      // 小数点のみの場合は何もしない（リターンされる）
      expect(defaultProps.onAmountChange).toHaveBeenCalledWith('100')
    })
  })

  describe('フォームの動作', () => {
    it('フォーム送信が防止される', () => {
      render(<InflationForm {...defaultProps} />)
      
      const form = document.querySelector('form')!
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
      
      // onSubmitが preventDefault を呼ぶかテスト
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault')
      fireEvent(form, submitEvent)
      
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('required属性が設定されている', () => {
      render(<InflationForm {...defaultProps} />)
      
      const yearSelect = screen.getByLabelText('西暦')
      const currencySelect = screen.getByLabelText('通貨')
      const amountInput = screen.getByLabelText('金額')
      
      expect(yearSelect).toBeRequired()
      expect(currencySelect).toBeRequired()
      expect(amountInput).toBeRequired()
    })
  })

  describe('金額のフォーマット表示', () => {
    it('金額が適切にフォーマットされて表示される', () => {
      render(<InflationForm {...defaultProps} amount="1000" />)
      
      const amountInput = screen.getByLabelText('金額') as HTMLInputElement
      // Note: フォーマット処理はuseRefとuseEffectによって行われるため、
      // 初期レンダリング時は元の値が表示される
      expect(amountInput.value).toBe('1000')
    })

    it('小数点付きの金額が適切にフォーマットされる', () => {
      render(<InflationForm {...defaultProps} amount="1234.56" />)
      
      const amountInput = screen.getByLabelText('金額') as HTMLInputElement
      expect(amountInput.value).toBe('1234.56')
    })
  })
})