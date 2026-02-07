import { useEffect } from 'react'
import { URL_DOMAIN } from '../constants'
import { formatCurrency } from '../utils/calculations'
import {
  generateCalculatorStructuredData,
  injectStructuredData,
} from '../utils/structuredData'

interface SEOData {
  year?: string
  currency?: string
  amount?: string
  result?: number
  location?: string
}

interface SEOMetaTags {
  title: string
  description: string
  keywords: string
  ogTitle: string
  ogDescription: string
  ogUrl: string
  ogImage: string
  twitterTitle: string
  twitterDescription: string
}

const generateSEOTags = (data: SEOData): SEOMetaTags => {
  const isCalculation = data.year && data.currency && data.amount

  if (isCalculation && data.result != null && data.currency) {
    const currencyMap: Record<string, string> = {
      jpy: '円',
      usd: 'ドル',
      gbp: 'ポンド',
      eur: 'ユーロ',
    }
    const currencyLabel = currencyMap[data.currency] || data.currency.toUpperCase()

    const formattedAmount = formatCurrency(Number(data.amount))
    const formattedResult = formatCurrency(data.result)

    return {
      title: `${data.year}年の${formattedAmount}${currencyLabel}は今${formattedResult}円 | 今いくら`,
      description: `${data.year}年の${formattedAmount}${currencyLabel}を現在の日本円に換算すると${formattedResult}円です。インフレ率を考慮した正確な価値を計算できます。`,
      keywords: `インフレ計算,${data.year}年,${currencyLabel},物価,昔の価値,現在価値,CPI,消費者物価指数`,
      ogTitle: `💰${data.year}年の${formattedAmount}${currencyLabel}は今${formattedResult}円！`,
      ogDescription: `昔のお金の価値を今の価値に換算。${data.year}年の${formattedAmount}${currencyLabel}は現在の${formattedResult}円相当です。`,
      ogUrl: `https://${URL_DOMAIN}${data.location || '/'}`,
      ogImage: `https://${URL_DOMAIN}/img/og-default.png`,
      twitterTitle: `${data.year}年の${formattedAmount}${currencyLabel} → 今なら${formattedResult}円！`,
      twitterDescription: `昔のお金の価値、今と比べてどれくらい？インフレ計算で正確に算出。`,
    }
  }

  // デフォルト（ホームページ）
  return {
    title: '今いくら - 昔のお金の価値を現在の日本円で計算',
    description:
      '昔のお金の価値を現在の日本円に換算するインフレ計算機。1900年から現在まで、ドル・ポンド・ユーロ・円の価値変動をCPIデータで正確に計算します。',
    keywords:
      'インフレ計算,物価計算,昔の価値,現在価値,CPI,消費者物価指数,ドル,ポンド,ユーロ,円',
    ogTitle: '今いくら - 昔のお金の価値計算機',
    ogDescription:
      'あの時代のお金って今だといくら？年代と金額を入れるだけで、現在の日本円に換算します。',
    ogUrl: `https://${URL_DOMAIN}/`,
    ogImage: `https://${URL_DOMAIN}/img/og-default.png`,
    twitterTitle: '昔のお金の価値、今だといくら？',
    twitterDescription:
      '年代と金額を入れるだけで現在の価値がわかる！インフレ計算機',
  }
}

const updateMetaTag = (
  property: string,
  content: string,
  isProperty = true,
) => {
  const selector = isProperty
    ? `meta[property="${property}"]`
    : `meta[name="${property}"]`
  let meta = document.querySelector(selector) as HTMLMetaElement

  if (!meta) {
    meta = document.createElement('meta')
    if (isProperty) {
      meta.setAttribute('property', property)
    } else {
      meta.setAttribute('name', property)
    }
    document.head.appendChild(meta)
  }

  meta.setAttribute('content', content)
}

export const useSEO = (data: SEOData = {}) => {
  useEffect(() => {
    const tags = generateSEOTags(data)

    // Basic meta tags
    document.title = tags.title
    updateMetaTag('description', tags.description, false)
    updateMetaTag('keywords', tags.keywords, false)

    // Open Graph tags
    updateMetaTag('og:title', tags.ogTitle)
    updateMetaTag('og:description', tags.ogDescription)
    updateMetaTag('og:url', tags.ogUrl)
    updateMetaTag('og:image', tags.ogImage)
    updateMetaTag('og:type', 'website')
    updateMetaTag('og:site_name', '今いくら')
    updateMetaTag('og:locale', 'ja_JP')

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', false)
    updateMetaTag('twitter:title', tags.twitterTitle, false)
    updateMetaTag('twitter:description', tags.twitterDescription, false)
    updateMetaTag('twitter:image', tags.ogImage, false)
    updateMetaTag('twitter:site', '@creco', false)

    // Canonical URL
    let canonical = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', tags.ogUrl)

    // 構造化データの追加
    const structuredData = generateCalculatorStructuredData(data)
    injectStructuredData(structuredData)
  }, [data.year, data.currency, data.amount, data.result, data.location])

  return generateSEOTags(data)
}
