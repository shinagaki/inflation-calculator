import { memo, lazy, Suspense } from 'react'
import { formatCurrency } from '../utils/calculations'
import { useCountUp } from '../hooks/useCountUp'

const ShareButtons = lazy(() => import('./ShareButtons'))

const AnimatedResult = ({ result, isUsingFallback }: { result: number; isUsingFallback: boolean }) => {
  const animatedValue = useCountUp(result)
  const suffix = isUsingFallback ? '円（参考値）' : '円'

  return (
    <span className='text-primary-900 font-heading font-black'>
      {formatCurrency(animatedValue)}
      <span className='text-primary-600 text-xl sm:text-2xl ml-1'>{suffix}</span>
    </span>
  )
}

interface InflationResultProps {
  result?: number
  resultStatement: string
  shareStatement: string
  location: string
  loading: boolean
  error: string | null
  onRetry?: () => void
  isUsingFallback?: boolean
  isNetworkError?: boolean
  year?: string
  currency?: string
  amount?: string
}

const InflationResultComponent = ({
  result,
  shareStatement,
  location,
  loading,
  error,
  onRetry,
  isUsingFallback = false,
  isNetworkError = false,
  year,
  currency,
  amount,
}: InflationResultProps) => {
  if (loading) {
    return (
      <section className='my-6 text-center px-4' aria-live='polite' aria-label='計算状況'>
        <p className='text-sm sm:text-base text-primary-700'>計算中...</p>
      </section>
    )
  }

  if (error && result == null) {
    return (
      <section className='my-6 text-center' role='alert' aria-label='エラー情報'>
        <div className='mb-4'>
          <p className='text-red-600 mb-2' aria-hidden='true'>&#9888;&#65039;</p>
          <p className='text-red-600 mb-3'>{error}</p>
          {onRetry && isNetworkError && (
            <button
              onClick={onRetry}
              className='px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 min-h-[44px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:ring-offset-2'
              aria-label='計算を再試行する'
            >
              再試行
            </button>
          )}
        </div>
      </section>
    )
  }

  if (typeof result === 'undefined') {
    return (
      <section className='my-6 text-center px-4' aria-label='使用方法'>
        <p className='text-sm sm:text-base text-primary-700'>西暦を選択し、金額に数値を入れて、通貨を選択します</p>
      </section>
    )
  }

  return (
    <section className='my-8' aria-labelledby='result-heading'>
      <h2 id='result-heading' className='sr-only'>計算結果</h2>

      {(error || isUsingFallback) && (
        <div className='mb-4 text-center' role='alert' aria-live='polite'>
          <div className='inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg'>
            <span className='text-yellow-800 text-sm'>
              {error || '為替レートは参考値です'}
            </span>
            {onRetry && (isNetworkError || isUsingFallback) && (
              <button
                onClick={onRetry}
                className='ml-3 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 min-h-[36px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:ring-offset-2'
                aria-label='データを再取得する'
              >
                再試行
              </button>
            )}
          </div>
        </div>
      )}

      <div className='flex flex-col items-center gap-4'>
        <div className='text-center' aria-live='polite'>
          <p className='text-xs sm:text-sm text-primary-600 font-medium mb-2'>現在の価値</p>
          <div className='text-3xl sm:text-4xl lg:text-5xl font-black drop-shadow-[0_0_3px_rgba(255,255,255,0.8)] break-words leading-tight'>
            {Number.isNaN(result) ? (
              <span className='text-primary-700'>計算できません</span>
            ) : (
              <AnimatedResult result={result} isUsingFallback={isUsingFallback} />
            )}
          </div>
        </div>
        {!Number.isNaN(result) && (
          <div aria-label='計算結果を共有' className='mt-2'>
            <Suspense fallback={<div className='w-24 h-8 bg-primary-100 rounded-lg animate-pulse' aria-label='共有ボタンを読み込み中' />}>
              <ShareButtons
                shareStatement={shareStatement}
                location={location}
                year={year}
                currency={currency}
                amount={amount}
                result={result}
              />
            </Suspense>
          </div>
        )}
      </div>
    </section>
  )
}

export const InflationResult = memo(InflationResultComponent)
