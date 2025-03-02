import { ChangeEvent, useRef } from 'react';
import { useLocation, useRoute } from 'wouter';
import {
  EmailIcon,
  EmailShareButton,
  LineIcon,
  LineShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share';
import { LoadingSpinner } from './LoadingSpinner';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { validateYear, validateCurrency, validateAmount } from '../utils/validators';
import { calculateInflationAdjustedAmount, formatCurrency } from '../utils/calculations';
import { currencies, YEAR_LIST, YEAR_DEFAULT, YEAR_NOW, AMOUNT_DEFAULT, URL_DOMAIN } from '../constants';
import { CpiType } from '../types';
import cpiAll from '../data/cpi_all.json';

export const TopPage = () => {
  const [match, params] = useRoute('/:year/:currency/:amount');
  const [location, setLocation] = useLocation();
  const { rates: currencyRates, loading } = useExchangeRates();
  const amountRef = useRef<HTMLInputElement>(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currencyRates) {
    return <div>エラーが発生しました。再度お試しください。</div>;
  }

  let year = YEAR_DEFAULT.toString();
  let currency = 'usd';
  let amount = AMOUNT_DEFAULT.toString();
  let result: number | undefined;
  let resultStatement = '';
  let shareStatement = '';

  if (match) {
    if (
      !validateYear(params.year) ||
      !validateCurrency(params.currency) ||
      !validateAmount(params.amount)
    ) {
      setLocation('/');
    }
    year = params.year;
    currency = params.currency;
    amount = params.amount;

    const cpiLine = (cpiAll as CpiType[]).find(data => data.year === year);
    const cpi = cpiLine ? Number(cpiLine[currency]) || 0 : 0;
    let cpiNowLine = (cpiAll as CpiType[]).find(data => data.year === YEAR_NOW.toString());
    if (!cpiNowLine) {
      cpiNowLine = (cpiAll as CpiType[]).find(data => data.year === (YEAR_NOW - 1).toString());
    }
    const cpiNow = cpiNowLine ? Number(cpiNowLine[currency]) || 0 : 0;
    const exchangeRate = currencyRates.jpy.value / currencyRates[currency].value;

    result = calculateInflationAdjustedAmount(Number(amount), cpi, cpiNow, exchangeRate);
    resultStatement = `${formatCurrency(result)}円`;
    shareStatement = `${year}年の${formatCurrency(Number(amount))}${
      currencies.find(data => data.value === currency)?.label
    }は${resultStatement}`;
  }

  const handleChangeYear = (yearNew: string) => {
    if (validateYear(yearNew)) {
      setLocation(`/${yearNew}/${currency}/${amount}`);
    }
  };

  const handleChangeCurrency = (currencyNew: string) => {
    if (validateCurrency(currencyNew)) {
      setLocation(`/${year}/${currencyNew}/${amount}`);
    }
  };

  const handleChangeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    let inputNumber = e.currentTarget.value.replace(/,/g, '');
    const digit = inputNumber.indexOf('.') >= 0 ? inputNumber.indexOf('.') : inputNumber.length;
    const decimalDigit = inputNumber.indexOf('.') >= 0 ? inputNumber.length - digit - 1 : 0;

    if (inputNumber.indexOf('.') >= 0 && inputNumber.length > 1 && decimalDigit === 0) {
      return;
    }

    if (validateAmount(inputNumber)) {
      setLocation(`/${year}/${currency}/${inputNumber}`);
    }
  };

  if (amountRef.current) {
    amountRef.current.value = formatCurrency(Number(parseFloat(amount).toFixed(2)));
  }

  return (
    <div className='bg-white/50 hover:bg-white/60 backdrop-blur-lg border border-white/25 shadow-lg rounded-lg px-8 py-6 max-w-xl'>
      <div className='mb-5 sm:mb-10'>
        <form
          className='flex flex-col sm:flex-row gap-2'
          onSubmit={e => {
            e.preventDefault();
          }}
        >
          <div>
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
                className='w-full rounded-md border-0 py-1.5 pl-4 pr-6 text-center text-center-last text-xl text-zinc-900 ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                required
                onChange={e => handleChangeYear(e.currentTarget.value)}
                value={year}
              >
                {YEAR_LIST.map(year => (
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

          <div>
            <label
              htmlFor='amount'
              className='block text-sm font-medium leading-2 sm:leading-6 text-zinc-900'
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
                onChange={handleChangeAmount}
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
                  onChange={e => handleChangeCurrency(e.target.value)}
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
            <span className='text-zinc-900 drop-shadow-[0_0_3px_rgba(255,255,255,0.7)]'>
              {Number.isNaN(result) ? '計算できません' : resultStatement}
            </span>
          </div>
          {!Number.isNaN(result) && (
            <div className='flex gap-1'>
              <TwitterShareButton
                url={`https://${URL_DOMAIN}${location}`}
                title={shareStatement}
                hashtags={['今いくら']}
                className="transition-opacity hover:opacity-70"
              >
                <TwitterIcon size={32} round />
              </TwitterShareButton>
              <LineShareButton
                url={`https://${URL_DOMAIN}${location}`}
                title={shareStatement}
                className="transition-opacity hover:opacity-70"
              >
                <LineIcon size={32} round />
              </LineShareButton>
              <EmailShareButton
                subject={'今いくら'}
                body={shareStatement}
                url={`https://${URL_DOMAIN}${location}`}
                className="transition-opacity hover:opacity-70"
              >
                <EmailIcon size={32} round />
              </EmailShareButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 