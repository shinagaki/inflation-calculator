import { useEffect, useRef } from 'react'
import {
  initializeGA,
  trackCalculation,
  trackShare,
  trackError,
  trackPageView,
  trackConversion,
  trackEngagement,
  type CalculationEvent,
  type ShareEvent,
  type ErrorEvent
} from '../utils/analytics'

// アナリティクス関連のカスタムフック

export const useAnalytics = () => {
  const sessionStartTime = useRef<number>(Date.now())
  const lastInteractionTime = useRef<number>(Date.now())

  // GA初期化
  useEffect(() => {
    // 開発環境では無効化（本番環境のみ有効）
    if (import.meta.env.PROD) {
      initializeGA()
    }
  }, [])

  // ページ離脱時のエンゲージメント追跡
  useEffect(() => {
    const handleBeforeUnload = () => {
      const engagementTime = Date.now() - sessionStartTime.current
      trackEngagement(engagementTime)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // 最後のユーザー操作時間を記録
  const updateLastInteraction = () => {
    lastInteractionTime.current = Date.now()
  }

  return {
    trackCalculation,
    trackShare,
    trackError,
    trackPageView,
    trackConversion,
    updateLastInteraction,
    getSessionDuration: () => Date.now() - sessionStartTime.current,
    getTimeSinceLastInteraction: () => Date.now() - lastInteractionTime.current
  }
}

// 計算パフォーマンス追跡フック
export const useCalculationTracking = () => {
  const calculationStartTime = useRef<number>()
  const { trackCalculation: baseTrackCalculation, trackError } = useAnalytics()

  const startCalculation = () => {
    calculationStartTime.current = Date.now()
  }

  const trackCalculation = (data: Omit<CalculationEvent, 'calculationTime'>) => {
    const calculationTime = calculationStartTime.current 
      ? Date.now() - calculationStartTime.current 
      : undefined

    baseTrackCalculation({
      ...data,
      calculationTime
    })
  }

  const trackCalculationError = (error: ErrorEvent) => {
    trackError(error)
  }

  return {
    startCalculation,
    trackCalculation,
    trackCalculationError
  }
}

// シェア追跡フック
export const useShareTracking = () => {
  const { trackShare: baseTrackShare } = useAnalytics()

  const trackShare = (data: ShareEvent) => {
    // シェア前の計算データも含めて追跡
    baseTrackShare(data)
    
    // シェア後のコンバージョンも追跡
    trackConversion({
      year: data.year,
      currency: data.currency,
      amount: data.amount,
      result: data.result,
      shared: true
    })
  }

  return { trackShare }
}

// ページビュー追跡フック（Wouter連携）
export const usePageTracking = (location: string) => {
  const { trackPageView } = useAnalytics()
  
  useEffect(() => {
    // URLに基づいてページタイトルを生成
    let pageTitle = 'インフレ計算機'
    
    // パラメータ付きページの場合、詳細なタイトルを設定
    const pathSegments = location.split('/').filter(Boolean)
    if (pathSegments.length === 3) {
      const [year, currency, amount] = pathSegments
      pageTitle = `${year}年の${currency.toUpperCase()}${amount}の価値 - インフレ計算機`
    }
    
    trackPageView(location, pageTitle)
  }, [location, trackPageView])
}

// ユーザー行動分析フック
export const useUserBehaviorTracking = () => {
  const interactionCount = useRef<number>(0)
  const { updateLastInteraction, getSessionDuration, getTimeSinceLastInteraction } = useAnalytics()

  const trackInteraction = (interactionType: string, details?: Record<string, any>) => {
    interactionCount.current += 1
    updateLastInteraction()

    // 長時間の非アクティブ後の復帰を検出
    if (getTimeSinceLastInteraction() > 30000) { // 30秒以上
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'user_returned', {
          event_category: 'User Behavior',
          event_label: interactionType,
          inactive_time: getTimeSinceLastInteraction(),
          session_duration: getSessionDuration()
        })
      }
    }

    // 詳細なインタラクション追跡
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'user_interaction', {
        event_category: 'User Behavior',
        event_label: interactionType,
        interaction_count: interactionCount.current,
        session_duration: getSessionDuration(),
        ...details
      })
    }
  }

  return {
    trackInteraction,
    getInteractionCount: () => interactionCount.current,
    getSessionDuration,
    getTimeSinceLastInteraction
  }
}