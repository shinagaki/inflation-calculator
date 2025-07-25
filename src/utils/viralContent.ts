import { formatCurrency } from './calculations'

interface ComparisonItem {
  name: string
  price: number
  emoji: string
  unit: string
}

// 現代の身近な商品・サービス（価格帯別に整理）
const COMPARISON_ITEMS: ComparisonItem[] = [
  // 低価格帯（100-1000円）
  { name: '缶コーヒー', price: 130, emoji: '☕', unit: '本' },
  { name: '電車初乗り', price: 150, emoji: '🚃', unit: '回' },
  { name: 'ペットボトル飲料', price: 150, emoji: '🥤', unit: '本' },
  { name: 'ガソリン1L', price: 170, emoji: '⛽', unit: 'L' },
  { name: 'おにぎり', price: 200, emoji: '🍙', unit: '個' },
  { name: 'スタバのコーヒー', price: 400, emoji: '☕', unit: '杯' },
  { name: 'カラオケ1時間', price: 500, emoji: '🎤', unit: '時間' },
  { name: 'コンビニ弁当', price: 500, emoji: '🍱', unit: '個' },
  { name: 'タクシー初乗り', price: 500, emoji: '🚕', unit: '回' },
  { name: 'マクドナルドのセット', price: 700, emoji: '🍔', unit: '個' },
  { name: 'Spotify1ヶ月', price: 980, emoji: '🎵', unit: 'ヶ月' },

  // 中価格帯（1000-10000円）
  { name: 'ランチ', price: 1000, emoji: '🍱', unit: '回' },
  { name: 'Netflix1ヶ月', price: 1490, emoji: '📺', unit: 'ヶ月' },
  { name: '本', price: 1500, emoji: '📚', unit: '冊' },
  { name: '映画チケット', price: 1800, emoji: '🎬', unit: '回' },
  { name: 'ディナー', price: 3000, emoji: '🍽️', unit: '回' },
  { name: '理髪店', price: 4000, emoji: '💇', unit: '回' },
  { name: 'ゲームソフト', price: 7000, emoji: '🎮', unit: '本' },
  { name: '電気代（月）', price: 8000, emoji: '💡', unit: 'ヶ月' },

  // 高価格帯（10000-100000円）
  { name: '家族でのディズニー', price: 25000, emoji: '🏰', unit: '回' },
  { name: 'ブランドバッグ', price: 50000, emoji: '👜', unit: '個' },
  { name: '高級時計', price: 80000, emoji: '⌚', unit: '個' },

  // 超高価格帯（100000-1000000円）
  { name: 'iPhone最新モデル', price: 120000, emoji: '📱', unit: '台' },
  { name: '海外旅行', price: 200000, emoji: '✈️', unit: '回' },
  { name: '軽自動車', price: 1500000, emoji: '🚗', unit: '台' },

  // 超々高価格帯（1000000円以上）
  { name: '普通車', price: 3000000, emoji: '🚙', unit: '台' },
  { name: '結婚式', price: 3000000, emoji: '💒', unit: '回' },
  { name: '高級車', price: 8000000, emoji: '🏎️', unit: '台' },
  { name: 'マンション頭金', price: 10000000, emoji: '🏠', unit: '回' },
  { name: '一戸建て住宅', price: 40000000, emoji: '🏡', unit: '軒' },
  { name: '高級マンション', price: 100000000, emoji: '🏢', unit: '戸' },
]

// 年代別の特徴的なメッセージ
const ERA_MESSAGES: Record<string, string[]> = {
  '1940-1950': [
    '戦後復興期の価値',
    '終戦直後の貴重なお金',
    '物資不足時代の価値',
  ],
  '1950-1960': [
    '高度成長期前夜',
    '朝鮮戦争特需の時代',
    '復興への希望の時代',
  ],
  '1960-1970': [
    '東京オリンピックの年代',
    '高度経済成長真っ只中',
    '三種の神器の時代',
  ],
  '1970-1980': [
    'オイルショック前後',
    '万博ブームの時代',
    '列島改造論の時代',
  ],
  '1980-1990': [
    'バブル前夜の価値',
    'ディスコブームの時代',
    'ジャパン・アズ・ナンバーワン',
  ],
  '1990-2000': [
    'バブル真っ只中',
    '土地神話の時代',
    'ジュリアナ東京の時代',
  ],
  '2000-2010': [
    'ITバブルの時代',
    '失われた10年の始まり',
    'デフレ突入期',
  ],
  '2010-2020': [
    'リーマンショック後',
    'スマホ普及前夜',
    'アベノミクス期',
  ],
}

// 驚きの表現
const SURPRISE_EXPRESSIONS = [
  'えぇぇ...😱',
  'マジかよ...😳',
  'ウソでしょ？😲',
  'ヤバすぎる😰',
  '衝撃の事実💥',
  '想像以上...😵',
]

// 商品比較メッセージ生成
export const getComparisonMessage = (amount: number): string | null => {
  // 金額帯に応じて適切な商品を見つける
  let suitableItems = COMPARISON_ITEMS.filter(item => {
    const ratio = amount / item.price
    // 1-50倍の範囲で実感しやすい商品を選択
    return ratio >= 1 && ratio <= 50
  })
  
  // 該当する商品がない場合は、より広い範囲で検索
  if (suitableItems.length === 0) {
    suitableItems = COMPARISON_ITEMS.filter(item => {
      const ratio = amount / item.price
      return ratio >= 0.5 && ratio <= 100
    })
  }
  
  // それでもない場合は、最も近い価格の商品を選択
  if (suitableItems.length === 0) {
    suitableItems = [COMPARISON_ITEMS.reduce((closest, current) => {
      return Math.abs(amount - current.price) < Math.abs(amount - closest.price) 
        ? current : closest
    })]
  }
  
  // 最も適切な倍数になる商品を選択
  const bestMatch = suitableItems.reduce((best, current) => {
    const bestRatio = amount / best.price
    const currentRatio = amount / current.price
    
    // 2-20倍の範囲を最優先、次に1-50倍の範囲
    const bestScore = getBestScore(bestRatio)
    const currentScore = getBestScore(currentRatio)
    
    return currentScore > bestScore ? current : best
  })
  
  const count = Math.floor(amount / bestMatch.price)
  
  // 小数点が出る場合は「約」を付ける
  if (amount / bestMatch.price - count > 0.2) {
    return `${bestMatch.emoji} ${bestMatch.name}約${count + 1}${bestMatch.unit}分！`
  }
  
  return `${bestMatch.emoji} ${bestMatch.name}${count}${bestMatch.unit}分！`
}

// 比較の適切さを評価するスコア計算
const getBestScore = (ratio: number): number => {
  if (ratio >= 2 && ratio <= 20) return 10  // 最優先（2-20倍）
  if (ratio >= 1 && ratio <= 50) return 5   // 次優先（1-50倍）
  if (ratio >= 0.5 && ratio <= 100) return 2 // それ以外
  return 1 // 範囲外
}

// 年代別メッセージ取得
export const getEraMessage = (year: string): string => {
  const yearNum = parseInt(year)
  
  for (const [range, messages] of Object.entries(ERA_MESSAGES)) {
    const [start, end] = range.split('-').map(Number)
    if (yearNum >= start && yearNum < end) {
      return messages[Math.floor(Math.random() * messages.length)]
    }
  }
  
  if (yearNum < 1940) return '戦前の貴重な価値'
  return '現代に近い時代'
}

// 感情的なシェアメッセージ生成
export const generateViralShareMessage = (
  year: string,
  currency: string,
  amount: string,
  result: number,
  isUsingFallback: boolean
): string => {
  const currencyMap: Record<string, string> = {
    jpy: '円',
    usd: 'ドル',
    gbp: 'ポンド',
    eur: 'ユーロ',
  }
  
  const currencyLabel = currencyMap[currency] || currency.toUpperCase()
  const formattedAmount = formatCurrency(Number(amount))
  const formattedResult = formatCurrency(result)
  const comparison = getComparisonMessage(result)
  const era = getEraMessage(year)
  const surprise = SURPRISE_EXPRESSIONS[Math.floor(Math.random() * SURPRISE_EXPRESSIONS.length)]
  
  // 複数パターンからランダム選択
  const patterns = [
    // パターン1: 驚き + 比較
    `${surprise}\n${year}年の${formattedAmount}${currencyLabel}が\n今なら${formattedResult}円！\n${comparison ? `\n= ${comparison}` : ''}\n\n#今いくら #${era.replace(/[^\w]/g, '')}`,
    
    // パターン2: 時代感 + 感情
    `【${era}】\n${year}年の${formattedAmount}${currencyLabel}\n↓\n今の価値で${formattedResult}円\n${comparison ? `\n${comparison}` : ''}\n\n親世代の金銭感覚、今と全然違う😭\n#今いくら #昭和価値`,
    
    // パターン3: 対話誘発型
    `${year}年生まれの人〜！\nあなたが生まれた年の${formattedAmount}${currencyLabel}は\n今の${formattedResult}円だったって知ってた？\n${comparison ? `\n= ${comparison}` : ''}\n\n同い年の人はリプで教えて！🙋‍♀️\n#今いくら #同世代`,
  ]
  
  const message = patterns[Math.floor(Math.random() * patterns.length)]
  return message + (isUsingFallback ? '\n※参考値' : '')
}

// 結果表示用の追加メッセージ
export const getResultEnhancement = (
  year: string,
  result: number
): {
  comparison: string | null
  eraContext: string
  emotionalImpact: string
} => {
  return {
    comparison: getComparisonMessage(result),
    eraContext: getEraMessage(year),
    emotionalImpact: SURPRISE_EXPRESSIONS[Math.floor(Math.random() * SURPRISE_EXPRESSIONS.length)]
  }
}