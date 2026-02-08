import { memo } from 'react'
import { toJapaneseEra } from '../utils/calculations'

interface SEOContentProps {
  year: string
  currency: string
  amount: string
  result?: number
}

const SEOContentComponent = ({
  year,
  currency,
  amount,
  result
}: SEOContentProps) => {
  const currencyNames = {
    usd: 'アメリカドル',
    gbp: 'イギリスポンド',
    eur: 'ユーロ',
    jpy: '日本円'
  }

  const currencyName = currencyNames[currency as keyof typeof currencyNames] || currency.toUpperCase()
  const currentYear = new Date().getFullYear()
  const eraName = toJapaneseEra(parseInt(year))
  const yearLabel = eraName ? `${year}年（${eraName}）` : `${year}年`
  
  return (
    <div className='mt-8 space-y-6 text-sm text-gray-700 bg-white/80 backdrop-blur-sm rounded-lg p-6'>
      <section>
        <h2 className='text-xl font-bold mb-4 text-gray-900'>
          {yearLabel}の{currencyName}の価値を現在の日本円で計算
        </h2>

        <div className='space-y-3'>
          <p>
            {yearLabel}の{amount}{currency.toUpperCase()}は、現在の日本円でどのくらいの価値があるのでしょうか？
            当サイトのインフレ計算機では、消費者物価指数（CPI）データを使用して、
            過去のお金の価値を正確に現在の価値に換算します。
          </p>

          {result != null && (
            <p className='bg-blue-50 p-3 rounded border-l-4 border-blue-400'>
              <strong>計算結果：</strong>{yearLabel}の{amount}{currency.toUpperCase()}は
              現在約<span className='text-blue-600 font-bold text-lg'>{result.toLocaleString()}円</span>の価値に相当します。
            </p>
          )}

          <p>
            この結果は{currentYear - parseInt(year)}年間のインフレ率（物価上昇率）を考慮した正確な計算です。
            投資判断や歴史的価値の比較、経済分析の参考資料としてご活用ください。
          </p>
        </div>
      </section>

      <section>
        <h3 className='text-lg font-semibold mb-3 text-gray-900'>
          インフレ計算の仕組みと特徴
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-gray-50 p-4 rounded'>
            <h4 className='font-semibold text-gray-800 mb-2'>📊 正確なデータベース</h4>
            <ul className='text-xs space-y-1'>
              <li>• 各国政府発表の公式CPI統計</li>
              <li>• 1900年〜現在まで100年以上のデータ</li>
              <li>• 毎年のデータ更新で最新情報を反映</li>
            </ul>
          </div>
          <div className='bg-gray-50 p-4 rounded'>
            <h4 className='font-semibold text-gray-800 mb-2'>💱 多通貨対応</h4>
            <ul className='text-xs space-y-1'>
              <li>• 米ドル（USD）のインフレ計算</li>
              <li>• 英ポンド（GBP）の価値変遷</li>
              <li>• ユーロ（EUR）導入後の物価変動</li>
              <li>• 日本円（JPY）の長期価値推移</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h3 className='text-lg font-semibold mb-3 text-gray-900'>
          よく検索される年代と計算例
        </h3>
        <div className='space-y-4'>
          <div>
            <h4 className='font-medium text-gray-800 mb-2'>人気の計算年代</h4>
            <div className='flex flex-wrap gap-2'>
              {[
                { year: 1950, event: '戦後復興期' },
                { year: 1964, event: '東京オリンピック' },
                { year: 1973, event: 'オイルショック' },
                { year: 1980, event: '高度成長期' },
                { year: 1990, event: 'バブル期' },
                { year: 2000, event: 'IT革命' },
                { year: 2008, event: 'リーマンショック' },
                { year: 2020, event: 'コロナ時代' }
              ].map(item => (
                <div key={item.year} className='bg-blue-100 px-3 py-1 rounded-full'>
                  <span className='text-xs font-medium text-blue-800'>
                    {item.year}年/{toJapaneseEra(item.year)}（{item.event}）
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className='font-medium text-gray-800 mb-2'>計算事例</h4>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs'>
              <div className='bg-green-50 p-3 rounded border border-green-200'>
                <strong>投資・資産運用</strong>
                <p>「昭和55年（1980年）に100万円投資していたら現在価値でいくら？」</p>
              </div>
              <div className='bg-purple-50 p-3 rounded border border-purple-200'>
                <strong>歴史・教育</strong>
                <p>「昭和25年（戦後）の初任給1万円は現在のいくらに相当？」</p>
              </div>
              <div className='bg-orange-50 p-3 rounded border border-orange-200'>
                <strong>経済分析</strong>
                <p>「平成2年（バブル期）の土地価格を現在価値で比較」</p>
              </div>
              <div className='bg-cyan-50 p-3 rounded border border-cyan-200'>
                <strong>国際比較</strong>
                <p>「平成2年（1990年）の1ドルの購買力は現在いくら？」</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className='text-lg font-semibold mb-3 text-gray-900'>
          インフレ計算でわかること
        </h3>
        <div className='space-y-3'>
          <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4'>
            <h4 className='font-semibold text-gray-800 mb-2'>💰 実質的な価値変化</h4>
            <p className='text-sm'>
              名目上の金額だけでなく、実際の購買力がどう変化したかを把握できます。
              給与や物価の変遷を正確に理解するのに役立ちます。
            </p>
          </div>
          
          <div className='bg-blue-50 border-l-4 border-blue-400 p-4'>
            <h4 className='font-semibold text-gray-800 mb-2'>📈 長期投資の評価</h4>
            <p className='text-sm'>
              株式や不動産などの長期投資の実質リターンを評価する際に、
              インフレ調整後の価値で正しく判断できます。
            </p>
          </div>
          
          <div className='bg-green-50 border-l-4 border-green-400 p-4'>
            <h4 className='font-semibold text-gray-800 mb-2'>🌍 国際経済の理解</h4>
            <p className='text-sm'>
              各国の物価変動やインフレ率の違いを比較することで、
              国際経済の動向や為替変動の背景を理解できます。
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export const SEOContent = memo(SEOContentComponent)