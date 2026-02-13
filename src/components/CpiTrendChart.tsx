import { memo, useMemo } from 'react'
import { CpiType } from '../types'

interface CpiTrendChartProps {
  cpiData: CpiType[]
  currency: string
  selectedYear: string
}

const CHART_WIDTH = 600
const CHART_HEIGHT = 240
const PADDING = { top: 30, right: 20, bottom: 40, left: 55 }
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
  const { points, areaPath, linePath, selectedPoint, yTicks, xTicks, minYear, maxYear, validData } = useMemo(() => {
    const validData = cpiData
      .filter(d => d[currency] && Number(d[currency]) > 0)
      .map(d => ({ year: Number(d.year), value: Number(d[currency]) }))
      .sort((a, b) => a.year - b.year)

    if (validData.length === 0) {
      return { points: [], areaPath: '', linePath: '', selectedPoint: null, yTicks: [], xTicks: [], minYear: 0, maxYear: 0, validData: [] }
    }

    const minY = 0
    const maxY = Math.ceil(validData[validData.length - 1].value * 1.1)
    const firstYear = validData[0].year
    const lastYear = validData[validData.length - 1].year
    const yearRange = lastYear - firstYear

    const scaleX = (year: number) => PADDING.left + ((year - firstYear) / yearRange) * INNER_WIDTH
    const scaleY = (value: number) => PADDING.top + INNER_HEIGHT - ((value - minY) / (maxY - minY)) * INNER_HEIGHT

    const pts = validData.map(d => ({ x: scaleX(d.year), y: scaleY(d.value), year: d.year, value: d.value }))

    const area = `M${pts[0].x},${scaleY(0)} ${pts.map(p => `L${p.x},${p.y}`).join(' ')} L${pts[pts.length - 1].x},${scaleY(0)} Z`
    const line = `M${pts.map(p => `${p.x},${p.y}`).join(' L')}`

    const selYear = Number(selectedYear)
    const selData = validData.find(d => d.year === selYear)
    const sel = selData ? { x: scaleX(selData.year), y: scaleY(selData.value), year: selData.year, value: selData.value } : null

    const yTickCount = 4
    const yTickStep = maxY / yTickCount
    const yTickValues = Array.from({ length: yTickCount + 1 }, (_, i) => Math.round(i * yTickStep))
    const yTickPts = yTickValues.map(v => ({ value: v, y: scaleY(v) }))

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
      validData,
    }
  }, [cpiData, currency, selectedYear])

  if (points.length === 0) return null

  // データテーブル用：10年ごと + 選択年
  const tableData = useMemo(() => {
    const decades = validData.filter(d => d.year % 10 === 0)
    const selYear = Number(selectedYear)
    const selEntry = validData.find(d => d.year === selYear)
    if (selEntry && !decades.find(d => d.year === selYear)) {
      decades.push(selEntry)
    }
    return decades.sort((a, b) => a.year - b.year)
  }, [validData, selectedYear])

  return (
    <div className='mt-6 bg-white/90 backdrop-blur-sm rounded-xl border border-primary-200/50 p-4 sm:p-6'>
      <h3 className='text-base font-heading font-bold mb-1 text-primary-900'>
        {currencyLabels[currency] || currency.toUpperCase()} のCPI推移（{minYear}〜{maxYear}年）
      </h3>
      <p className='text-sm text-primary-600 mb-3'>
        基準: {currencyBaseYears[currency] || '不明'}
      </p>

      <p className='sm:hidden text-xs text-primary-500 text-center mb-1'>
        ← 横にスクロールできます →
      </p>

      <div className='w-full overflow-x-auto'>
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className='w-full h-auto min-w-[300px]'
          role='img'
          aria-label={`${currencyLabels[currency] || currency}のCPI推移グラフ`}
        >
          {yTicks.map(tick => (
            <line
              key={tick.value}
              x1={PADDING.left}
              y1={tick.y}
              x2={CHART_WIDTH - PADDING.right}
              y2={tick.y}
              stroke='#A5F3FC'
              strokeWidth={0.5}
            />
          ))}

          <defs>
            <linearGradient id='cpiGradient' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#0891B2' stopOpacity={0.25} />
              <stop offset='100%' stopColor='#0891B2' stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <path d={areaPath} fill='url(#cpiGradient)' />

          <path d={linePath} fill='none' stroke='#0891B2' strokeWidth={2} strokeLinejoin='round' />

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
              <text
                x={selectedPoint.x}
                y={PADDING.top - 8}
                textAnchor='middle'
                className='text-[13px] font-bold fill-red-600'
              >
                {selectedPoint.year}年: {selectedPoint.value.toFixed(1)}
              </text>
            </>
          )}

          {yTicks.map(tick => (
            <text
              key={tick.value}
              x={PADDING.left - 8}
              y={tick.y + 4}
              textAnchor='end'
              className='text-[12px] fill-primary-600'
            >
              {tick.value}
            </text>
          ))}

          {xTicks.map(tick => (
            <text
              key={tick.year}
              x={tick.x}
              y={CHART_HEIGHT - 8}
              textAnchor='middle'
              className='text-[12px] fill-primary-600'
            >
              {tick.year}
            </text>
          ))}

          <line x1={PADDING.left} y1={PADDING.top + INNER_HEIGHT} x2={CHART_WIDTH - PADDING.right} y2={PADDING.top + INNER_HEIGHT} stroke='#A5F3FC' strokeWidth={1} />
          <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={PADDING.top + INNER_HEIGHT} stroke='#A5F3FC' strokeWidth={1} />
        </svg>
      </div>

      <p className='text-xs text-primary-600 mt-2 text-center'>
        消費者物価指数（CPI）の推移。赤い点が選択した{selectedYear}年の値です。
      </p>

      <details className='mt-3'>
        <summary className='text-xs text-primary-600 cursor-pointer hover:text-primary-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400/30 rounded px-1'>
          データ表を表示
        </summary>
        <div className='overflow-x-auto mt-2'>
          <table className='text-xs border-collapse w-full' aria-label='CPI推移データ'>
            <thead>
              <tr>
                <th className='border border-primary-200 px-2 py-1 bg-primary-50 text-left text-primary-800'>年</th>
                <th className='border border-primary-200 px-2 py-1 bg-primary-50 text-right text-primary-800'>CPI</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(d => (
                <tr key={d.year} className={d.year === Number(selectedYear) ? 'bg-primary-100 font-bold' : ''}>
                  <td className='border border-primary-200 px-2 py-1 text-primary-700'>{d.year}年</td>
                  <td className='border border-primary-200 px-2 py-1 text-right text-primary-700'>{d.value.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}

export const CpiTrendChart = memo(CpiTrendChartComponent)
