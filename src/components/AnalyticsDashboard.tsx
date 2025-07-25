import { useEffect, useState } from 'react'

// 簡易的な分析ダッシュボード（開発・デバッグ用）
// 本番環境では実際のGA4ダッシュボードを使用

interface AnalyticsData {
  totalCalculations: number
  popularYears: Array<{ year: string; count: number }>
  popularCurrencies: Array<{ currency: string; count: number }>
  shareRates: {
    twitter: number
    line: number
    email: number
  }
  averageSessionTime: number
  errorRate: number
}

export const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // 開発環境でのみ表示（Ctrl+Shift+Dで切り替え）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(!isVisible)
      }
    }

    if (import.meta.env.DEV) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible])

  // 模擬データ（実際の実装では GA4 API から取得）
  useEffect(() => {
    if (isVisible) {
      // 模擬データの生成（実際はGA4 APIから取得）
      const mockData: AnalyticsData = {
        totalCalculations: 1247,
        popularYears: [
          { year: '1980', count: 156 },
          { year: '1990', count: 134 },
          { year: '2000', count: 98 },
          { year: '1970', count: 87 },
          { year: '2010', count: 76 }
        ],
        popularCurrencies: [
          { currency: 'USD', count: 523 },
          { currency: 'GBP', count: 198 },
          { currency: 'EUR', count: 176 },
          { currency: 'JPY', count: 98 }
        ],
        shareRates: {
          twitter: 23.4,
          line: 18.7,
          email: 8.9
        },
        averageSessionTime: 127.5,
        errorRate: 2.1
      }
      setAnalyticsData(mockData)
    }
  }, [isVisible])

  if (!isVisible || !analyticsData) {
    return null
  }

  return (
    <div className='fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto z-50'>
      <div className='flex justify-between items-center mb-3'>
        <h3 className='text-lg font-semibold'>Analytics Dashboard</h3>
        <button
          onClick={() => setIsVisible(false)}
          className='text-gray-500 hover:text-gray-700'
          aria-label='閉じる'
        >
          ✕
        </button>
      </div>

      <div className='space-y-4 text-sm'>
        {/* 計算実行数 */}
        <div className='border-b pb-2'>
          <h4 className='font-medium text-blue-600'>総計算数</h4>
          <p className='text-2xl font-bold'>{analyticsData.totalCalculations.toLocaleString()}</p>
        </div>

        {/* 人気の年代 */}
        <div className='border-b pb-2'>
          <h4 className='font-medium text-green-600'>人気の年代 Top 5</h4>
          <ul className='space-y-1'>
            {analyticsData.popularYears.map((item, index) => (
              <li key={item.year} className='flex justify-between'>
                <span>{index + 1}. {item.year}年</span>
                <span className='font-medium'>{item.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 人気の通貨 */}
        <div className='border-b pb-2'>
          <h4 className='font-medium text-purple-600'>人気の通貨</h4>
          <ul className='space-y-1'>
            {analyticsData.popularCurrencies.map((item, index) => (
              <li key={item.currency} className='flex justify-between'>
                <span>{index + 1}. {item.currency}</span>
                <span className='font-medium'>{item.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* シェア率 */}
        <div className='border-b pb-2'>
          <h4 className='font-medium text-orange-600'>シェア率</h4>
          <ul className='space-y-1'>
            <li className='flex justify-between'>
              <span>Twitter</span>
              <span className='font-medium'>{analyticsData.shareRates.twitter}%</span>
            </li>
            <li className='flex justify-between'>
              <span>LINE</span>
              <span className='font-medium'>{analyticsData.shareRates.line}%</span>
            </li>
            <li className='flex justify-between'>
              <span>Email</span>
              <span className='font-medium'>{analyticsData.shareRates.email}%</span>
            </li>
          </ul>
        </div>

        {/* パフォーマンス指標 */}
        <div>
          <h4 className='font-medium text-red-600'>パフォーマンス</h4>
          <ul className='space-y-1'>
            <li className='flex justify-between'>
              <span>平均セッション時間</span>
              <span className='font-medium'>{analyticsData.averageSessionTime}秒</span>
            </li>
            <li className='flex justify-between'>
              <span>エラー率</span>
              <span className='font-medium'>{analyticsData.errorRate}%</span>
            </li>
          </ul>
        </div>

        <div className='text-xs text-gray-500 pt-2 border-t'>
          開発モード: Ctrl+Shift+D で切り替え
        </div>
      </div>
    </div>
  )
}

// GA4 Real-time API 連携用の関数（今後の実装用）
export const fetchGA4RealTimeData = async () => {
  // 実際のGA4 Real-time Reporting API連携
  // https://developers.google.com/analytics/devguides/reporting/realtime/v1
  
  try {
    // GA4 APIキーとプロパティIDが必要
    const response = await fetch('/api/analytics/realtime', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
      throw new Error('Analytics API request failed')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch real-time analytics:', error)
    return null
  }
}