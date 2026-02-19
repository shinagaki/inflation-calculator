import { useEffect, useState } from 'react'
import { Link, Route, Switch } from 'wouter'
import { TopPage } from './components/TopPage'
import { YEAR_NOW } from './constants'
import { useAnalytics } from './hooks/useAnalytics'

const App = () => {
  const [backgroundLoaded, setBackgroundLoaded] = useState(false)

  // Analytics initialization
  useAnalytics()

  useEffect(() => {
    const loadBackgroundImage = () => {
      const img = new Image()
      img.onload = () => setBackgroundLoaded(true)
      img.onerror = () => {
        setBackgroundLoaded(true)
      }
      img.src = '/img/background.webp'
    }

    if (document.readyState === 'complete') {
      setTimeout(loadBackgroundImage, 100)
    } else {
      window.addEventListener('load', () => {
        setTimeout(loadBackgroundImage, 100)
      })
    }
  }, [])

  return (
    <div
      className={`min-h-dvh w-full flex flex-col text-primary-900 font-body bg-cover transition-opacity duration-300 ${
        backgroundLoaded
          ? 'bg-[url("/img/background.webp")] bg-fixed opacity-100'
          : 'bg-primary-50 opacity-90'
      }`}
    >
      <a href='#main-content' className='skip-link'>
        メインコンテンツへスキップ
      </a>

      <header className='bg-gradient-to-b from-primary-50/95 via-primary-50/80 to-transparent pb-2 sm:pb-4'>
        <div className='flex flex-col items-center justify-center py-3 sm:py-6 text-center max-w-2xl mx-auto px-4'>
          <h1 className='my-1 sm:my-3 font-heading font-black text-4xl sm:text-6xl tracking-tight text-primary-900'>
            <Link
              href='/'
              className='hover:text-primary-700 transition-colors duration-200'
            >
              今いくら
            </Link>
          </h1>
          <p className='text-sm sm:text-base text-primary-800 mx-2 my-1 leading-relaxed'>
            あの時代のドルってどれくらいの価値なんだろう？
            <br />
            西暦と金額を入れるだけで、現在の日本円に換算します
          </p>
          <nav aria-label='計算例' className='mt-2 bg-white/40 backdrop-blur-sm rounded-lg px-3 py-1'>
            <span className='text-primary-800 font-bold text-xs sm:text-sm'>計算例:</span>{' '}
            <Link href='/1950/usd/100/' className='underline text-primary-700 hover:text-primary-500 transition-colors duration-200 text-xs sm:text-sm'>1950年の100ドル</Link>{' '}
            <Link href='/1980/jpy/10000/' className='underline text-primary-700 hover:text-primary-500 transition-colors duration-200 text-xs sm:text-sm'>1980年の1万円</Link>{' '}
            <Link href='/2010/eur/50000/' className='underline text-primary-700 hover:text-primary-500 transition-colors duration-200 text-xs sm:text-sm'>2010年の5万ユーロ</Link>
          </nav>
          <p className='text-xs sm:text-sm text-primary-800 mt-1.5 bg-white/40 backdrop-blur-sm rounded-lg px-3 py-1'>
            <strong>制限事項:</strong>{' '}
            日本円は1947年、ユーロは1996年から計算可能。為替レートは最新データを使用。
          </p>
        </div>
      </header>

      <main
        id='main-content'
        className='flex-grow flex flex-col items-center justify-center px-4'
      >
        <Switch>
          <Route path='/' component={TopPage} />
          <Route path='/:year/:currency/:amount/' component={TopPage} />
          <Route path='/:year/:currency/:amount' component={TopPage} />
          <Route>
            <div className='text-center py-20'>
              <h2 className='text-2xl font-heading font-bold text-primary-900 mb-4'>
                ページが見つかりません
              </h2>
              <Link
                href='/'
                className='text-primary-600 underline hover:text-primary-800 transition-colors duration-200'
              >
                トップページへ戻る
              </Link>
            </div>
          </Route>
        </Switch>
      </main>

      <footer className='w-full py-2 px-4 sm:px-6 bg-primary-950/95 text-primary-100'>
        <div className='max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs'>
          <span className='text-primary-400'>データ:</span>
          <a href='https://www.stat.go.jp/data/cpi/' className='underline hover:text-primary-300 transition-colors duration-200' target='_blank' rel='noopener noreferrer'>🇯🇵 総務省</a>
          <a href='https://www.bls.gov/cpi/' className='underline hover:text-primary-300 transition-colors duration-200' target='_blank' rel='noopener noreferrer'>🇺🇸 DOL</a>
          <a href='https://www.ons.gov.uk/economy/inflationandpriceindices/' className='underline hover:text-primary-300 transition-colors duration-200' target='_blank' rel='noopener noreferrer'>🇬🇧 ONS</a>
          <a href='https://ec.europa.eu/eurostat' className='underline hover:text-primary-300 transition-colors duration-200' target='_blank' rel='noopener noreferrer'>🇪🇺 eurostat</a>
          <a href='https://www.coingecko.com/' className='underline hover:text-primary-300 transition-colors duration-200' target='_blank' rel='noopener noreferrer'>💹 CoinGecko</a>
          <span className='text-primary-500'>|</span>
          <span className='text-primary-400'>CPI {YEAR_NOW}年更新</span>
          <span className='text-primary-500'>|</span>
          <span className='text-primary-400'>&copy;{YEAR_NOW}{' '}
            <a href='https://creco.net/' className='underline hover:text-primary-300 transition-colors duration-200' target='_blank' rel='noopener noreferrer'>creco</a>
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App
