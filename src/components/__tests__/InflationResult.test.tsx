import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InflationResult } from '../InflationResult'

// react-shareのモック
vi.mock('react-share', () => ({
  TwitterShareButton: ({ children, ...props }: any) => (
    <button data-testid="twitter-share" data-url={props.url} data-title={props.title}>
      {children}
    </button>
  ),
  LineShareButton: ({ children, ...props }: any) => (
    <button data-testid="line-share" data-url={props.url} data-title={props.title}>
      {children}
    </button>
  ),
  EmailShareButton: ({ children, ...props }: any) => (
    <button data-testid="email-share" data-subject={props.subject} data-body={props.body}>
      {children}
    </button>
  ),
  TwitterIcon: () => <div data-testid="twitter-icon">Twitter</div>,
  LineIcon: () => <div data-testid="line-icon">Line</div>,
  EmailIcon: () => <div data-testid="email-icon">Email</div>,
}))

const defaultProps = {
  result: 15000,
  resultStatement: '1980年の100ドルは、現在の価値で約15,000円です',
  shareStatement: '1980年の100ドルは現在の価値で約15,000円です #今いくら',
  location: '/1980/usd/100',
  loading: false,
  error: null,
}

describe('InflationResult', () => {
  describe('ローディング状態', () => {
    it('loading=trueの時にローディングメッセージが表示される', () => {
      render(<InflationResult {...defaultProps} loading={true} />)
      
      expect(screen.getByText('計算中...')).toBeInTheDocument()
      expect(screen.queryByText(defaultProps.resultStatement)).not.toBeInTheDocument()
    })
  })

  describe('エラー状態', () => {
    it('errorがあるが結果もある時は警告として表示される', () => {
      const errorMessage = 'APIエラーが発生しました'
      render(<InflationResult {...defaultProps} error={errorMessage} />)
      
      expect(screen.getByText(`⚠️ ${errorMessage}`)).toBeInTheDocument()
      expect(screen.getByText(defaultProps.resultStatement)).toBeInTheDocument()
    })

    it('errorがあり結果がない時はエラーメッセージのみ表示される', () => {
      const errorMessage = 'APIエラーが発生しました'
      render(<InflationResult {...defaultProps} error={errorMessage} result={undefined} />)
      
      expect(screen.getByText(`⚠️ ${errorMessage}`)).toBeInTheDocument()
      expect(screen.queryByText(defaultProps.resultStatement)).not.toBeInTheDocument()
    })

    it('エラーメッセージが黄色背景で表示される', () => {
      render(<InflationResult {...defaultProps} error="テストエラー" />)
      
      const errorElement = screen.getByText('⚠️ テストエラー')
      expect(errorElement).toHaveClass('text-yellow-800')
    })
  })

  describe('未計算状態', () => {
    it('result=undefinedの時に初期メッセージが表示される', () => {
      render(<InflationResult {...defaultProps} result={undefined} />)
      
      expect(screen.getByText('西暦を選択し、金額に数値を入れて、通貨を選択します')).toBeInTheDocument()
      expect(screen.queryByTestId('twitter-share')).not.toBeInTheDocument()
    })
  })

  describe('正常な結果表示', () => {
    it('結果が正しく表示される', () => {
      render(<InflationResult {...defaultProps} />)
      
      expect(screen.getByText(defaultProps.resultStatement)).toBeInTheDocument()
    })

    it('SNS共有ボタンが表示される', () => {
      render(<InflationResult {...defaultProps} />)
      
      expect(screen.getByTestId('twitter-share')).toBeInTheDocument()
      expect(screen.getByTestId('line-share')).toBeInTheDocument()
      expect(screen.getByTestId('email-share')).toBeInTheDocument()
    })

    it('SNS共有ボタンに正しいpropsが渡される', () => {
      render(<InflationResult {...defaultProps} />)
      
      const twitterButton = screen.getByTestId('twitter-share')
      const lineButton = screen.getByTestId('line-share')
      const emailButton = screen.getByTestId('email-share')
      
      expect(twitterButton).toHaveAttribute('data-url', 'https://imaikura.creco.net/1980/usd/100')
      expect(twitterButton).toHaveAttribute('data-title', defaultProps.shareStatement)
      
      expect(lineButton).toHaveAttribute('data-url', 'https://imaikura.creco.net/1980/usd/100')
      expect(lineButton).toHaveAttribute('data-title', defaultProps.shareStatement)
      
      expect(emailButton).toHaveAttribute('data-subject', '今いくら')
      expect(emailButton).toHaveAttribute('data-body', defaultProps.shareStatement)
    })

    it('各SNSアイコンが表示される', () => {
      render(<InflationResult {...defaultProps} />)
      
      expect(screen.getByTestId('twitter-icon')).toBeInTheDocument()
      expect(screen.getByTestId('line-icon')).toBeInTheDocument()
      expect(screen.getByTestId('email-icon')).toBeInTheDocument()
    })
  })

  describe('NaN結果の処理', () => {
    it('result=NaNの時に"計算できません"が表示される', () => {
      render(<InflationResult {...defaultProps} result={NaN} />)
      
      expect(screen.getByText('計算できません')).toBeInTheDocument()
      expect(screen.queryByText(defaultProps.resultStatement)).not.toBeInTheDocument()
    })

    it('result=NaNの時にSNS共有ボタンが表示されない', () => {
      render(<InflationResult {...defaultProps} result={NaN} />)
      
      expect(screen.queryByTestId('twitter-share')).not.toBeInTheDocument()
      expect(screen.queryByTestId('line-share')).not.toBeInTheDocument()
      expect(screen.queryByTestId('email-share')).not.toBeInTheDocument()
    })
  })

  describe('表示の優先順位', () => {
    it('loading=trueかつerrorがある場合、ローディングが優先される', () => {
      render(<InflationResult {...defaultProps} loading={true} error="エラーメッセージ" />)
      
      expect(screen.getByText('計算中...')).toBeInTheDocument()
      expect(screen.queryByText('⚠️ エラーメッセージ')).not.toBeInTheDocument()
    })

    it('loading=falseかつerrorがある場合、警告が表示される', () => {
      render(<InflationResult {...defaultProps} loading={false} error="エラーメッセージ" />)
      
      expect(screen.getByText('⚠️ エラーメッセージ')).toBeInTheDocument()
      expect(screen.getByText(defaultProps.resultStatement)).toBeInTheDocument()
    })

    it('loading=falseかつerror=nullかつresult=undefinedの場合、初期メッセージが表示される', () => {
      render(<InflationResult {...defaultProps} loading={false} error={null} result={undefined} />)
      
      expect(screen.getByText('西暦を選択し、金額に数値を入れて、通貨を選択します')).toBeInTheDocument()
    })
  })

  describe('スタイリング', () => {
    it('結果表示部分に適切なクラスが適用される', () => {
      render(<InflationResult {...defaultProps} />)
      
      const resultElement = screen.getByText(defaultProps.resultStatement)
      expect(resultElement).toHaveClass('text-zinc-900', 'drop-shadow-[0_0_3px_rgba(255,255,255,0.7)]')
    })

    it('結果表示部分に適切なテキストサイズクラスが適用される', () => {
      render(<InflationResult {...defaultProps} />)
      
      const containerElement = screen.getByText(defaultProps.resultStatement).closest('div')
      expect(containerElement).toHaveClass('text-2xl', 'sm:text-3xl')
    })
  })
})