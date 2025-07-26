import { memo, useState } from 'react'

interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = ({ question, answer, isOpen, onToggle }: FAQItemProps) => (
  <div className='border border-gray-200 rounded-lg overflow-hidden'>
    <button
      className='w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex justify-between items-center'
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <span className='font-medium text-gray-900'>{question}</span>
      <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
    {isOpen && (
      <div className='px-4 py-3 bg-white'>
        <p className='text-sm text-gray-700 leading-relaxed'>{answer}</p>
      </div>
    )}
  </div>
)

const FAQSectionComponent = () => {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const faqs = [
    {
      question: "このインフレ計算機はどのように動作しますか？",
      answer: "各国政府が発表する消費者物価指数（CPI）データを使用して、過去の金額を現在の価値に換算します。1900年から現在まで100年以上のデータに基づく正確な計算を行います。"
    },
    {
      question: "どの通貨に対応していますか？",
      answer: "現在、米ドル（USD）、英ポンド（GBP）、ユーロ（EUR）、日本円（JPY）の4つの主要通貨に対応しています。すべて日本円での価値に換算して表示します。"
    },
    {
      question: "計算結果の精度はどの程度ですか？",
      answer: "各国の公式統計データを使用しているため、非常に高い精度で計算されます。ただし、CPIは平均的な物価変動を示すため、特定の商品やサービスの価格変動とは異なる場合があります。"
    },
    {
      question: "なぜ1900年からのデータなのですか？",
      answer: "多くの国で信頼できるCPIデータが整備され始めたのが1900年頃からです。それ以前のデータは不完全または存在しない場合が多いため、正確な計算を行うため1900年以降を対象としています。"
    },
    {
      question: "投資の実質リターン計算に使えますか？",
      answer: "はい、長期投資の実質的な価値評価に活用できます。名目リターンからインフレ率を差し引いた実質リターンを把握するのに役立ちます。ただし、投資判断は複数の要因を考慮して行ってください。"
    },
    {
      question: "他の国の通貨も対応予定はありますか？",
      answer: "現在は主要4通貨に対応していますが、ユーザーのニーズに応じて他の通貨への対応も検討しています。リクエストがあれば検討いたします。"
    },
    {
      question: "データの更新頻度はどのくらいですか？",
      answer: "CPIデータは各国政府の発表に合わせて定期的に更新しています。通常は月次または四半期ごとに最新データを反映しています。"
    },
    {
      question: "計算結果をシェアできますか？",
      answer: "はい、計算結果はTwitterやFacebookなどのSNSで簡単にシェアできます。結果ページのURLも共有可能で、同じ条件での計算を他の人と共有できます。"
    },
    {
      question: "商用利用は可能ですか？",
      answer: "個人の学習や参考目的での利用は自由ですが、商用利用や大量アクセスを行う場合は事前にご相談ください。データの正確性について保証はいたしかねます。"
    },
    {
      question: "スマートフォンでも使えますか？",
      answer: "はい、レスポンシブデザインを採用しており、スマートフォンやタブレットでも快適にご利用いただけます。すべての機能がモバイル端末で利用可能です。"
    }
  ]

  return (
    <div className='mt-8 bg-white/80 backdrop-blur-sm rounded-lg p-6'>
      <h2 className='text-xl font-bold mb-6 text-gray-900'>
        よくある質問（FAQ）
      </h2>
      
      <div className='space-y-3'>
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openItems.includes(index)}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>
      
      <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
        <p className='text-sm text-blue-800'>
          <strong>その他のご質問は：</strong>
          計算に関する詳しいご質問や機能のリクエストがございましたら、
          お気軽にお問い合わせください。より良いサービス提供に努めます。
        </p>
      </div>
    </div>
  )
}

export const FAQSection = memo(FAQSectionComponent)