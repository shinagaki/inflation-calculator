import {
  EmailIcon,
  EmailShareButton,
  LineIcon,
  LineShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share'
import { URL_DOMAIN } from '../constants'

interface ShareButtonsProps {
  shareStatement: string
  location: string
}

const ShareButtons = ({ shareStatement, location }: ShareButtonsProps) => {
  return (
    <div className='flex gap-2 sm:gap-1 justify-center' role='group' aria-label='共有ボタン'>
      <TwitterShareButton
        url={`https://${URL_DOMAIN}${location}`}
        title={shareStatement}
        className='transition-opacity hover:opacity-70 focus:opacity-70 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-full'
        aria-label='計算結果をTwitterでシェア'
      >
        <TwitterIcon size={36} round className='sm:!w-8 sm:!h-8' aria-hidden='true' />
      </TwitterShareButton>
      <LineShareButton
        url={`https://${URL_DOMAIN}${location}`}
        title={shareStatement}
        className='transition-opacity hover:opacity-70 focus:opacity-70 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 rounded-full'
        aria-label='計算結果をLINEでシェア'
      >
        <LineIcon size={36} round className='sm:!w-8 sm:!h-8' aria-hidden='true' />
      </LineShareButton>
      <EmailShareButton
        subject={'今いくら'}
        body={shareStatement}
        url={`https://${URL_DOMAIN}${location}`}
        className='transition-opacity hover:opacity-70 focus:opacity-70 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded-full'
        aria-label='計算結果をメールでシェア'
      >
        <EmailIcon size={36} round className='sm:!w-8 sm:!h-8' aria-hidden='true' />
      </EmailShareButton>
    </div>
  )
}

export default ShareButtons