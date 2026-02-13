import { useEffect, useState } from 'react'
import { useLocation, useRoute } from 'wouter'
import { AMOUNT_DEFAULT, YEAR_DEFAULT } from '../constants'
import { useCpiData } from '../hooks/useCpiData'
import { useExchangeRates } from '../hooks/useExchangeRates'
import { useInflationCalculation } from '../hooks/useInflationCalculation'
import { useSEO } from '../hooks/useSEO'
import {
  validateAmount,
  validateCurrency,
  validateYear,
} from '../utils/validators'
import { CpiTrendChart } from './CpiTrendChart'
import { InflationForm } from './InflationForm'
import { InflationResult } from './InflationResult'
import { SEOContent } from './SEOContent'
import { FAQSection } from './FAQSection'
import { RelatedCalculations } from './RelatedCalculations'

export const TopPage = () => {
  const [match, params] = useRoute('/:year/:currency/:amount')
  const [location, setLocation] = useLocation()
  const [showDetails, setShowDetails] = useState(false)

  let year = YEAR_DEFAULT.toString()
  let currency = 'usd'
  let amount = AMOUNT_DEFAULT.toString()

  const isInvalidParams = match && (
    !validateYear(params.year) ||
    !validateCurrency(params.currency) ||
    !validateAmount(params.amount)
  )

  useEffect(() => {
    if (isInvalidParams) {
      setLocation('/')
    }
  }, [isInvalidParams, setLocation])

  if (match && !isInvalidParams) {
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
  const { cpiData } = useCpiData()

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
    <>
      <div className='bg-white/85 backdrop-blur-lg border border-primary-200/50 shadow-card hover:shadow-card-hover rounded-xl px-4 sm:px-8 py-5 w-full max-w-xl mx-auto my-2 transition-shadow duration-200'>
        <div className='mb-4 sm:mb-6'>
          <InflationForm
            year={year}
            currency={currency}
            amount={amount}
            onYearChange={handleChangeYear}
            onCurrencyChange={handleChangeCurrency}
            onAmountChange={handleChangeAmount}
          />
        </div>

        <hr className='h-px bg-primary-200/50 border-0 sm:my-6' />
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
          year={year}
          currency={currency}
          amount={amount}
        />

        {match && !loading && !error && result != null && (
          <div className='mt-6 text-center'>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className='px-6 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 hover:text-primary-900 font-medium rounded-lg border border-primary-200 hover:border-primary-300 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-400/30'
              aria-expanded={showDetails}
              aria-controls='detail-section'
            >
              {showDetails ? '詳細を隠す' : '詳細な解説・関連情報を見る'}
              <span
                className={`inline-block ml-2 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
                aria-hidden='true'
              >
                &#9660;
              </span>
            </button>
          </div>
        )}
      </div>

      {showDetails && match && !loading && !error && (
        <div id='detail-section' className='w-full max-w-4xl mx-auto px-4 mt-8'>
          <SEOContent
            year={year}
            currency={currency}
            amount={amount}
            result={result}
          />

          {cpiData && (
            <CpiTrendChart
              cpiData={cpiData}
              currency={currency}
              selectedYear={year}
            />
          )}

          <RelatedCalculations
            currentYear={year}
            currentCurrency={currency}
            currentAmount={amount}
          />

          <FAQSection />
        </div>
      )}
    </>
  )
}
