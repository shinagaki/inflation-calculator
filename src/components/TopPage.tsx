import { useLocation, useRoute } from 'wouter'
import { AMOUNT_DEFAULT, YEAR_DEFAULT } from '../constants'
import { useExchangeRates } from '../hooks/useExchangeRates'
import { useInflationCalculation } from '../hooks/useInflationCalculation'
import { useSEO } from '../hooks/useSEO'
import {
  validateAmount,
  validateCurrency,
  validateYear,
} from '../utils/validators'
import { InflationForm } from './InflationForm'
import { InflationResult } from './InflationResult'
import { LoadingSpinner } from './LoadingSpinner'

export const TopPage = () => {
  const [match, params] = useRoute('/:year/:currency/:amount')
  const [location, setLocation] = useLocation()

  let year = YEAR_DEFAULT.toString()
  let currency = 'usd'
  let amount = AMOUNT_DEFAULT.toString()

  if (match) {
    if (
      !validateYear(params.year) ||
      !validateCurrency(params.currency) ||
      !validateAmount(params.amount)
    ) {
      setLocation('/')
      return <LoadingSpinner />
    }
    year = params.year
    currency = params.currency
    amount = params.amount
  }

  const { result, resultStatement, shareStatement, loading, error } =
    useInflationCalculation({
      year,
      currency,
      amount,
    })

  const { retry, isUsingFallback, error: ratesError } = useExchangeRates()

  // SEO optimization
  useSEO({
    year,
    currency,
    amount,
    result,
    location,
  })

  const handleChangeYear = (yearNew: string) => {
    setLocation(`/${yearNew}/${currency}/${amount}`)
  }

  const handleChangeCurrency = (currencyNew: string) => {
    setLocation(`/${year}/${currencyNew}/${amount}`)
  }

  const handleChangeAmount = (amountNew: string) => {
    setLocation(`/${year}/${currency}/${amountNew}`)
  }

  return (
    <div className='bg-white/50 hover:bg-white/60 backdrop-blur-lg border border-white/25 shadow-lg rounded-lg px-8 py-6 max-w-xl'>
      <div className='mb-5 sm:mb-10'>
        <InflationForm
          year={year}
          currency={currency}
          amount={amount}
          onYearChange={handleChangeYear}
          onCurrencyChange={handleChangeCurrency}
          onAmountChange={handleChangeAmount}
        />
      </div>

      <hr className='h-px bg-zinc-200 border-0 sm:my-8' />
      <InflationResult
        result={result}
        resultStatement={resultStatement}
        shareStatement={shareStatement}
        location={location}
        loading={loading}
        error={error}
        onRetry={retry}
        isUsingFallback={isUsingFallback}
        isNetworkError={!!ratesError}
      />
    </div>
  )
}
