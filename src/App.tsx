import { Link, Route, Switch, useLocation, useRoute } from 'wouter'

import './App.css'

import cpiAll from './data/cpi_all.json'
import currencyAPI from './data/currency_api.json'
import { ChangeEvent } from 'react'

const currencies = [
  { label: '円', value: 'jpy', emoji: '🇯🇵' },
  { label: 'ドル', value: 'usd', emoji: '🇺🇸' },
  { label: 'ユーロ', value: 'eur', emoji: '🇪🇺' },
  { label: 'ポンド', value: 'gbp', emoji: '🇬🇧' },
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
const amountDefault = 100
const yearMin = 1900
const yearNow = new Date().getFullYear()
const yearDefault = 1950

const TopPage = () => {
  const [match, params] = useRoute('/:year/:currency/:amount')
  const [_location, setLocation] = useLocation()

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
    const currenciesAvailable = ['usd', 'jpy', 'eur', 'gbp', 'cny']
    return currenciesAvailable.includes(currency)
  }
  const validateAmount = (amount: string) => {
    const amountNumber = Number(amount)
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

  let year = yearDefault.toString()
  let currency = 'usd'
  let amount = amountDefault.toString()
  let result = undefined

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

    type currencyType = Record<string, number>
    const currencyLine: currencyType = currencyAPI.data
    const currencyRate = currencyLine[currency.toUpperCase()] || 0
    result = calculate(cpi, cpiNow, currencyRate)
  }

  const handleChangeYear = (e: ChangeEvent<HTMLInputElement>) => {
    if (validateYear(e.target.value)) {
      setLocation(`/${e.target.value}/${currency}/${amount}`)
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

  return (
    <>
      <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-xl'>
        <div className='mb-10'>
          <form className='flex flex-col sm:flex-row gap-2'>
            <div className=''>
              <label
                htmlFor='year'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                西暦
              </label>
              <div className='relative my-2 rounded-md shadow-sm'>
                <input
                  type='number'
                  name='year'
                  id='year'
                  autoComplete='username'
                  className='block w-full rounded-md border-0  py-1.5 pl-2 pr-10 text-center text-xl text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  placeholder='年'
                  required
                  defaultValue={year}
                  min={yearMin}
                  max={yearNow}
                  step='1'
                  onChange={e => {
                    handleChangeYear(e)
                  }}
                />
                <label htmlFor='year'>
                  <div className='absolute inset-y-0 right-2 flex items-center select-none'>
                    <div className='h-full w-10 leading-10 text-center text-gray-500 sm:text-sm sm:leading-9'>
                      年
                    </div>
                  </div>
                </label>
              </div>
            </div>
            <div className=''>
              <label
                htmlFor='amount'
                className='block text-sm font-medium leading-6 text-gray-900'
              >
                金額
              </label>
              <div className='relative my-2 rounded-md shadow-sm'>
                <input
                  type='number'
                  name='amount'
                  id='amount'
                  className='block w-full rounded-md border-0 py-1.5 pl-2 pr-44 text-center text-xl text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                  placeholder='100'
                  required
                  defaultValue={amount}
                  min='0'
                  max={amountMax}
                  onChange={e => {
                    handleChangeAmount(e)
                  }}
                />
                <div className='absolute inset-y-0 right-0 flex items-center'>
                  <label htmlFor='currency' className='sr-only'>
                    通貨
                  </label>
                  <select
                    id='currency'
                    name='currency'
                    className='h-full w-40 rounded-r-md border-gray-600 border-l border-opacity-20 border-dashed bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm'
                    required
                    defaultValue={currency}
                    onChange={e => {
                      handleChangeCurrency(e.target.value)
                    }}
                  >
                    {currencies.map(currency => (
                      <option key={currency.value} value={currency.value}>
                        {/* {currency.emoji} */}
                        {currency.label}
                        {/* ({currency.value.toUpperCase()}) */}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
        <hr className='h-px my-8 bg-gray-200 border-0' />
        {typeof result === 'undefined' ? (
          <div className='my-6 text-center'>
            <h3 className='text-xl'>使い方</h3>
            <p>西暦と金額と通貨を入れる</p>
          </div>
        ) : (
          <div className='my-6 text-center text-3xl'>
            {Number.isNaN(result)
              ? '計算できません'
              : new Intl.NumberFormat('ja-JP', {
                  style: 'currency',
                  currency: 'JPY',
                }).format(result)}
          </div>
        )}
      </div>
    </>
  )
}

const App = () => (
  <div className='h-dvh flex flex-col w-full bg-slate-100 text-gray-900'>
    <header>
      <div className='rounded-br-xl flex p-4 w-1/2 justify-between bg-slate-300'>
        <h1 className='text-lg font-bold'>今いくら？</h1>
        <nav className='flex flex-row space-x-10'>
          <Link href='/'>TOP</Link>
          <Link href='/1950/usd/100' className='link'>
            Calculate
          </Link>
        </nav>
      </div>
    </header>
    <main className='flex-grow flex items-center justify-center dark:bg-gray-950'>
      <Switch>
        <Route path='/' component={TopPage} />
        <Route path='/:year/:currency/:price' component={TopPage} />
        <Route>
          <h2>Not Found</h2>
        </Route>
      </Switch>
    </main>
    <footer>
      <div className='bg-slate-300 w-1/2 rounded-tl-xl p-4 ml-auto text-right'>
        Copyright 2024
      </div>
    </footer>
  </div>
)

export default App
