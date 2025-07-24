import { URL_DOMAIN, YEAR_NOW } from '../constants'
import { formatCurrency } from './calculations'

interface StructuredDataProps {
  year?: string
  currency?: string
  amount?: string
  result?: number
  location?: string
}

export const generateCalculatorStructuredData = (
  props: StructuredDataProps,
) => {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '今いくら',
    description: '昔のお金の価値を現在の日本円に換算するインフレ計算機',
    url: `https://${URL_DOMAIN}/`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
    },
    author: {
      '@type': 'Organization',
      name: 'creco',
      url: 'https://creco.net/',
    },
    provider: {
      '@type': 'Organization',
      name: 'creco',
      url: 'https://creco.net/',
    },
    dateModified: new Date().toISOString().split('T')[0],
    inLanguage: 'ja-JP',
    isAccessibleForFree: true,
  }

  // 計算結果がある場合は、より詳細な構造化データを追加
  if (props.year && props.currency && props.amount && props.result) {
    const currencyLabel =
      {
        jpy: '円',
        usd: 'ドル',
        gbp: 'ポンド',
        eur: 'ユーロ',
      }[props.currency] || props.currency.toUpperCase()

    return [
      baseStructuredData,
      {
        '@context': 'https://schema.org',
        '@type': 'CalculatorAction',
        agent: {
          '@type': 'WebApplication',
          name: '今いくら',
        },
        object: {
          '@type': 'MonetaryAmount',
          currency: props.currency.toUpperCase(),
          value: props.amount,
        },
        result: {
          '@type': 'MonetaryAmount',
          currency: 'JPY',
          value: props.result,
        },
        startTime: props.year,
        endTime: YEAR_NOW.toString(),
        description: `${props.year}年の${formatCurrency(
          Number(props.amount),
        )}${currencyLabel}を現在の日本円に換算した結果: ${formatCurrency(
          props.result,
        )}円`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `${props.year}年の${formatCurrency(
              Number(props.amount),
            )}${currencyLabel}は今いくらですか？`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `${props.year}年の${formatCurrency(
                Number(props.amount),
              )}${currencyLabel}は、現在の価値で約${formatCurrency(
                props.result,
              )}円に相当します。この計算は消費者物価指数（CPI）データに基づいて行われています。`,
            },
          },
          {
            '@type': 'Question',
            name: 'インフレ計算はどのように行われますか？',
            acceptedAnswer: {
              '@type': 'Answer',
              text: '当サイトでは、各国の消費者物価指数（CPI）データと現在の為替レートを使用して、過去の金額を現在の日本円価値に換算しています。計算式: 過去の金額 × (現在のCPI ÷ 過去のCPI) × 為替レート',
            },
          },
        ],
      },
    ]
  }

  return [baseStructuredData]
}

export const injectStructuredData = (data: any[]) => {
  // 既存の構造化データを削除
  const existingScripts = document.querySelectorAll(
    'script[type="application/ld+json"]',
  )
  existingScripts.forEach(script => script.remove())

  // 新しい構造化データを追加
  data.forEach((item, index) => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(item, null, 2)
    script.id = `structured-data-${index}`
    document.head.appendChild(script)
  })
}
