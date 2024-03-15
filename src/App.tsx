import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Link, Route, Switch, useLocation, useRoute } from 'wouter'
import {
  EmailIcon,
  EmailShareButton,
  LineIcon,
  LineShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share'
import cpiAll from './data/cpi_all.json'
import './App.css'

const currencies = [
  { label: '円', value: 'jpy', emoji: '🇯🇵' },
  { label: 'ドル', value: 'usd', emoji: '🇺🇸' },
  { label: 'ポンド', value: 'gbp', emoji: '🇬🇧' },
  { label: 'ユーロ', value: 'eur', emoji: '🇪🇺' },
  // { label: '人民元', value: 'cny', emoji: '🇨🇳' },
  // { label: '豪ドル', value: 'aud', emoji: '🇦🇺' },
  // { label: 'カナダドル', value: 'cad', emoji: '🇨🇦' },
  // { label: 'ドイツマルク', value: 'dem', emoji: '🇩🇪' },
  // { label: 'フランスフラン', value: 'frf', emoji: '🇫🇷' },
  // { label: 'スイスフラン', value: 'chf', emoji: '🇨🇭' },
  // { label: '香港ドル', value: 'hkd', emoji: '🇭🇰' },
  // { label: '韓国ウォン', value: 'krw', emoji: '🇰🇷' },
  // { label: 'シンガポールドル', value: 'sgd', emoji: '🇸🇬' },
  // { label: 'トルコリラ', value: 'try', emoji: '🇹🇷' },
  // { label: '南アランド', value: 'zar', emoji: '🇿🇦' },
  // { label: 'ロシアルーブル', value: 'rub', emoji: '🇷🇺' },
  // { label: 'NZドル', value: 'nzd', emoji: '🇳🇿' },
  // { label: 'メキシコペソ', value: 'mxn', emoji: '🇲🇽' },
  // { label: 'イタリアリラ', value: 'itl', emoji: '🇮🇹' },
  // { label: 'インドルピー', value: 'inr', emoji: '🇮🇳' },
]
const amountMax = 10000000000000000
const amountDefault = 0
const yearMin = 1900
const yearNow = new Date().getFullYear()
const yearList = Array.from(
  Array(yearNow - yearMin + 1).keys(),
  x => x + yearMin,
)
const yearDefault = 1950
const urlDomain = 'imaikura.creco.net'

const fetchExchangeRatesAPI = async () => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/exchange_rates',
  )
  const res = await response.json()
  return res.rates
}

const TopPage = () => {
  const [match, params] = useRoute('/:year/:currency/:amount')
  const [location, setLocation] = useLocation()
  const [currencyRates, setCurrencyRates] = useState<ExchangeRatesAPI | null>(
    null,
  )

  let year = yearDefault.toString()
  let currency = 'usd'
  let amount = amountDefault.toString()
  let result = undefined
  let resultStatement = ''
  let shareStatement = ''
  const amountRef = useRef<HTMLInputElement>(null)

  interface ExchangeRatesAPI {
    [key: string]: ExchangeRate
  }
  interface ExchangeRate {
    value: number
  }

  useEffect(() => {
    fetchExchangeRatesAPI().then(res => setCurrencyRates(res))
  }, [])

  const validateYear = (year: string) => {
    const yearNumber = Math.trunc(Number(year))
    return (
      !Number.isNaN(yearNumber) &&
      year === yearNumber.toString() &&
      yearNumber >= yearMin &&
      yearNumber <= yearNow
    )
  }
  const validateCurrency = (currency: string) => {
    const currenciesAvailable = ['usd', 'jpy', 'gbp', 'eur']
    return currenciesAvailable.includes(currency)
  }
  const validateAmount = (amount: string) => {
    // 小数点2桁まで
    const amountNumber = Number(parseFloat(amount).toFixed(2))
    return (
      !Number.isNaN(amountNumber) &&
      amount === amountNumber.toString() &&
      amountNumber >= 0 &&
      amountNumber <= amountMax
    )
  }
  const calculate = (cpi: number, cpiNow: number, currencyRate: number) => {
    if (cpi && cpiNow && currencyRate) {
      return Math.round(Number(amount) * (cpiNow / cpi) * currencyRate)
    }
    return NaN
  }
  const handleChangeYear = (yearNew: string) => {
    if (validateYear(yearNew)) {
      setLocation(`/${yearNew}/${currency}/${amount}`)
    }
  }
  const handleChangeCurrency = (currencyNew: string) => {
    if (validateCurrency(currencyNew)) {
      setLocation(`/${year}/${currencyNew}/${amount}`)
    }
  }
  const handleChangeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    if (validateAmount(e.target.value)) {
      setLocation(`/${year}/${currency}/${e.target.value}`)
    }
  }

  if (!currencyRates) {
    // Loading中
    return (
      <div className='flex justify-center' aria-label='読み込み中'>
        <div className='animate-spin h-12 w-12 border-4 border-zinc-200/70 rounded-full border-t-transparent' />
      </div>
    )
  }

  if (match) {
    if (
      !validateYear(params.year) ||
      !validateCurrency(params.currency) ||
      !validateAmount(params.amount)
    ) {
      setLocation('/')
    }
    year = params.year
    currency = params.currency
    amount = params.amount

    type cpiType = Record<string, string>
    const cpiLine: cpiType = cpiAll.filter(data => data.year === year)[0]
    const cpi = Number(cpiLine[currency]) || 0
    const cpiNowLine: cpiType = cpiAll.filter(
      data => data.year === yearNow.toString(),
    )[0]
    const cpiNow = Number(cpiNowLine[currency]) || 0
    const exchangeRate = currencyRates.jpy.value / currencyRates[currency].value

    result = calculate(cpi, cpiNow, exchangeRate)
    resultStatement = `${new Intl.NumberFormat('ja-JP').format(result)}円`
    shareStatement = `${year}年の${new Intl.NumberFormat('ja-JP').format(
      Number(amount),
    )}${
      currencies.filter(data => data.value === currency)[0].label
    }は${resultStatement}`
  }
  if (amountRef.current) {
    amountRef.current.value = new Intl.NumberFormat('ja-JP').format(
      Number(parseFloat(amount).toFixed(2)),
    )
  }

  return (
    <>
      <div className='bg-white/50 hover:bg-white/60 backdrop-blur-lg border border-white/25 shadow-lg rounded-lg px-8 py-6 max-w-xl'>
        <div className='mb-5 sm:mb-10'>
          <form
            className='flex flex-col sm:flex-row gap-2'
            onSubmit={e => {
              e.preventDefault()
            }}
          >
            <div className=''>
              <label
                htmlFor='year'
                className='block text-sm font-medium leading-2 sm:leading-6 text-zinc-900'
              >
                西暦
              </label>
              <div className='relative my-2 rounded-md shadow-sm'>
                <select
                  id='year'
                  name='year'
                  className='w-full rounded-md border-0 py-1.5 pl-4 pr-6 text-center text-xl text-zinc-900 ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  required
                  onChange={e => {
                    handleChangeYear(e.currentTarget.value)
                  }}
                  value={year}
                >
                  {yearList.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <div className='block absolute inset-y-2 right-7 items-center pointer-events-none text-zinc-500 text-sm sm:inset-y-1.5 sm:text-xs sm:leading-6'>
                  年
                </div>
              </div>
            </div>
            <div className=''>
              <label
                htmlFor='amount'
                className='block text-sm font-medium  leading-2 sm:leading-6 text-zinc-900'
              >
                金額
              </label>
              <div className='relative my-2 rounded-md shadow-sm'>
                <input
                  type='text'
                  name='amount'
                  id='amount'
                  autoComplete='off'
                  className='w-full rounded-md border-0 py-1.5 pl-2 pr-44 text-center text-xl text-zinc-900 ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  required
                  maxLength={
                    new Intl.NumberFormat('ja-JP').format(amountMax).toString()
                      .length
                  }
                  onChange={e => {
                    let inputNumber = e.currentTarget.value
                    // カンマの削除
                    inputNumber = inputNumber.replace(/,/g, '')

                    const digit =
                      inputNumber.indexOf('.') >= 0
                        ? inputNumber.indexOf('.')
                        : inputNumber.length
                    const decimalDigit =
                      inputNumber.indexOf('.') >= 0
                        ? inputNumber.length - digit - 1
                        : 0
                    if (
                      inputNumber.indexOf('.') >= 0 &&
                      inputNumber.length > 1 &&
                      decimalDigit === 0
                    ) {
                      // 任意の数字に続いて小数点を入力した場合はサニタイズしない
                      return
                    }
                    if (
                      !Number.isNaN(parseFloat(inputNumber)) &&
                      parseFloat(inputNumber) >= 0 &&
                      parseFloat(inputNumber) <= amountMax
                    ) {
                      inputNumber = parseFloat(inputNumber)
                        .toFixed(decimalDigit)
                        .toString()
                    } else {
                      inputNumber = '0'
                    }
                    e.currentTarget.value = inputNumber
                    handleChangeAmount(e)
                  }}
                  defaultValue={amount}
                  inputMode='numeric'
                  pattern='^([1-9][\d,]*|0)(\.\d+)?$'
                  ref={amountRef}
                />
                <div className='absolute inset-y-0 right-0 flex items-center'>
                  <label htmlFor='currency' className='sr-only'>
                    通貨
                  </label>
                  <select
                    id='currency'
                    name='currency'
                    className='h-full w-40 rounded-r-md border-zinc-600 border-l border-opacity-20 border-dashed bg-transparent py-0 pl-2 pr-7 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm'
                    required
                    onChange={e => {
                      handleChangeCurrency(e.target.value)
                    }}
                    value={currency}
                  >
                    {currencies.map(currency => (
                      <option key={currency.value} value={currency.value}>
                        {currency.emoji}&nbsp;
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
        <hr className='h-px bg-zinc-200 border-0 sm:my-8' />
        {typeof result === 'undefined' ? (
          <div className='my-6 text-center'>
            <p>西暦を選択し、金額に数値を入れて、通貨を選択します</p>
          </div>
        ) : (
          <div className='flex justify-center items-center gap-4'>
            <div className='my-6 text-center text-2xl sm:text-3xl'>
              {Number.isNaN(result) ? '計算できません' : resultStatement}
            </div>
            {!Number.isNaN(result) && (
              <div className='flex gap-1'>
                <TwitterShareButton
                  url={`https://${urlDomain}${location}`}
                  title={shareStatement}
                  hashtags={['今いくら']}
                >
                  <TwitterIcon size='32' round />
                </TwitterShareButton>
                <LineShareButton
                  url={`https://${urlDomain}${location}`}
                  title={shareStatement}
                >
                  <LineIcon size='32' round />
                </LineShareButton>
                <EmailShareButton
                  subject={'今いくら'}
                  body={shareStatement}
                  url={`https://${urlDomain}${location}`}
                >
                  <EmailIcon size='32' round />
                </EmailShareButton>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

const App = () => (
  <div className='min-h-dvh w-full flex flex-col text-zinc-900 bg-[url("/img/background.webp")] bg-cover'>
    <header className='flex items-center justify-center bg-gradient-to-b from-white/95 via-white/70 via-80% to-white/0 pb-5 sm:pb-10'>
      <div className='flex flex-col items-center justify-center py-0 text-center sm:py-10'>
        <h1 className='my-2 sm:my-4 font-bold text-4xl sm:text-6xl tracking-tight bg-gradient-to-b from-zinc-300 via-zinc-500 via-20% to-zinc-700 bg-clip-text text-transparent sm:first-letter:text-7xl   first-letter:text-5xl first-letter:pr-2'>
          <Link href='/' className='link'>
            今いくら
          </Link>
        </h1>
        <p className='text-sm sm:text-base text-zinc-700 mx-2 my-2 leading-2 sm:leading-6'>
          あの時代のドルってどれくらいの価値なんだろう？
          <br />
          西暦と金額を入れるだけで、現在の日本円に換算します
        </p>
        <div className='flex flex-col items-center justify-center text-xs sm:text-sm'>
          <h3 className='text-zinc-900 font-bold pr-5'>計算例</h3>
          <ul className='flex space-x-2 underline whitespace-nowrap mb-2'>
            <li>
              <Link href='/1950/usd/100' className='link hover:text-zinc-500'>
                1950年の
                <wbr />
                100ドル
              </Link>
            </li>
            <li>
              <Link href='/1980/jpy/10000' className='link hover:text-zinc-500'>
                1980年の
                <wbr />
                1万円
              </Link>
            </li>
            <li>
              <Link href='/2010/eur/50000' className='link hover:text-zinc-500'>
                2010年の
                <wbr />
                5万ユーロ
              </Link>
            </li>
          </ul>
          <h3 className='text-zinc-900 font-bold pr-5'>制限事項</h3>
          <p>日本円は1947年、ユーロは1996年から計算ができます</p>
          <p>為替レートは最新のデータを使用しています</p>
        </div>
      </div>
    </header>
    <main className='flex-grow flex items-center justify-center'>
      <Switch>
        <Route path='/' component={TopPage} />
        <Route path='/:year/:currency/:price' component={TopPage} />
        <Route>
          <h2>Not Found</h2>
        </Route>
      </Switch>
    </main>
    <footer className='w-full flex items-center justify-between p-2 sm:p-4 text-xs sm:text-sm text-right text-zinc-200 bg-gradient-to-t from-black/95 via-black/30 via-80% to-black/0'>
      <div className='flex text-[0.75em] truncate'>
        <p>ソース：</p>
        <ul className='flex space-x-2 whitespace-nowrap'>
          <li>
            <Link
              href='https://www.stat.go.jp/data/cpi/'
              className='link underline hover:text-zinc-400'
            >
              🇯🇵 総務省
            </Link>
          </li>
          <li>
            <Link
              href='https://www.bls.gov/cpi/'
              className='link underline hover:text-zinc-400'
            >
              🇺🇸 DOL
            </Link>
          </li>
          <li>
            <Link
              href='https://www.ons.gov.uk/economy/inflationandpriceindices/'
              className='link underline hover:text-zinc-400'
            >
              🇬🇧 ONS
            </Link>
          </li>
          <li>
            <Link
              href='https://ec.europa.eu/eurostat'
              className='link underline hover:text-zinc-400'
            >
              🇪🇺 eurostat
            </Link>
          </li>
          <li>
            <Link
              href='https://www.coingecko.com/'
              className='link underline hover:text-zinc-400'
            >
              CoinGecko
            </Link>
          </li>
        </ul>
      </div>
      <div className='text-right'>
        ©{yearNow}{' '}
        <Link
          href='https://creco.net/'
          className='link underline hover:text-zinc-400'
        >
          creco
        </Link>
      </div>
    </footer>
  </div>
)

export default App
