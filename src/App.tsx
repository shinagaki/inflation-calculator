import { useState } from 'react'
import './App.css'
import cpiUS from './data/cpi_us.json'
import currencyJPY from './data/currency.json'

import { Link, Route, Switch, useLocation, useRoute } from 'wouter'

const TopPage = () => {
  const [match, params] = useRoute('/:year/:currency/:amount')
  const [location, setLocation] = useLocation()
  const [year, setYear] = useState(params?.year || '1950')
  const [currency, setCurrency] = useState(params?.currency || 'USD')
  const [amount, setAmount] = useState(params?.amount || '100')
  let result = 0

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
    // console.log(cpi, cpiNow, jpy)
  }

  const handleBlur = () => {
    console.log(params, `/${year}/${currency}/${amount}`)

    setLocation(`/${year}/${currency}/${amount}`, { replace: true })
  }

  return (
    <>
      <div className='bg-white dark:bg-gray-900 shadow-md rounded-lg px-8 py-6 max-w-xl'>
        <form className='#' onBlur={handleBlur}>
          <div className='mb-4'>
            <input
              type='text'
              id='year'
              className='shadow-sm rounded-md w-24 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='1950'
              required
              defaultValue={year}
              onChange={e => {
                setYear(e.target.value)
              }}
            />
            年の
            <input
              type='amount'
              id='amount'
              className='shadow-sm rounded-md w-24 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='1000'
              required
              defaultValue={amount}
              onChange={e => {
                setAmount(e.target.value)
              }}
            />
            <input
              type='currency'
              id='currency'
              className='shadow-sm rounded-md w-24 px-3 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
              placeholder='ドル'
              required
              defaultValue={currency}
              onChange={e => {
                setCurrency(e.target.value)
              }}
            />
            は、
          </div>
          <button
            type='submit'
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-4'
          >
            換算
          </button>
          <div className='mb-4 text-center text-2xl'>{result}円です</div>
        </form>
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
