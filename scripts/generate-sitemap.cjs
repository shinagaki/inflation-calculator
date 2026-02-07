#!/usr/bin/env node

/**
 * Sitemap 生成スクリプト（Programmatic SEO）
 *
 * CPI データの有効範囲を検証しながら、SEO 用の sitemap.xml を
 * public/ に生成する。
 *
 * ルート構成:
 *   1. 歴史的イベント年 × 代表金額（priority 0.9）
 *   2. 毎年の人気検索パターン（priority 0.8）
 *   3. 5年刻み × 通貨 × キリの良い金額（priority 0.7）
 */

const fs = require('fs')
const path = require('path')

const DOMAIN = 'imaikura.creco.net'
const TODAY = new Date().toISOString().split('T')[0]
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml')

// CPI データ読み込み
const cpiData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '..', 'src', 'data', 'cpi_all.json'),
    'utf-8',
  ),
)

/**
 * 指定された年・通貨に CPI データが存在するか検証
 */
function hasCpiData(year, currency) {
  const entry = cpiData.find((d) => d.year === year.toString())
  if (!entry) return false
  const value = entry[currency]
  return value !== '' && value !== undefined && Number(value) > 0
}

// ---------- ルート定義 ----------

/** 通貨ごとの設定（5年刻みの開始年と金額リスト） */
const CURRENCY_CONFIG = {
  jpy: {
    startYear: 1950,
    amounts: [100, 1000, 10000, 100000, 1000000],
  },
  usd: {
    startYear: 1950,
    amounts: [1, 10, 100, 1000, 10000],
  },
  gbp: {
    startYear: 1950,
    amounts: [1, 10, 100, 1000, 10000],
  },
  eur: {
    startYear: 2000,
    amounts: [1, 10, 100, 1000, 10000],
  },
}

/** 歴史的イベント年のルート */
const HISTORICAL_EVENTS = [
  // 終戦（1945）— JPY は CPI データなし
  { year: 1945, currency: 'usd', amount: 1 },
  { year: 1945, currency: 'usd', amount: 100 },
  { year: 1945, currency: 'gbp', amount: 100 },
  // 東京オリンピック（1964）
  { year: 1964, currency: 'jpy', amount: 100 },
  { year: 1964, currency: 'jpy', amount: 1000 },
  // ニクソンショック（1971）
  { year: 1971, currency: 'usd', amount: 1 },
  { year: 1971, currency: 'usd', amount: 100 },
  // オイルショック（1973）
  { year: 1973, currency: 'jpy', amount: 1000 },
  { year: 1973, currency: 'usd', amount: 100 },
  // プラザ合意（1985）
  { year: 1985, currency: 'usd', amount: 1 },
  { year: 1985, currency: 'usd', amount: 100 },
  { year: 1985, currency: 'jpy', amount: 10000 },
  // バブル絶頂期（1989）
  { year: 1989, currency: 'jpy', amount: 10000 },
  { year: 1989, currency: 'jpy', amount: 1000000 },
  // 阪神大震災（1995）
  { year: 1995, currency: 'jpy', amount: 10000 },
  // アジア通貨危機（1997）
  { year: 1997, currency: 'jpy', amount: 10000 },
  // IT バブル（2000）
  { year: 2000, currency: 'usd', amount: 100 },
  { year: 2000, currency: 'eur', amount: 100 },
  // リーマンショック（2008）
  { year: 2008, currency: 'usd', amount: 100 },
  { year: 2008, currency: 'jpy', amount: 10000 },
  // 東日本大震災（2011）
  { year: 2011, currency: 'jpy', amount: 10000 },
  // コロナショック（2020）
  { year: 2020, currency: 'jpy', amount: 10000 },
  { year: 2020, currency: 'usd', amount: 100 },
]

/** 旧 sitemap にあった非標準金額のルート */
const FEATURED_ROUTES = [
  { year: 1970, currency: 'gbp', amount: 50 },
  { year: 2000, currency: 'eur', amount: 500 },
  { year: 1950, currency: 'usd', amount: 20 },
  { year: 2010, currency: 'eur', amount: 50000 },
  { year: 2005, currency: 'eur', amount: 1000 },
  { year: 1995, currency: 'usd', amount: 1000 },
  { year: 1985, currency: 'gbp', amount: 100 },
  { year: 1990, currency: 'jpy', amount: 1000000 },
]

// ---------- ルート生成 ----------

/** 毎年の人気検索パターンを生成 */
function generateYearlyPopularRoutes() {
  const routes = []
  // 「XX年の1万円は今いくら」
  for (let y = 1950; y <= 2020; y++) {
    routes.push({ year: y, currency: 'jpy', amount: 10000 })
  }
  // 「XX年の100ドルは今いくら」
  for (let y = 1950; y <= 2020; y++) {
    routes.push({ year: y, currency: 'usd', amount: 100 })
  }
  return routes
}

/** 5年刻みの系統的ルートを生成 */
function generateSystematicRoutes() {
  const routes = []
  for (const [currency, config] of Object.entries(CURRENCY_CONFIG)) {
    for (let year = config.startYear; year <= 2020; year += 5) {
      for (const amount of config.amounts) {
        routes.push({ year, currency, amount })
      }
    }
  }
  return routes
}

/** 全ルートを生成（重複排除・CPI データ検証済み） */
function generateAllRoutes() {
  const seen = new Set()
  const routes = []

  function addRoute(year, currency, amount, priority) {
    const key = `${year}/${currency}/${amount}`
    if (seen.has(key)) return
    if (!hasCpiData(year, currency)) return
    seen.add(key)
    routes.push({ year, currency, amount, priority })
  }

  // 1. 歴史的イベント（最高優先度）
  for (const r of HISTORICAL_EVENTS) {
    addRoute(r.year, r.currency, r.amount, 0.9)
  }

  // 2. 旧 sitemap のフィーチャー枠
  for (const r of FEATURED_ROUTES) {
    addRoute(r.year, r.currency, r.amount, 0.9)
  }

  // 3. 毎年の人気パターン（高優先度）
  for (const r of generateYearlyPopularRoutes()) {
    addRoute(r.year, r.currency, r.amount, 0.8)
  }

  // 4. 5年刻みの系統的ルート（中優先度）
  for (const r of generateSystematicRoutes()) {
    addRoute(r.year, r.currency, r.amount, 0.7)
  }

  return routes
}

// ---------- sitemap XML 生成 ----------

function generateSitemapXml(routes) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <!-- トップページ -->',
    '  <url>',
    `    <loc>https://${DOMAIN}/</loc>`,
    `    <lastmod>${TODAY}</lastmod>`,
    '    <changefreq>weekly</changefreq>',
    '    <priority>1.0</priority>',
    '  </url>',
  ]

  const priorityLabels = {
    0.9: '歴史的イベント・注目ルート',
    0.8: '人気の計算例（毎年）',
    0.7: '年代別の計算例（5年刻み）',
  }

  let lastPriority = null
  for (const route of routes) {
    if (route.priority !== lastPriority) {
      const label = priorityLabels[route.priority]
      if (label) {
        lines.push('')
        lines.push(`  <!-- ${label} -->`)
      }
      lastPriority = route.priority
    }

    lines.push('  <url>')
    lines.push(
      `    <loc>https://${DOMAIN}/${route.year}/${route.currency}/${route.amount}</loc>`,
    )
    lines.push(`    <lastmod>${TODAY}</lastmod>`)
    lines.push('    <changefreq>monthly</changefreq>')
    lines.push(`    <priority>${route.priority}</priority>`)
    lines.push('  </url>')
  }

  lines.push('</urlset>')
  lines.push('')
  return lines.join('\n')
}

// ---------- メイン ----------

function main() {
  console.log('Sitemap 生成開始...\n')

  const routes = generateAllRoutes()

  // 通貨別の内訳
  const byCurrency = {}
  for (const r of routes) {
    byCurrency[r.currency] = (byCurrency[r.currency] || 0) + 1
  }
  for (const [currency, count] of Object.entries(byCurrency)) {
    console.log(`  ${currency}: ${count} ルート`)
  }

  const xml = generateSitemapXml(routes)
  fs.writeFileSync(OUTPUT_PATH, xml, 'utf-8')

  console.log(`\nSitemap 生成完了: public/sitemap.xml`)
  console.log(`  総ページ数: ${routes.length + 1}（トップ含む）`)
}

main()
