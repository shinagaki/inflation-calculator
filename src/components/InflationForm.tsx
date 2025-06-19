import { ChangeEvent, useRef, memo } from 'react';
import { validateYear, validateCurrency, validateAmount } from '../utils/validators';
import { formatCurrency } from '../utils/calculations';
import { currencies, YEAR_LIST } from '../constants';

interface InflationFormProps {
  year: string;
  currency: string;
  amount: string;
  onYearChange: (year: string) => void;
  onCurrencyChange: (currency: string) => void;
  onAmountChange: (amount: string) => void;
}

const InflationFormComponent = ({
  year,
  currency,
  amount,
  onYearChange,
  onCurrencyChange,
  onAmountChange,
}: InflationFormProps) => {
  const amountRef = useRef<HTMLInputElement>(null);

  const handleChangeYear = (yearNew: string) => {
    if (validateYear(yearNew)) {
      onYearChange(yearNew);
    }
  };

  const handleChangeCurrency = (currencyNew: string) => {
    if (validateCurrency(currencyNew)) {
      onCurrencyChange(currencyNew);
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
      onAmountChange(inputNumber);
    }
  };

  if (amountRef.current) {
    amountRef.current.value = formatCurrency(Number(parseFloat(amount).toFixed(2)));
  }

  return (
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
  );
};

// React.memoでラップして不要な再レンダリングを防止
export const InflationForm = memo(InflationFormComponent);