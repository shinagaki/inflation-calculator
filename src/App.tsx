import './App.css'
import cpiUS from './data/cpi_us.json'
import currencyJPY from './data/currency.json'

import { Link, Route, Switch, useLocation, useRoute } from 'wouter'

const TopPage = () => {
  const [match, params] = useRoute('/:year/:currency/:amount')
  const [location, setLocation] = useLocation()

  const year = params?.year || '1950'
  const currency = params?.currency || 'USD'
  const amount = params?.amount || '100'
  let result = 0

  console.log(year, currency, amount)

  if (match) {
    const cpi = Number(cpiUS.filter(data => data.year === year)[0]?.cpi) || 0
    const cpiNow =
      Number(cpiUS.filter(data => data.year === '2024')[0]?.cpi) || 0
    const jpy =
      Number(currencyJPY.filter(data => data.currency === currency)[0]?.jpy) ||
      0
    if (cpi && cpiNow && jpy) {
      result = Math.round(Number(amount) * (cpiNow / cpi) * jpy)
    } else {
      result = NaN
    }
  }

  const handleChange = ({
    yearNew,
    currencyNew,
    amountNew,
  }: { yearNew: string; currencyNew: string; amountNew: string }) => {
    setLocation(`/${yearNew}/${currencyNew}/${amountNew}`)
  }

  return (
    <>
      <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-xl'>
        <div className='mb-10'>
          <form className=''>
            <input
              type='number'
              id='year'
              className='text-center shadow-sm rounded-md w-24 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='1950'
              required
              defaultValue={year}
              min='1910'
              max='2024'
              step='1'
              onChange={e => {
                handleChange({
                  yearNew: e.target.value,
                  currencyNew: currency,
                  amountNew: amount,
                })
              }}
            />
            年の
            <input
              type='number'
              id='amount'
              className='text-right shadow-sm rounded-md w-40 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='1000'
              required
              defaultValue={amount}
              min='0'
              onChange={e => {
                handleChange({
                  yearNew: year,
                  currencyNew: currency,
                  amountNew: e.target.value,
                })
              }}
            />
            <select
              id='currency'
              className='text-center shadow-sm rounded-md w-40 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              required
              defaultValue={currency}
              onChange={e => {
                handleChange({
                  yearNew: year,
                  currencyNew: e.target.value,
                  amountNew: amount,
                })
              }}
            >
              <option value='usd'>米ドル(USD)</option>
              <option value='eur'>ユーロ(EUR)</option>
              <option value='gbp'>英ポンド(GBP)</option>
              <option value='aud'>豪ドル(AUD)</option>
              <option value='cad'>カナダドル(CAD)</option>
              <option value='cny'>中国人民元(CNY)</option>
              {/* <option value='chf'>スイスフラン(chf)</option>
              <option value='hkd'>香港ドル(HKD)</option>
              <option value='krw'>韓国ウォン(KRW)</option>
              <option value='sgd'>シンガポールドル(SGD)</option>
              <option value='try'>トルコリラ(TRY)</option>
              <option value='zar'>南アランド(ZAR)</option>
              <option value='rub'>ロシアルーブル(RUB)</option>
              <option value='nzd'>NZドル(NZD)</option>
              <option value='mxn'>メキシコペソ(MXN)</option> */}
              <option value='dem'>ドイツマルク(DEM)</option>
              <option value='frf'>フランスフラン(FRF)</option>
              {/* <option value='itl'>イタリアリラ(ITL)</option>
              <option value='inr'>インドルピー(INR)</option> */}
            </select>
            は、
          </form>
        </div>
        {Number.isNaN(result) ? (
          <div className='mb-4 text-center text-3xl'>計算できません</div>
        ) : (
          <div className='mb-4 text-center text-3xl'>
            {new Intl.NumberFormat('ja-JP', {
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
