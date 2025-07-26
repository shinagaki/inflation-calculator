import { memo } from 'react'
import { useLocation } from 'wouter'

interface RelatedCalculationsProps {
  currentYear: string
  currentCurrency: string
  currentAmount: string
}

const RelatedCalculationsComponent = ({
  currentYear,
  currentCurrency,
  currentAmount
}: RelatedCalculationsProps) => {
  const [, setLocation] = useLocation()

  const handleLinkClick = (year: string, currency: string, amount: string) => {
    setLocation(`/${year}/${currency}/${amount}`)
    // スクロールアップして結果を見やすくする
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  // 関連する計算例を生成
  const generateRelatedCalculations = () => {
    const baseYear = parseInt(currentYear)
    const baseAmount = parseFloat(currentAmount)
    
    const suggestions: Array<{
      year: string
      currency: string
      amount: string
      description: string
    }> = []
    
    // 同じ通貨で異なる年代
    const yearVariations = [
      baseYear - 10,
      baseYear - 20,
      baseYear + 10,
      baseYear - 5
    ].filter(year => year >= 1900 && year <= new Date().getFullYear())
    
    yearVariations.slice(0, 2).forEach(year => {
      suggestions.push({
        year: year.toString(),
        currency: currentCurrency,
        amount: currentAmount,
        description: `${year}年の${currentAmount}${currentCurrency.toUpperCase()}の価値`
      })
    })
    
    // 同じ年代で異なる通貨
    const currencies = ['usd', 'gbp', 'eur', 'jpy'].filter(c => c !== currentCurrency)
    currencies.slice(0, 2).forEach(currency => {
      suggestions.push({
        year: currentYear,
        currency,
        amount: currentAmount,
        description: `${currentYear}年の${currentAmount}${currency.toUpperCase()}の価値`
      })
    })
    
    // 同じ条件で異なる金額
    const amountVariations = [
      baseAmount * 10,
      baseAmount / 10,
      Math.round(baseAmount * 5),
      Math.round(baseAmount * 0.5)
    ].filter(amount => amount > 0 && amount <= 1000000)
    
    amountVariations.slice(0, 2).forEach(amount => {
      suggestions.push({
        year: currentYear,
        currency: currentCurrency,
        amount: amount.toString(),
        description: `${currentYear}年の${amount}${currentCurrency.toUpperCase()}の価値`
      })
    })
    
    return suggestions.slice(0, 6) // 最大6個まで
  }

  const relatedCalculations = generateRelatedCalculations()

  // 人気の計算例（固定）
  const popularCalculations = [
    {
      year: '1980',
      currency: 'usd',
      amount: '100',
      description: '1980年の100ドルは現在いくら？',
      category: '投資・資産'
    },
    {
      year: '1990',
      currency: 'jpy',
      amount: '1000000',
      description: 'バブル期の100万円の価値',
      category: '歴史・経済'
    },
    {
      year: '1970',
      currency: 'gbp',
      amount: '50',
      description: '1970年の50ポンドの購買力',
      category: '国際比較'
    },
    {
      year: '2000',
      currency: 'eur',
      amount: '500',
      description: 'IT革命期の500ユーロの価値',
      category: 'テクノロジー'
    },
    {
      year: '1964',
      currency: 'jpy',
      amount: '100',
      description: '東京オリンピック時代の100円',
      category: 'スポーツ・文化'
    },
    {
      year: '1950',
      currency: 'usd',
      amount: '20',
      description: '戦後復興期の20ドルの価値',
      category: '戦後復興'
    }
  ]

  return (
    <div className='mt-8 space-y-6'>
      {/* 関連する計算 */}
      <div className='bg-white/80 backdrop-blur-sm rounded-lg p-6'>
        <h2 className='text-xl font-bold mb-4 text-gray-900'>
          関連する計算例
        </h2>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {relatedCalculations.map((calc, index) => (
            <button
              key={index}
              onClick={() => handleLinkClick(calc.year, calc.currency, calc.amount)}
              className='p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-colors'
            >
              <div className='font-medium text-blue-900 text-sm'>
                {calc.description}
              </div>
              <div className='text-xs text-blue-600 mt-1'>
                クリックして計算 →
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 人気の計算例 */}
      <div className='bg-white/80 backdrop-blur-sm rounded-lg p-6'>
        <h2 className='text-xl font-bold mb-4 text-gray-900'>
          人気の計算例
        </h2>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {popularCalculations.map((calc, index) => (
            <div
              key={index}
              className='border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer'
              onClick={() => handleLinkClick(calc.year, calc.currency, calc.amount)}
            >
              <div className='flex justify-between items-start mb-2'>
                <h3 className='font-semibold text-gray-900 text-sm'>
                  {calc.description}
                </h3>
                <span className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'>
                  {calc.category}
                </span>
              </div>
              <div className='text-xs text-gray-600'>
                {calc.year}年 • {calc.amount}{calc.currency.toUpperCase()}
              </div>
              <div className='text-xs text-blue-600 mt-2'>
                → 計算してみる
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 計算のヒント */}
      <div className='bg-white/80 backdrop-blur-sm rounded-lg p-6'>
        <h2 className='text-xl font-bold mb-4 text-gray-900'>
          効果的な使い方のヒント
        </h2>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h3 className='font-semibold text-gray-800 mb-3'>💡 投資・資産運用での活用</h3>
            <ul className='space-y-2 text-sm text-gray-700'>
              <li className='flex items-start'>
                <span className='text-blue-600 mr-2'>•</span>
                長期投資の実質リターンを評価
              </li>
              <li className='flex items-start'>
                <span className='text-blue-600 mr-2'>•</span>
                不動産価格の歴史的変遷を確認
              </li>
              <li className='flex items-start'>
                <span className='text-blue-600 mr-2'>•</span>
                退職金や年金の実質価値を計算
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className='font-semibold text-gray-800 mb-3'>📚 学習・研究での活用</h3>
            <ul className='space-y-2 text-sm text-gray-700'>
              <li className='flex items-start'>
                <span className='text-green-600 mr-2'>•</span>
                歴史的事件と経済の関係を理解
              </li>
              <li className='flex items-start'>
                <span className='text-green-600 mr-2'>•</span>
                各国のインフレ率を比較分析
              </li>
              <li className='flex items-start'>
                <span className='text-green-600 mr-2'>•</span>
                経済政策の効果を数値で確認
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export const RelatedCalculations = memo(RelatedCalculationsComponent)