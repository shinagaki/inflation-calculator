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
}

export const InflationResult = ({
  result,
  resultStatement,
  shareStatement,
  location,
  loading,
  error,
}: InflationResultProps) => {
  if (loading) {
    return (
      <div className='my-6 text-center'>
        <p>計算中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='my-6 text-center'>
        <p className='text-red-600'>エラー: {error}</p>
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
  );
};