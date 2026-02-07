import { useState, useCallback } from 'react'
import {
  BlueskyIcon,
  BlueskyShareButton,
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

const CopyIcon = ({ copied }: { copied: boolean }) => (
  <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth={2}
    strokeLinecap='round'
    strokeLinejoin='round'
    className='w-4 h-4 sm:w-3.5 sm:h-3.5'
    aria-hidden='true'
  >
    {copied ? (
      <polyline points='20 6 9 17 4 12' />
    ) : (
      <>
        <rect x='9' y='9' width='13' height='13' rx='2' ry='2' />
        <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
      </>
    )}
  </svg>
)

const ShareButtons = ({
  shareStatement,
  location,
  year,
  currency,
  amount,
  result
}: ShareButtonsProps) => {
  const { trackShare } = useShareTracking()
  const [copied, setCopied] = useState(false)

  const handleShare = (platform: 'twitter' | 'bluesky' | 'line' | 'copy') => {
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

  const handleCopy = useCallback(async () => {
    const text = `${shareStatement}\n${shareUrl}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    handleShare('copy')
    setTimeout(() => setCopied(false), 2000)
  }, [shareStatement, shareUrl])

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
      <button
        type='button'
        onClick={handleCopy}
        className={`${buttonClass} focus:ring-gray-400`}
        aria-label={copied ? 'コピーしました' : '計算結果をコピー'}
      >
        <span
          className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white transition-colors ${
            copied ? 'bg-green-500' : 'bg-gray-500'
          }`}
        >
          <CopyIcon copied={copied} />
        </span>
      </button>
    </div>
  )
}

export default ShareButtons
