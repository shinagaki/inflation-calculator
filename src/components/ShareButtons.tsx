import {
  BlueskyIcon,
  BlueskyShareButton,
  EmailIcon,
  EmailShareButton,
  LineIcon,
  LineShareButton,
  TwitterShareButton,
  XIcon,
} from 'react-share'
import { URL_DOMAIN } from '../constants'
import { useShareTracking } from '../hooks/useAnalytics'

interface ShareButtonsProps {
  shareStatement: string
  location: string
  year?: string
  currency?: string
  amount?: string
  result?: number
}

const ShareButtons = ({
  shareStatement,
  location,
  year,
  currency,
  amount,
  result
}: ShareButtonsProps) => {
  const { trackShare } = useShareTracking()

  const handleShare = (platform: 'twitter' | 'bluesky' | 'line' | 'email') => {
    if (year && currency && amount && result) {
      trackShare({
        platform,
        year,
        currency,
        amount,
        result
      })
    }
  }

  const shareUrl = `https://${URL_DOMAIN}${location}`
  const buttonClass = 'transition-opacity hover:opacity-70 focus:opacity-70 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full'

  return (
    <div className='flex gap-2 sm:gap-1 justify-center' role='group' aria-label='共有ボタン'>
      <TwitterShareButton
        url={shareUrl}
        title={shareStatement}
        className={`${buttonClass} focus:ring-blue-400`}
        aria-label='計算結果をXでシェア'
        onClick={() => handleShare('twitter')}
      >
        <XIcon size={36} round className='sm:!w-8 sm:!h-8' aria-hidden='true' />
      </TwitterShareButton>
      <BlueskyShareButton
        url={shareUrl}
        title={shareStatement}
        className={`${buttonClass} focus:ring-blue-400`}
        aria-label='計算結果をBlueskyでシェア'
        onClick={() => handleShare('bluesky')}
      >
        <BlueskyIcon size={36} round className='sm:!w-8 sm:!h-8' aria-hidden='true' />
      </BlueskyShareButton>
      <LineShareButton
        url={shareUrl}
        title={shareStatement}
        className={`${buttonClass} focus:ring-green-400`}
        aria-label='計算結果をLINEでシェア'
        onClick={() => handleShare('line')}
      >
        <LineIcon size={36} round className='sm:!w-8 sm:!h-8' aria-hidden='true' />
      </LineShareButton>
      <EmailShareButton
        subject={'今いくら'}
        body={shareStatement}
        url={shareUrl}
        className={`${buttonClass} focus:ring-gray-400`}
        aria-label='計算結果をメールでシェア'
        onClick={() => handleShare('email')}
      >
        <EmailIcon size={36} round className='sm:!w-8 sm:!h-8' aria-hidden='true' />
      </EmailShareButton>
    </div>
  )
}

export default ShareButtons
