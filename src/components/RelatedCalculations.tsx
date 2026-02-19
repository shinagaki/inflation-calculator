import { memo } from 'react'
import { useLocation } from 'wouter'

interface RelatedCalculationsProps {
  currentYear: string
  currentCurrency: string
  currentAmount: string
}

const currencyMinYear: Record<string, number> = {
  usd: 1800,
  jpy: 1947,
  gbp: 1800,
  eur: 1996,
}

const RelatedCalculationsComponent = ({
  currentYear,
  currentCurrency,
  currentAmount
}: RelatedCalculationsProps) => {
  const [, setLocation] = useLocation()

  const handleLinkClick = (year: string, currency: string, amount: string) => {
    setLocation(`/${year}/${currency}/${amount}/`)
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  const generateRelatedCalculations = () => {
    const baseYear = parseInt(currentYear)
    const baseAmount = parseFloat(currentAmount)

    const suggestions: Array<{
      year: string
      currency: string
      amount: string
      description: string
    }> = []

    const minYear = currencyMinYear[currentCurrency] || 1900
    const yearVariations = [
      baseYear - 10,
      baseYear - 20,
      baseYear + 10,
      baseYear - 5
    ].filter(year => year >= minYear && year <= new Date().getFullYear() - 1)

    yearVariations.slice(0, 2).forEach(year => {
      suggestions.push({
        year: year.toString(),
        currency: currentCurrency,
        amount: currentAmount,
        description: `${year}年の${currentAmount}${currentCurrency.toUpperCase()}の価値`
      })
    })

    const currencies = ['usd', 'gbp', 'eur', 'jpy'].filter(
      c => c !== currentCurrency && baseYear >= (currencyMinYear[c] || 1900)
    )
    currencies.slice(0, 2).forEach(currency => {
      suggestions.push({
        year: currentYear,
        currency,
        amount: currentAmount,
        description: `${currentYear}年の${currentAmount}${currency.toUpperCase()}の価値`
      })
    })

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

    return suggestions.slice(0, 6)
  }

  const relatedCalculations = generateRelatedCalculations()

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
      <section className='bg-white/90 backdrop-blur-sm rounded-xl border border-primary-200/50 p-6'>
        <h2 className='text-lg font-heading font-bold mb-4 text-primary-900'>
          関連する計算例
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {relatedCalculations.map((calc, index) => (
            <button
              key={index}
              onClick={() => handleLinkClick(calc.year, calc.currency, calc.amount)}
              className='p-3 bg-primary-50/60 hover:bg-primary-100 border border-primary-200/50 rounded-lg text-left transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400/30'
              aria-label={`${calc.description}を計算`}
            >
              <div className='font-medium text-primary-900 text-sm'>
                {calc.description}
              </div>
              <div className='text-xs text-primary-600 mt-1'>
                クリックして計算 →
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className='bg-white/90 backdrop-blur-sm rounded-xl border border-primary-200/50 p-6'>
        <h2 className='text-lg font-heading font-bold mb-4 text-primary-900'>
          人気の計算例
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {popularCalculations.map((calc, index) => (
            <button
              key={index}
              onClick={() => handleLinkClick(calc.year, calc.currency, calc.amount)}
              className='border border-primary-200 rounded-lg p-4 text-left hover:border-primary-400 hover:bg-primary-50/50 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400/30 group'
              aria-label={`${calc.description} - ${calc.year}年の${calc.amount}${calc.currency.toUpperCase()}の現在価値を計算`}
            >
              <div className='flex justify-between items-start mb-2'>
                <h3 className='font-semibold text-primary-900 text-sm'>
                  {calc.description}
                </h3>
                <span className='text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded'>
                  {calc.category}
                </span>
              </div>
              <div className='text-xs text-primary-600'>
                {calc.year}年 ・ {calc.amount}{calc.currency.toUpperCase()}
              </div>
              <div className='text-xs text-primary-500 mt-2 group-hover:text-primary-700 transition-colors duration-200'>
                → 計算してみる
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className='bg-white/90 backdrop-blur-sm rounded-xl border border-primary-200/50 p-6'>
        <h2 className='text-lg font-heading font-bold mb-4 text-primary-900'>
          効果的な使い方のヒント
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h3 className='font-semibold text-primary-800 mb-3 flex items-center gap-2'>
              <span aria-hidden='true'>&#128161;</span>
              <span>投資・資産運用での活用</span>
            </h3>
            <ul className='space-y-2 text-sm text-primary-700'>
              <li className='flex items-start'>
                <span className='text-primary-500 mr-2'>・</span>
                長期投資の実質リターンを評価
              </li>
              <li className='flex items-start'>
                <span className='text-primary-500 mr-2'>・</span>
                不動産価格の歴史的変遷を確認
              </li>
              <li className='flex items-start'>
                <span className='text-primary-500 mr-2'>・</span>
                退職金や年金の実質価値を計算
              </li>
            </ul>
          </div>

          <div>
            <h3 className='font-semibold text-primary-800 mb-3 flex items-center gap-2'>
              <span aria-hidden='true'>&#128218;</span>
              <span>学習・研究での活用</span>
            </h3>
            <ul className='space-y-2 text-sm text-primary-700'>
              <li className='flex items-start'>
                <span className='text-primary-500 mr-2'>・</span>
                歴史的事件と経済の関係を理解
              </li>
              <li className='flex items-start'>
                <span className='text-primary-500 mr-2'>・</span>
                各国のインフレ率を比較分析
              </li>
              <li className='flex items-start'>
                <span className='text-primary-500 mr-2'>・</span>
                経済政策の効果を数値で確認
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

export const RelatedCalculations = memo(RelatedCalculationsComponent)
