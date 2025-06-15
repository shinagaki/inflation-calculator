import {
  EmailIcon,
  EmailShareButton,
  LineIcon,
  LineShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share';
import { URL_DOMAIN } from '../constants';

interface InflationResultProps {
  result?: number;
  resultStatement: string;
  shareStatement: string;
  location: string;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  isUsingFallback?: boolean;
}

export const InflationResult = ({
  result,
  resultStatement,
  shareStatement,
  location,
  loading,
  error,
  onRetry,
  isUsingFallback = false,
}: InflationResultProps) => {
  if (loading) {
    return (
      <div className='my-6 text-center'>
        <p>計算中...</p>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className='my-6 text-center'>
        <div className='mb-4'>
          <p className='text-red-600 mb-2'>⚠️ {error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
            >
              再試行
            </button>
          )}
        </div>
      </div>
    );
  }

  if (typeof result === 'undefined') {
    return (
      <div className='my-6 text-center'>
        <p>西暦を選択し、金額に数値を入れて、通貨を選択します</p>
      </div>
    );
  }

  return (
    <div className='my-6'>
      {/* 警告メッセージ */}
      {(error || isUsingFallback) && (
        <div className='mb-4 text-center'>
          <div className='inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-md'>
            <span className='text-yellow-800 text-sm'>
              ⚠️ {error || '為替レートは参考値です'}
            </span>
            {onRetry && (
              <button
                onClick={onRetry}
                className='ml-3 px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors'
              >
                再試行
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* 結果表示 */}
      <div className='flex justify-center items-center gap-4'>
        <div className='text-center text-2xl sm:text-3xl'>
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
    </div>
  );
};