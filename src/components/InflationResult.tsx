import { memo, lazy, Suspense } from 'react'

// シェア機能の遅延読み込み
const ShareButtons = lazy(() => import('./ShareButtons'))

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
}

const InflationResultComponent = ({
  result,
  resultStatement,
  shareStatement,
  location,
  loading,
  error,
  onRetry,
  isUsingFallback = false,
  isNetworkError = false,
}: InflationResultProps) => {
  if (loading) {
    return (
      <section className='my-6 text-center px-4' aria-live='polite' aria-label='計算状況'>
        <p className='text-sm sm:text-base'>計算中...</p>
      </section>
    )
  }

  if (error && !result) {
    return (
      <section className='my-6 text-center' role='alert' aria-label='エラー情報'>
        <div className='mb-4'>
          <p className='text-red-600 mb-2'>⚠️ {error}</p>
          {onRetry && isNetworkError && (
            <button
              onClick={onRetry}
              className='px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors min-h-[44px] touch-manipulation focus:ring-2 focus:ring-blue-300 focus:ring-offset-2'
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
        <p className='text-sm sm:text-base'>西暦を選択し、金額に数値を入れて、通貨を選択します</p>
      </section>
    )
  }

  return (
    <section className='my-6' aria-labelledby='result-heading'>
      <h2 id='result-heading' className='sr-only'>計算結果</h2>
      {/* 警告メッセージ */}
      {(error || isUsingFallback) && (
        <div className='mb-4 text-center' role='alert' aria-live='polite'>
          <div className='inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-md'>
            <span className='text-yellow-800 text-sm'>
              ⚠️ {error || '為替レートは参考値です'}
            </span>
            {onRetry && (isNetworkError || isUsingFallback) && (
              <button
                onClick={onRetry}
                className='ml-3 px-4 py-2 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors min-h-[36px] touch-manipulation focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2'
                aria-label='データを再取得する'
              >
                再試行
              </button>
            )}
          </div>
        </div>
      )}

      {/* 結果表示 */}
      <div className='flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6'>
        <div className='text-center px-4' aria-live='polite'>
          <div className='text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 drop-shadow-[0_0_3px_rgba(255,255,255,0.8)] break-words'>
            {Number.isNaN(result) ? '計算できません' : (
              <span className='bg-gradient-to-r from-zinc-700 via-zinc-800 to-zinc-900 bg-clip-text text-transparent'>
                {resultStatement}
              </span>
            )}
          </div>
        </div>
        {!Number.isNaN(result) && (
          <div aria-label='計算結果を共有'>
            <Suspense fallback={<div className='w-24 h-8 bg-gray-200 rounded animate-pulse' aria-label='共有ボタンを読み込み中' />}>
              <ShareButtons shareStatement={shareStatement} location={location} />
            </Suspense>
          </div>
        )}
      </div>
    </section>
  )
}

// React.memoでラップして不要な再レンダリングを防止
export const InflationResult = memo(InflationResultComponent)
