import { Box, Button, Checkbox, Group, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { Link, Route, Switch, useLocation, useRoute } from 'wouter'

import './App.css'

import cpiUS from './data/cpi_us.json'
import currencyJPY from './data/currency.json'

const currencies = [
  { label: '米ドル', value: 'usd' },
  { label: '日本円', value: 'jpy' },
  { label: 'ユーロ', value: 'eur' },
  { label: '英ポンド', value: 'gbp' },
  { label: '豪ドル', value: 'aud' },
  { label: 'カナダドル', value: 'cad' },
  { label: '中国人民元', value: 'cny' },
  { label: 'ドイツマルク', value: 'dem' },
  { label: 'フランスフラン', value: 'frf' },
  { label: 'スイスフラン', value: 'chf' },
  { label: '香港ドル', value: 'hkd' },
  { label: '韓国ウォン', value: 'krw' },
  { label: 'シンガポールドル', value: 'sgd' },
  { label: 'トルコリラ', value: 'try' },
  { label: '南アランド', value: 'zar' },
  { label: 'ロシアルーブル', value: 'rub' },
  { label: 'NZドル', value: 'nzd' },
  { label: 'メキシコペソ', value: 'mxn' },
  { label: 'イタリアリラ', value: 'itl' },
  { label: 'インドルピー', value: 'inr' },
]

const TopPage = () => {
  const [match, params] = useRoute('/:year/:currency/:amount')
  const [_location, setLocation] = useLocation()

  const year = params?.year || '1950'
  const currency = params?.currency || 'usd'
  const amount = params?.amount || '100'
  let result = 0

  console.log(year, currency, amount)

  const calculate = (cpi: number, cpiNow: number, currencyRate: number) => {
    if (cpi && cpiNow && currencyRate) {
      return Math.round(Number(amount) * (cpiNow / cpi) * currencyRate)
    }
    return NaN
  }

  if (match) {
    const cpi = Number(cpiUS.filter(data => data.year === year)[0]?.cpi) || 0
    const cpiNow =
      Number(cpiUS.filter(data => data.year === '2024')[0]?.cpi) || 0
    const currencyRate =
      Number(currencyJPY.filter(data => data.currency === currency)[0]?.jpy) ||
      0
    result = calculate(cpi, cpiNow, currencyRate)
  }

  const handleChangeYear = (yearNew: string) => {
    setLocation(`/${yearNew}/${currency}/${amount}`)
  }
  const handleChangeCurrency = (currencyNew: string) => {
    console.log(currencyNew)
    setLocation(`/${year}/${currencyNew}/${amount}`)
  }
  const handleChangeAmount = (amountNew: string) => {
    setLocation(`/${year}/${currency}/${amountNew}`)
  }

  const form = useForm({
    initialValues: {
      email: '',
      termsOfService: false,
    },

    validate: {
      email: value => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  })

  return (
    <>
      <div className='bg-white shadow-md rounded-lg px-8 py-6 max-w-xl'>
        <div className='mb-10'>
          <form onSubmit={form.onSubmit(values => console.log(values))}>
            <TextInput
              withAsterisk
              label='Email'
              placeholder='your@email.com'
              {...form.getInputProps('email')}
            />

            <Checkbox
              mt='md'
              label='I agree to sell my privacy'
              {...form.getInputProps('termsOfService', { type: 'checkbox' })}
            />

            <Group justify='flex-end' mt='md'>
              <Button type='submit'>Submit</Button>
            </Group>
          </form>
          <form className=''>
            <input
              type='number'
              id='year'
              className='text-center shadow-sm rounded-md w-24 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-xl'
              placeholder='年'
              required
              defaultValue={year}
              min='1910'
              max='2024'
              step='1'
              onChange={e => {
                handleChangeYear(e.target.value)
              }}
            />
            年の
            <input
              type='number'
              id='amount'
              className='text-right shadow-sm rounded-l-md w-40 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='1000'
              required
              defaultValue={amount}
              min='0'
              onChange={e => {
                handleChangeAmount(e.target.value)
              }}
            />
            <select
              id='currency'
              className='shadow-sm rounded-r-md w-40 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              required
              defaultValue={currency}
              onChange={e => {
                handleChangeCurrency(e.target.value)
              }}
            >
              {currencies.map(currency => (
                <option value={currency.value}>
                  {currency.label}({currency.value.toUpperCase()})
                </option>
              ))}
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
