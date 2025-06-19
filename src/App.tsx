import { Link, Route, Switch } from 'wouter'
import { TopPage } from './components/TopPage'
import { YEAR_NOW } from './constants'
import { useState, useEffect } from 'react'

const App = () => {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setBackgroundLoaded(true)
    img.src = '/img/background.webp'
  }, [])

  return (
    <div 
      className={`min-h-dvh w-full flex flex-col text-zinc-900 bg-cover transition-opacity duration-300 ${
        backgroundLoaded 
          ? 'bg-[url("/img/background.webp")] opacity-100' 
          : 'bg-gradient-to-br from-slate-100 to-slate-200 opacity-90'
      }`}
    >
    <header className='flex items-center justify-center bg-gradient-to-b from-white/95 via-white/70 via-80% to-white/0 pb-5 sm:pb-10'>
      <div className='flex flex-col items-center justify-center py-0 text-center sm:py-10'>
        <h1 className='my-2 sm:my-4 font-bold text-4xl sm:text-6xl tracking-tight bg-gradient-to-b from-zinc-300 via-zinc-500 via-20% to-zinc-700 bg-clip-text text-transparent sm:first-letter:text-7xl first-letter:text-5xl first-letter:pr-2'>
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
                1950年の<wbr />100ドル
              </Link>
            </li>
            <li>
              <Link href='/1980/jpy/10000' className='link hover:text-zinc-500'>
                1980年の<wbr />1万円
              </Link>
            </li>
            <li>
              <Link href='/2010/eur/50000' className='link hover:text-zinc-500'>
                2010年の<wbr />5万ユーロ
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
        <Route path='/:year/:currency/:amount' component={TopPage} />
        <Route>
          <h2>Not Found</h2>
        </Route>
      </Switch>
    </main>
    <footer className='w-full flex items-center justify-between gap-2 p-2 sm:p-4 text-xs sm:text-sm text-zinc-200 bg-gradient-to-t from-black/95 via-black/30 via-80% to-black/0 whitespace-nowrap'>
      <div className='flex text-[0.75em] overflow-x-auto'>
        <p>ソース：</p>
        <ul className='flex space-x-1'>
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
              💹 CoinGecko
            </Link>
          </li>
        </ul>
      </div>
      <div className='text-right'>
        ©{YEAR_NOW}{' '}
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
}

export default App
