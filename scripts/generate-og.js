#!/usr/bin/env node

/**
 * OG 画像生成スクリプト
 *
 * ビルド後に実行し、sitemap の各ルート用に固有の OG 画像（1200x630 PNG）を
 * dist/og/{year}/{currency}/{amount}.png に生成する。
 *
 * デザイン: ダーク背景 + ゴールドアクセント
 * フォント: Google Fonts Noto Sans JP（必要文字のみサブセット取得）
 */

import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DOMAIN = 'imaikura.creco.net'
const DIST_DIR = path.join(__dirname, '..', 'dist')
const YEAR_NOW = new Date().getFullYear()

// フォールバック為替レート（prerender.cjs と同じ）
const EXCHANGE_RATES = {
  jpy: 1,
  usd: 1 / 0.0067,
  gbp: 1 / 0.0053,
  eur: 1 / 0.0061,
}

const CURRENCY_LABELS = {
  jpy: '円',
  usd: 'ドル',
  gbp: 'ポンド',
  eur: 'ユーロ',
}

// OG 画像で使用する文字のサブセット（計算ページ + デフォルトページ）
const FONT_CHARS = [
  '年の万億兆千円約現在価値',         // 計算結果
  'ドルポンドユーロ',                   // 通貨名
  'いくら今昔お金を換算にへ',         // デフォルト OG
  '0123456789,.',                       // 数字・記号
  '▼ ',                                 // 矢印・スペース
  'abcdefghijklmnopqrstuvwxyz',         // ドメイン名
].join('')

// CPI データ読み込み
const cpiData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '..', 'src', 'data', 'cpi_all.json'),
    'utf-8',
  ),
)

// ---------- フォント取得 ----------

async function loadGoogleFont(weight) {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&text=${encodeURIComponent(FONT_CHARS)}`

  // Safari UA → TrueType 形式を取得（satori の opentype.js が確実にパースできる）
  const css = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
    },
  }).then((r) => r.text())

  const fontUrl = css.match(/src:\s*url\((.+?)\)/)?.[1]
  if (!fontUrl) throw new Error(`Font URL not found for weight ${weight}`)

  const data = await fetch(fontUrl).then((r) => r.arrayBuffer())
  return data
}

// ---------- 計算ロジック ----------

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

// ---------- 金額フォーマット ----------

/**
 * 結果の日本円を OG 画像用にフォーマット
 * @returns {{ main: string, suffix: string }}
 *
 * ルール:
 *   < 1万        → そのまま数字（カンマ区切り）+ "円"
 *   1万〜1億未満 → X万Y千 + "円"（千が0なら省略、万にカンマ区切り）
 *   1億〜1兆未満 → X億Y,ZZZ + "万円"（万が0なら "億円"）
 *   1兆以上      → X,XXX兆Y,ZZZ + "億円"（億が0なら "兆円"）
 *   百の位以下は切り捨て（"約" で丸め）
 */
function formatResultJapanese(value) {
  const rounded = Math.round(value)

  if (rounded < 10000) {
    return { main: rounded.toLocaleString('ja-JP'), suffix: '円' }
  }

  if (rounded < 100000000) {
    const man = Math.floor(rounded / 10000)
    const sen = Math.floor((rounded % 10000) / 1000)
    if (sen > 0) {
      return {
        main: `${man.toLocaleString('ja-JP')}万${sen}千`,
        suffix: '円',
      }
    }
    return { main: man.toLocaleString('ja-JP'), suffix: '万円' }
  }

  if (rounded < 1000000000000) {
    const oku = Math.floor(rounded / 100000000)
    const man = Math.floor((rounded % 100000000) / 10000)
    if (man > 0) {
      return {
        main: `${oku.toLocaleString('ja-JP')}億${man.toLocaleString('ja-JP')}`,
        suffix: '万円',
      }
    }
    return { main: oku.toLocaleString('ja-JP'), suffix: '億円' }
  }

  const cho = Math.floor(rounded / 1000000000000)
  const oku = Math.floor((rounded % 1000000000000) / 100000000)
  if (oku > 0) {
    return {
      main: `${cho.toLocaleString('ja-JP')}兆${oku.toLocaleString('ja-JP')}`,
      suffix: '億円',
    }
  }
  return { main: cho.toLocaleString('ja-JP'), suffix: '兆円' }
}

/**
 * 入力金額を OG 画像用にフォーマット
 * 例: (100, 'usd') → '100ドル', (1000000, 'jpy') → '100万円'
 */
function formatInputAmount(amount, currency) {
  const label = CURRENCY_LABELS[currency]
  const num = Number(amount)

  if (num >= 1000000000000) {
    const cho = num / 1000000000000
    return `${cho.toLocaleString('ja-JP')}兆${label}`
  }
  if (num >= 100000000) {
    const oku = num / 100000000
    return `${oku.toLocaleString('ja-JP')}億${label}`
  }
  if (num >= 10000) {
    const man = num / 10000
    return `${man.toLocaleString('ja-JP')}万${label}`
  }
  return `${num.toLocaleString('ja-JP')}${label}`
}

// ---------- サイズ階層 ----------

function getSizeTier(value) {
  if (value >= 100000000) return 'compact-xl'
  if (value >= 10000000) return 'compact'
  return 'default'
}

const SIZE_CONFIG = {
  default: {
    amountFrom: 72,
    amountTo: 110,
    suffix: 64,
    prefix: 56,
  },
  compact: {
    amountFrom: 64,
    amountTo: 96,
    suffix: 56,
    prefix: 48,
  },
  'compact-xl': {
    amountFrom: 60,
    amountTo: 80,
    suffix: 48,
    prefix: 42,
  },
}

// ---------- satori 用ヘルパー ----------

function h(type, style, ...children) {
  const flatChildren = children.flat()
  return {
    type,
    props: {
      style: { display: 'flex', ...style },
      children: flatChildren.length === 1 ? flatChildren[0] : flatChildren,
    },
  }
}

// ---------- OG 画像レイアウト ----------

function createOgElement(yearText, inputText, formatted, sizeTier) {
  const sizes = SIZE_CONFIG[sizeTier]

  return h(
    'div',
    {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: '#0f0f23',
      color: '#e0e0e0',
      fontFamily: 'Noto Sans JP',
      padding: '40px 60px',
    },
    // 年ラベル
    h(
      'div',
      {
        fontSize: 36,
        fontWeight: 700,
        color: '#cccccc',
        marginBottom: 4,
      },
      yearText,
    ),
    // 入力金額
    h(
      'div',
      {
        fontSize: sizes.amountFrom,
        fontWeight: 900,
        marginBottom: 20,
        letterSpacing: -1,
      },
      inputText,
    ),
    // 矢印
    h(
      'div',
      {
        fontSize: 28,
        fontWeight: 700,
        color: '#ffd700',
        marginBottom: 20,
      },
      '▼ 現在の価値',
    ),
    // 結果金額
    h(
      'div',
      {
        alignItems: 'baseline',
        color: '#ffd700',
        letterSpacing: -2,
        lineHeight: 1.1,
      },
      h(
        'span',
        {
          fontSize: sizes.prefix,
          fontWeight: 700,
        },
        '約 ',
      ),
      h(
        'span',
        {
          fontSize: sizes.amountTo,
          fontWeight: 900,
        },
        formatted.main,
      ),
      h(
        'span',
        {
          fontSize: sizes.suffix,
          fontWeight: 700,
        },
        formatted.suffix,
      ),
    ),
    // サイト名
    h(
      'div',
      {
        position: 'absolute',
        bottom: 20,
        fontSize: 20,
        fontWeight: 700,
        color: '#555555',
      },
      `今いくら ${DOMAIN}`,
    ),
  )
}

/** デフォルト OG 画像（トップページ用） */
function createDefaultOgElement() {
  return h(
    'div',
    {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: '#0f0f23',
      color: '#e0e0e0',
      fontFamily: 'Noto Sans JP',
      padding: '60px',
    },
    h(
      'div',
      {
        fontSize: 80,
        fontWeight: 900,
        color: '#ffd700',
        marginBottom: 24,
      },
      '今いくら',
    ),
    h(
      'div',
      {
        fontSize: 36,
        fontWeight: 700,
        color: '#cccccc',
      },
      '昔のお金の価値を現在の円に換算',
    ),
    h(
      'div',
      {
        position: 'absolute',
        bottom: 20,
        fontSize: 20,
        fontWeight: 700,
        color: '#555555',
      },
      DOMAIN,
    ),
  )
}

// ---------- PNG 変換 ----------

async function renderPng(element, fonts) {
  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts,
  })

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  })
  return resvg.render().asPng()
}

// ---------- sitemap パース ----------

function parseRoutes() {
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml')
  if (!fs.existsSync(sitemapPath)) {
    // dist に無ければ public から読む
    const publicPath = path.join(__dirname, '..', 'public', 'sitemap.xml')
    if (!fs.existsSync(publicPath)) return []
    const xml = fs.readFileSync(publicPath, 'utf-8')
    return extractRoutes(xml)
  }
  const xml = fs.readFileSync(sitemapPath, 'utf-8')
  return extractRoutes(xml)
}

function extractRoutes(xml) {
  const urlPattern = new RegExp(
    `<loc>https://${DOMAIN.replace('.', '\\.')}(/[^<]+)</loc>`,
    'g',
  )
  const routes = []
  let match
  while ((match = urlPattern.exec(xml)) !== null) {
    const parts = match[1].match(/^\/(\d+)\/([a-z]+)\/(\d+(?:\.\d+)?)$/)
    if (parts) {
      routes.push({ year: parts[1], currency: parts[2], amount: parts[3] })
    }
  }
  return routes
}

// ---------- メイン ----------

async function main() {
  console.log('OG 画像生成開始...\n')

  if (!fs.existsSync(DIST_DIR)) {
    console.error('エラー: dist/ が見つかりません。先に vite build を実行してください。')
    process.exit(1)
  }

  // フォント読み込み
  console.log('フォント読み込み中...')
  const [fontBold, fontBlack] = await Promise.all([
    loadGoogleFont(700),
    loadGoogleFont(900),
  ])
  const fonts = [
    { name: 'Noto Sans JP', data: fontBold, weight: 700, style: 'normal' },
    { name: 'Noto Sans JP', data: fontBlack, weight: 900, style: 'normal' },
  ]
  console.log('フォント読み込み完了\n')

  const routes = parseRoutes()
  console.log(`${routes.length} ルートの OG 画像を生成\n`)

  let count = 0
  for (const route of routes) {
    const result = calculateResult(route.year, route.currency, route.amount)
    if (result === null) {
      console.warn(`  skip /${route.year}/${route.currency}/${route.amount}`)
      continue
    }

    const formatted = formatResultJapanese(result)
    const inputText = formatInputAmount(route.amount, route.currency)
    const yearText = `${route.year}年の`
    const sizeTier = getSizeTier(result)

    const element = createOgElement(yearText, inputText, formatted, sizeTier)
    const png = await renderPng(element, fonts)

    const outputPath = path.join(
      DIST_DIR,
      'og',
      route.year,
      route.currency,
      `${route.amount}.png`,
    )
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, png)

    count++
    console.log(
      `  ✓ /og/${route.year}/${route.currency}/${route.amount}.png → 約${formatted.main}${formatted.suffix}`,
    )
  }

  // デフォルト OG 画像
  const defaultElement = createDefaultOgElement()
  const defaultPng = await renderPng(defaultElement, fonts)
  const defaultPath = path.join(DIST_DIR, 'og', 'default.png')
  fs.mkdirSync(path.dirname(defaultPath), { recursive: true })
  fs.writeFileSync(defaultPath, defaultPng)
  console.log('  ✓ /og/default.png（トップページ用）')

  console.log(`\nOG 画像生成完了: ${count + 1} 枚`)
}

main().catch((err) => {
  console.error('OG 画像生成エラー:', err)
  process.exit(1)
})
