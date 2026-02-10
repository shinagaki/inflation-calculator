#!/usr/bin/env node

/**
 * プリレンダリングスクリプト
 *
 * ビルド後に実行し、sitemap の各ルート用に固有のメタタグ・canonical・
 * 構造化データを含む HTML を dist/ に生成する。
 *
 * SPA のままだが、Googlebot が JS を実行しなくても正しいメタタグと
 * 基本コンテンツが HTML ソースに含まれるようになる。
 */

const fs = require('fs')
const path = require('path')

const DOMAIN = 'imaikura.creco.net'
const OG_IMAGE_BASE = 'https://creco.net/misc/imaikura/og'
const DIST_DIR = path.join(__dirname, '..', 'dist')
const YEAR_NOW = new Date().getFullYear()
const DATE_PARAM = (() => {
  const now = new Date()
  return `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
})()

// フォールバック為替レート（CoinGecko BTC 基準: JPY/通貨）
const FALLBACK_RATES = {
  jpy: 1,
  usd: 1 / 0.0067,
  gbp: 1 / 0.0053,
  eur: 1 / 0.0061,
}

/** CoinGecko API から最新の為替レートを取得 */
async function fetchExchangeRates() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/exchange_rates',
    )
    const rates = (await res.json()).rates
    const result = {
      jpy: 1,
      usd: rates.jpy.value / rates.usd.value,
      gbp: rates.jpy.value / rates.gbp.value,
      eur: rates.jpy.value / rates.eur.value,
    }
    console.log(
      `  為替レート取得成功: USD=${result.usd.toFixed(2)}, GBP=${result.gbp.toFixed(2)}, EUR=${result.eur.toFixed(2)}`,
    )
    return result
  } catch {
    console.warn('  為替レート取得失敗、フォールバック使用')
    return FALLBACK_RATES
  }
}

let EXCHANGE_RATES = FALLBACK_RATES

const CURRENCY_LABELS = {
  jpy: '円',
  usd: 'ドル',
  gbp: 'ポンド',
  eur: 'ユーロ',
}

// 西暦→和暦変換
function toJapaneseEra(year) {
  const y = Number(year)
  if (y >= 2019) return `令和${y - 2018 === 1 ? '元' : y - 2018}年`
  if (y >= 1989) return `平成${y - 1988 === 1 ? '元' : y - 1988}年`
  if (y >= 1926) return `昭和${y - 1925 === 1 ? '元' : y - 1925}年`
  if (y >= 1912) return `大正${y - 1911 === 1 ? '元' : y - 1911}年`
  if (y >= 1868) return `明治${y - 1867}年`
  return null
}

// CPI データ読み込み
const cpiData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '..', 'src', 'data', 'cpi_all.json'),
    'utf-8',
  ),
)

// sitemap.xml からルートを抽出
function parseRoutes() {
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml')
  const xml = fs.readFileSync(sitemapPath, 'utf-8')
  const urlPattern = new RegExp(
    `<loc>https://${DOMAIN.replace('.', '\\.')}(/[^<]+)</loc>`,
    'g',
  )
  const routes = []
  let match
  while ((match = urlPattern.exec(xml)) !== null) {
    const routePath = match[1]
    const parts = routePath.match(/^\/(\d+)\/([a-z]+)\/(\d+(?:\.\d+)?)$/)
    if (parts) {
      routes.push({ year: parts[1], currency: parts[2], amount: parts[3] })
    }
  }
  return routes
}

// インフレ計算（useInflationCalculation と同じロジック）
function calculateResult(year, currency, amount) {
  const cpiLine = cpiData.find((d) => d.year === year)
  const cpiNowLine =
    cpiData.find((d) => d.year === YEAR_NOW.toString()) ||
    cpiData.find((d) => d.year === (YEAR_NOW - 1).toString())

  if (!cpiLine || !cpiNowLine) return null

  const cpi = Number(cpiLine[currency])
  const cpiNow = Number(cpiNowLine[currency])
  const exchangeRate = EXCHANGE_RATES[currency]

  if (!cpi || !cpiNow || !exchangeRate) return null

  return Math.round(Number(amount) * (cpiNow / cpi) * exchangeRate)
}

// 数値フォーマット
function formatCurrency(num) {
  return new Intl.NumberFormat('ja-JP').format(num)
}

// 構造化データ生成
function generateStructuredData(year, currency, amount, result) {
  const currencyLabel = CURRENCY_LABELS[currency]
  const formattedAmount = formatCurrency(Number(amount))
  const formattedResult = formatCurrency(result)
  const eraName = toJapaneseEra(year)
  const eraLabel = eraName ? `（${eraName}）` : ''

  const data = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: '今いくら',
      description: '昔のお金の価値を現在の日本円に換算するインフレ計算機',
      url: `https://${DOMAIN}/`,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      author: {
        '@type': 'Organization',
        name: 'creco',
        url: 'https://creco.net/',
      },
      inLanguage: 'ja-JP',
      isAccessibleForFree: true,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `${year}年${eraLabel}の${formattedAmount}${currencyLabel}は今いくらですか？`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${year}年${eraLabel}の${formattedAmount}${currencyLabel}は、現在の価値で約${formattedResult}円に相当します。この計算は消費者物価指数（CPI）データに基づいて行われています。`,
          },
        },
        {
          '@type': 'Question',
          name: 'インフレ計算はどのように行われますか？',
          acceptedAnswer: {
            '@type': 'Answer',
            text: '当サイトでは、各国の消費者物価指数（CPI）データと現在の為替レートを使用して、過去の金額を現在の日本円価値に換算しています。',
          },
        },
      ],
    },
  ]

  return data
    .map(
      (item, i) =>
        `<script type="application/ld+json" id="structured-data-${i}">${JSON.stringify(item)}</script>`,
    )
    .join('\n    ')
}

// HTML テンプレートのメタタグを置換してプリレンダリング済み HTML を生成
function generateHTML(template, { year, currency, amount, result }) {
  const currencyLabel = CURRENCY_LABELS[currency]
  const formattedAmount = formatCurrency(Number(amount))
  const formattedResult = formatCurrency(result)
  const canonicalUrl = `https://${DOMAIN}/${year}/${currency}/${amount}`
  const eraName = toJapaneseEra(year)
  const eraLabel = eraName ? `（${eraName}）` : ''
  const eraKeyword = eraName ? `,${eraName}` : ''

  const title = `${year}年の${formattedAmount}${currencyLabel}は今${formattedResult}円 | 今いくら`
  const description = `${year}年${eraLabel}の${formattedAmount}${currencyLabel}を現在の日本円に換算すると${formattedResult}円です。インフレ率を考慮した正確な価値を計算できます。`
  const ogTitle = `${year}年の${formattedAmount}${currencyLabel}は今${formattedResult}円！`
  const ogDescription = `昔のお金の価値を今の価値に換算。${year}年${eraLabel}の${formattedAmount}${currencyLabel}は現在の${formattedResult}円相当です。`
  const keywords = `インフレ計算,${year}年${eraKeyword},${currencyLabel},物価,昔の価値,現在価値,CPI,消費者物価指数,貨幣価値 換算`

  let html = template

  // title
  html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)

  // meta tags
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    `<meta name="description" content="${description}" />`,
  )
  html = html.replace(
    /<meta name="keywords" content=".*?" \/>/,
    `<meta name="keywords" content="${keywords}" />`,
  )

  // canonical
  html = html.replace(
    /<link rel="canonical" href=".*?" \/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`,
  )

  // Open Graph
  html = html.replace(
    /<meta property="og:title" content=".*?" \/>/,
    `<meta property="og:title" content="${ogTitle}" />`,
  )
  html = html.replace(
    /<meta property="og:description" content=".*?" \/>/,
    `<meta property="og:description" content="${ogDescription}" />`,
  )
  html = html.replace(
    /<meta property="og:url" content=".*?" \/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`,
  )

  // OG image
  const ogImageUrl = `${OG_IMAGE_BASE}/${year}/${currency}/${amount}.png?r=${result}&d=${DATE_PARAM}`
  html = html.replace(
    /<meta property="og:image" content=".*?" \/>/,
    `<meta property="og:image" content="${ogImageUrl}" />`,
  )

  // Twitter Card
  html = html.replace(
    /<meta name="twitter:title" content=".*?" \/>/,
    `<meta name="twitter:title" content="${title}" />`,
  )
  html = html.replace(
    /<meta name="twitter:description" content=".*?" \/>/,
    `<meta name="twitter:description" content="${description}" />`,
  )
  html = html.replace(
    /<meta name="twitter:image" content=".*?" \/>/,
    `<meta name="twitter:image" content="${ogImageUrl}" />`,
  )

  // 構造化データを </head> の前に挿入
  const structuredData = generateStructuredData(year, currency, amount, result)
  html = html.replace('</head>', `    ${structuredData}\n  </head>`)

  // noscript コンテンツを </body> の前に挿入（JS 無効時のフォールバック）
  const noscriptContent = `    <noscript>
      <div style="max-width:600px;margin:2rem auto;padding:1rem;font-family:sans-serif">
        <h1>${title}</h1>
        <p>${description}</p>
        <p>計算結果: <strong>${formattedResult}円</strong>（参考値）</p>
      </div>
    </noscript>`
  html = html.replace('</body>', `${noscriptContent}\n  </body>`)

  return html
}

// メイン処理
async function main() {
  console.log('プリレンダリング開始...\n')

  EXCHANGE_RATES = await fetchExchangeRates()

  const templatePath = path.join(DIST_DIR, 'index.html')
  if (!fs.existsSync(templatePath)) {
    console.error('エラー: dist/index.html が見つかりません。先に npm run build を実行してください。')
    process.exit(1)
  }

  const template = fs.readFileSync(templatePath, 'utf-8')
  const routes = parseRoutes()

  console.log(`sitemap から ${routes.length} ルートを検出\n`)

  let count = 0
  for (const route of routes) {
    const result = calculateResult(route.year, route.currency, route.amount)
    if (result === null) {
      console.warn(
        `  skip /${route.year}/${route.currency}/${route.amount} (計算不可)`,
      )
      continue
    }

    const html = generateHTML(template, { ...route, result })
    const outputDir = path.join(
      DIST_DIR,
      route.year,
      route.currency,
      route.amount,
    )
    fs.mkdirSync(outputDir, { recursive: true })
    fs.writeFileSync(path.join(outputDir, 'index.html'), html)
    count++
    console.log(
      `  ✓ /${route.year}/${route.currency}/${route.amount} → ${formatCurrency(result)}円`,
    )
  }

  console.log(`\nプリレンダリング完了: ${count}/${routes.length} ページ生成`)
}

main().catch((err) => {
  console.error('プリレンダリングエラー:', err)
  process.exit(1)
})
