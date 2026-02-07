import { memo, useMemo } from 'react'
import { CpiType } from '../types'

interface CpiTrendChartProps {
  cpiData: CpiType[]
  currency: string
  selectedYear: string
}

const CHART_WIDTH = 600
const CHART_HEIGHT = 200
const PADDING = { top: 20, right: 20, bottom: 30, left: 50 }
const INNER_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right
const INNER_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom

const currencyLabels: Record<string, string> = {
  usd: '米ドル (USD)',
  jpy: '日本円 (JPY)',
  gbp: '英ポンド (GBP)',
  eur: 'ユーロ (EUR)',
}

const currencyBaseYears: Record<string, string> = {
  usd: '1982-84年=100',
  jpy: '2020年=100',
  gbp: '2015年=100',
  eur: '2015年=100',
}

const CpiTrendChartComponent = ({ cpiData, currency, selectedYear }: CpiTrendChartProps) => {
  const { points, areaPath, linePath, selectedPoint, yTicks, xTicks, minYear, maxYear } = useMemo(() => {
    // 有効なデータポイントを抽出
    const validData = cpiData
      .filter(d => d[currency] && Number(d[currency]) > 0)
      .map(d => ({ year: Number(d.year), value: Number(d[currency]) }))
      .sort((a, b) => a.year - b.year)

    if (validData.length === 0) {
      return { points: [], areaPath: '', linePath: '', selectedPoint: null, yTicks: [], xTicks: [], minYear: 0, maxYear: 0 }
    }

    const minY = 0
    const maxY = Math.ceil(validData[validData.length - 1].value * 1.1)
    const firstYear = validData[0].year
    const lastYear = validData[validData.length - 1].year
    const yearRange = lastYear - firstYear

    const scaleX = (year: number) => PADDING.left + ((year - firstYear) / yearRange) * INNER_WIDTH
    const scaleY = (value: number) => PADDING.top + INNER_HEIGHT - ((value - minY) / (maxY - minY)) * INNER_HEIGHT

    const pts = validData.map(d => ({ x: scaleX(d.year), y: scaleY(d.value), year: d.year, value: d.value }))

    // エリアパス
    const area = `M${pts[0].x},${scaleY(0)} ${pts.map(p => `L${p.x},${p.y}`).join(' ')} L${pts[pts.length - 1].x},${scaleY(0)} Z`
    // ラインパス
    const line = `M${pts.map(p => `${p.x},${p.y}`).join(' L')}`

    // 選択年のポイント
    const selYear = Number(selectedYear)
    const selData = validData.find(d => d.year === selYear)
    const sel = selData ? { x: scaleX(selData.year), y: scaleY(selData.value), year: selData.year, value: selData.value } : null

    // Y軸目盛り
    const yTickCount = 4
    const yTickStep = maxY / yTickCount
    const yTickValues = Array.from({ length: yTickCount + 1 }, (_, i) => Math.round(i * yTickStep))
    const yTickPts = yTickValues.map(v => ({ value: v, y: scaleY(v) }))

    // X軸目盛り（約5つ、きりのいい年）
    const xTickInterval = Math.max(10, Math.ceil(yearRange / 5 / 10) * 10)
    const firstTick = Math.ceil(firstYear / xTickInterval) * xTickInterval
    const xTickValues: number[] = []
    for (let y = firstTick; y <= lastYear; y += xTickInterval) {
      xTickValues.push(y)
    }

    return {
      points: pts,
      areaPath: area,
      linePath: line,
      selectedPoint: sel,
      yTicks: yTickPts,
      xTicks: xTickValues.map(y => ({ year: y, x: scaleX(y) })),
      minYear: firstYear,
      maxYear: lastYear,
    }
  }, [cpiData, currency, selectedYear])

  if (points.length === 0) return null

  return (
    <div className='mt-6 bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6'>
      <h3 className='text-lg font-semibold mb-1 text-gray-900'>
        {currencyLabels[currency] || currency.toUpperCase()} のCPI推移（{minYear}〜{maxYear}年）
      </h3>
      <p className='text-sm text-gray-500 mb-3'>
        基準: {currencyBaseYears[currency] || '不明'}
      </p>
      <div className='w-full overflow-x-auto'>
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className='w-full h-auto min-w-[300px]'
          role='img'
          aria-label={`${currencyLabels[currency] || currency}のCPI推移グラフ`}
        >
          {/* グリッド線 */}
          {yTicks.map(tick => (
            <line
              key={tick.value}
              x1={PADDING.left}
              y1={tick.y}
              x2={CHART_WIDTH - PADDING.right}
              y2={tick.y}
              stroke='#e5e7eb'
              strokeWidth={0.5}
            />
          ))}

          {/* エリア（グラデーション塗りつぶし） */}
          <defs>
            <linearGradient id='cpiGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#3b82f6' stopOpacity={0.3} />
              <stop offset='100%' stopColor='#3b82f6' stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill='url(#cpiGradient)' />

          {/* ライン */}
          <path d={linePath} fill='none' stroke='#3b82f6' strokeWidth={2} strokeLinejoin='round' />

          {/* 選択年の縦線とドット */}
          {selectedPoint && (
            <>
              <line
                x1={selectedPoint.x}
                y1={PADDING.top}
                x2={selectedPoint.x}
                y2={PADDING.top + INNER_HEIGHT}
                stroke='#ef4444'
                strokeWidth={1}
                strokeDasharray='4 3'
                opacity={0.6}
              />
              <circle
                cx={selectedPoint.x}
                cy={selectedPoint.y}
                r={5}
                fill='#ef4444'
                stroke='#fff'
                strokeWidth={2}
              />
              {/* 選択年のラベル */}
              <text
                x={selectedPoint.x}
                y={PADDING.top - 6}
                textAnchor='middle'
                className='text-[11px] font-bold fill-red-600'
              >
                {selectedPoint.year}年: {selectedPoint.value.toFixed(1)}
              </text>
            </>
          )}

          {/* Y軸ラベル */}
          {yTicks.map(tick => (
            <text
              key={tick.value}
              x={PADDING.left - 8}
              y={tick.y + 4}
              textAnchor='end'
              className='text-[10px] fill-gray-500'
            >
              {tick.value}
            </text>
          ))}

          {/* X軸ラベル */}
          {xTicks.map(tick => (
            <text
              key={tick.year}
              x={tick.x}
              y={CHART_HEIGHT - 6}
              textAnchor='middle'
              className='text-[10px] fill-gray-500'
            >
              {tick.year}
            </text>
          ))}

          {/* 軸線 */}
          <line x1={PADDING.left} y1={PADDING.top + INNER_HEIGHT} x2={CHART_WIDTH - PADDING.right} y2={PADDING.top + INNER_HEIGHT} stroke='#d1d5db' strokeWidth={1} />
          <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + INNER_HEIGHT} stroke='#d1d5db' strokeWidth={1} />
        </svg>
      </div>
      <p className='text-xs text-gray-500 mt-2 text-center'>
        消費者物価指数（CPI）の推移。赤い点が選択した{selectedYear}年の値です。
      </p>
    </div>
  )
}

export const CpiTrendChart = memo(CpiTrendChartComponent)
