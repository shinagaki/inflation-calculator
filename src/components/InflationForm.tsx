import { ChangeEvent, memo, useRef } from 'react'
import { YEAR_LIST, currencies } from '../constants'
import { formatCurrency } from '../utils/calculations'
import {
  validateAmount,
  validateCurrency,
  validateYear,
} from '../utils/validators'

interface InflationFormProps {
  year: string
  currency: string
  amount: string
  onYearChange: (year: string) => void
  onCurrencyChange: (currency: string) => void
  onAmountChange: (amount: string) => void
}

const InflationFormComponent = ({
  year,
  currency,
  amount,
  onYearChange,
  onCurrencyChange,
  onAmountChange,
}: InflationFormProps) => {
  const amountRef = useRef<HTMLInputElement>(null)

  const handleChangeYear = (yearNew: string) => {
    if (validateYear(yearNew)) {
      onYearChange(yearNew)
    }
  }

  const handleChangeCurrency = (currencyNew: string) => {
    if (validateCurrency(currencyNew)) {
      onCurrencyChange(currencyNew)
    }
  }

  const handleChangeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const inputNumber = e.currentTarget.value.replace(/,/g, '')
    const digit =
      inputNumber.indexOf('.') >= 0
        ? inputNumber.indexOf('.')
        : inputNumber.length
    const decimalDigit =
      inputNumber.indexOf('.') >= 0 ? inputNumber.length - digit - 1 : 0

    if (
      inputNumber.indexOf('.') >= 0 &&
      inputNumber.length > 1 &&
      decimalDigit === 0
    ) {
      return
    }

    if (validateAmount(inputNumber)) {
      onAmountChange(inputNumber)
    }
  }

  if (amountRef.current) {
    amountRef.current.value = formatCurrency(
      Number(parseFloat(amount).toFixed(2)),
    )
  }

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={e => {
        e.preventDefault()
      }}
      role='search'
      aria-label='インフレ計算'
    >
      <div>
        <label
          htmlFor='year'
          className='block text-sm font-medium text-primary-800 mb-1.5'
        >
          西暦
        </label>
        <select
          id='year'
          name='year'
          className='w-full rounded-lg border border-primary-200 bg-white py-2.5 px-4 text-lg text-primary-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-400/30 focus:outline-none transition-all duration-200 cursor-pointer'
          required
          onChange={e => handleChangeYear(e.currentTarget.value)}
          value={year}
        >
          {YEAR_LIST.map(year => (
            <option key={year} value={year}>
              {year}年
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor='amount'
          className='block text-sm font-medium text-primary-800 mb-1.5'
        >
          金額
        </label>
        <div className='flex rounded-lg border border-primary-200 overflow-hidden focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-400/30 transition-all duration-200'>
          <input
            type='text'
            name='amount'
            id='amount'
            autoComplete='off'
            className='flex-1 min-w-0 py-2.5 px-4 text-lg text-primary-900 bg-white border-0 focus:ring-0 focus:outline-none'
            required
            onChange={handleChangeAmount}
            defaultValue={amount}
            inputMode='numeric'
            pattern='^([1-9][\d,]*|0)(\.\d+)?$'
            ref={amountRef}
            aria-describedby='currency-hint'
          />
          <label htmlFor='currency' className='sr-only'>
            通貨
          </label>
          <select
            id='currency'
            name='currency'
            className='border-l border-primary-200 bg-primary-50 py-2.5 px-3 sm:px-4 text-sm sm:text-base text-primary-800 font-medium focus:ring-0 focus:outline-none cursor-pointer transition-colors duration-200 hover:bg-primary-100'
            required
            onChange={e => handleChangeCurrency(e.target.value)}
            value={currency}
          >
            {currencies.map(currency => (
              <option key={currency.value} value={currency.value}>
                {currency.emoji}&nbsp;{currency.label}
              </option>
            ))}
          </select>
        </div>
        <p id='currency-hint' className='sr-only'>
          金額を入力し、右側のドロップダウンで通貨を選択してください
        </p>
      </div>
    </form>
  )
}

export const InflationForm = memo(InflationFormComponent)
