import { useLocation, useRoute } from 'wouter';
import { LoadingSpinner } from './LoadingSpinner';
import { InflationForm } from './InflationForm';
import { InflationResult } from './InflationResult';
import { useInflationCalculation } from '../hooks/useInflationCalculation';
import { validateYear, validateCurrency, validateAmount } from '../utils/validators';
import { YEAR_DEFAULT, AMOUNT_DEFAULT } from '../constants';

export const TopPage = () => {
  const [match, params] = useRoute('/:year/:currency/:amount');
  const [location, setLocation] = useLocation();

  let year = YEAR_DEFAULT.toString();
  let currency = 'usd';
  let amount = AMOUNT_DEFAULT.toString();

  if (match) {
    if (
      !validateYear(params.year) ||
      !validateCurrency(params.currency) ||
      !validateAmount(params.amount)
    ) {
      setLocation('/');
      return <LoadingSpinner />;
    }
    year = params.year;
    currency = params.currency;
    amount = params.amount;
  }

  const { result, resultStatement, shareStatement, loading, error } = useInflationCalculation({
    year,
    currency,
    amount,
  });

  const handleChangeYear = (yearNew: string) => {
    setLocation(`/${yearNew}/${currency}/${amount}`);
  };

  const handleChangeCurrency = (currencyNew: string) => {
    setLocation(`/${year}/${currencyNew}/${amount}`);
  };

  const handleChangeAmount = (amountNew: string) => {
    setLocation(`/${year}/${currency}/${amountNew}`);
  };

  return (
    <div className='bg-white/50 hover:bg-white/60 backdrop-blur-lg border border-white/25 shadow-lg rounded-lg px-8 py-6 max-w-xl'>
      <div className='mb-5 sm:mb-10'>
        <InflationForm
          year={year}
          currency={currency}
          amount={amount}
          onYearChange={handleChangeYear}
          onCurrencyChange={handleChangeCurrency}
          onAmountChange={handleChangeAmount}
        />
      </div>

      <hr className='h-px bg-zinc-200 border-0 sm:my-8' />
      <InflationResult
        result={result}
        resultStatement={resultStatement}
        shareStatement={shareStatement}
        location={location}
        loading={loading}
        error={error}
      />
    </div>
  );
}; 