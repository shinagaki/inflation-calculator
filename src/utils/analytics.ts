// Google Analytics 4とカスタムイベント追跡

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// Google Analytics設定
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || ''

// Google Analytics初期化
export const initializeGA = () => {
  // 測定IDが設定されていない場合は初期化しない
  if (!GA_MEASUREMENT_ID) {
    console.warn('GA4測定IDが設定されていません。.envファイルにVITE_GA_MEASUREMENT_IDを設定してください。')
    return
  }

  // GA4スクリプトの動的読み込み
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script1)

  // dataLayerとgtag初期化
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: 'インフレ計算機',
    page_location: window.location.href
  })
}

// カスタムイベント定義
export interface CalculationEvent {
  year: string
  currency: string
  amount: string
  result?: number
  calculationTime?: number
}

export interface ShareEvent {
  platform: 'twitter' | 'bluesky' | 'line' | 'copy'
  year: string
  currency: string
  amount: string
  result: number
}

export interface ErrorEvent {
  error_type: 'network' | 'calculation' | 'validation'
  error_message: string
  year?: string
  currency?: string
  amount?: string
}

// イベント追跡関数群

// 計算実行イベント
export const trackCalculation = (data: CalculationEvent) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'inflation_calculation', {
      custom_parameter_1: data.year,
      custom_parameter_2: data.currency,
      custom_parameter_3: data.amount,
      value: data.result,
      calculation_time: data.calculationTime
    })
  }
  
  // 詳細分析用のカスタムイベント
  window.gtag('event', 'custom_calculation_detail', {
    event_category: 'Calculation',
    event_label: `${data.year}_${data.currency}`,
    value: Number(data.amount),
    custom_dimensions: {
      dimension1: data.year,
      dimension2: data.currency,
      dimension3: data.amount,
      dimension4: data.result?.toString()
    }
  })
}

// シェアイベント
export const trackShare = (data: ShareEvent) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'share', {
      method: data.platform,
      content_type: 'calculation_result',
      item_id: `${data.year}_${data.currency}_${data.amount}`,
      value: data.result
    })
    
    // プラットフォーム別詳細追跡
    window.gtag('event', `share_${data.platform}`, {
      event_category: 'Social Share',
      event_label: `${data.year}_${data.currency}`,
      value: data.result,
      custom_dimensions: {
        dimension1: data.year,
        dimension2: data.currency,
        dimension3: data.amount,
        dimension4: data.platform
      }
    })
  }
}

// エラーイベント
export const trackError = (data: ErrorEvent) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'exception', {
      description: data.error_message,
      fatal: false,
      error_type: data.error_type
    })
    
    // 詳細エラー分析用
    window.gtag('event', 'custom_error', {
      event_category: 'Error',
      event_label: data.error_type,
      error_message: data.error_message,
      custom_dimensions: {
        dimension1: data.year || 'unknown',
        dimension2: data.currency || 'unknown',
        dimension3: data.amount || 'unknown',
        dimension4: data.error_type
      }
    })
  }
}

// ページビューイベント
export const trackPageView = (page_path: string, page_title?: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path,
      page_title: page_title || 'インフレ計算機'
    })
  }
}

// コンバージョンイベント（計算完了 → シェア）
export const trackConversion = (data: CalculationEvent & { shared: boolean }) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      send_to: GA_MEASUREMENT_ID,
      value: data.result,
      currency: 'JPY',
      transaction_id: `calc_${Date.now()}`,
      custom_dimensions: {
        dimension1: data.year,
        dimension2: data.currency,
        dimension3: data.shared ? 'shared' : 'not_shared'
      }
    })
  }
}

// ユーザーエンゲージメント追跡
export const trackEngagement = (engagement_time_msec: number) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'user_engagement', {
      engagement_time_msec
    })
  }
}

// カスタムディメンション送信
export const setCustomDimensions = (dimensions: Record<string, string>) => {
  if (typeof window.gtag === 'function') {
    Object.entries(dimensions).forEach(([key, value]) => {
      window.gtag('config', GA_MEASUREMENT_ID, {
        [key]: value
      })
    })
  }
}