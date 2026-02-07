import { useState } from 'react'
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
    <>
      {/* メイン計算機 - 常に固定幅 */}
      <div className='bg-white/50 hover:bg-white/60 backdrop-blur-lg border border-white/25 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl px-8 py-6 max-w-xl mx-auto transition-shadow duration-300'>
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
          year={year}
          currency={currency}
          amount={amount}
        />

        {/* 詳細表示ボタン */}
        {match && !loading && !error && result && (
          <div className='mt-6 text-center'>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className='px-6 py-2 bg-white/60 hover:bg-white/80 text-zinc-700 hover:text-zinc-900 font-medium rounded-lg border border-white/40 hover:border-white/60 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md'
            >
              {showDetails ? '詳細を隠す ▲' : '詳細な解説・関連情報を見る ▼'}
            </button>
          </div>
        )}
      </div>

      {/* SEOコンテンツセクション（トグル表示） - 独立したコンテナ */}
      {showDetails && match && !loading && !error && (
        <div className='w-full max-w-4xl mx-auto px-4 mt-8'>
          <SEOContent
            year={year}
            currency={currency}
            amount={amount}
            result={result}
          />
          
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
