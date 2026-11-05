import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useClickOutside } from '../../../../utils/hooks/useClickOutside'
import { useDisclosure } from '../../../../utils/hooks/useDisclosure'
import {
  deliveredColor,
  deliveryStatus,
  deliveryTotal,
  periods,
  rateColor,
  sentColor,
  volumeAxis,
  volumeSeries,
} from '../chartData'
import { formatCount } from '../format'

const tick = { fill: '#8B95A7', fontSize: 12, fontFamily: 'Onest, sans-serif' }
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const card =
  'rounded-xl border border-ink/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-5'

function formatVolume(value) {
  if (value === 0) return '0'
  const thousands = value / 1000
  return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(0)}K`
}

function PeriodMenu({ period, onChange }) {
  const menu = useDisclosure()
  const { close } = menu
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const active = periods.find((item) => item.id === period) ?? periods[0]

  useClickOutside(rootRef, close, menu.isOpen)

  useEffect(() => {
    if (!menu.isOpen) return undefined

    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      close()
      triggerRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menu.isOpen, close])

  function select(id) {
    onChange(id)
    close()
    triggerRef.current?.focus()
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={menu.isOpen}
        aria-label={`Chart interval: ${active.label}`}
        onClick={menu.toggle}
        className={`inline-flex h-9 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-medium text-navy ${focusClass} ${
          menu.isOpen ? 'border-blue/50' : 'border-ink/10'
        }`}
      >
        {active.label}
        <ChevronDown
          size={15}
          strokeWidth={2.2}
          aria-hidden="true"
          className={`text-ink/45 transition-transform duration-200 ${menu.isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {menu.isOpen ? (
        <ul
          role="listbox"
          aria-label="Chart interval"
          className="absolute top-full right-0 z-20 mt-1.5 w-36 overflow-hidden rounded-lg bg-white p-1 shadow-[0_1px_2px_rgba(16,33,61,0.08),0_16px_40px_-12px_rgba(11,31,91,0.4)] ring-1 ring-ink/[0.06]"
        >
          {periods.map((item) => {
            const selected = item.id === period
            return (
              <li key={item.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => select(item.id)}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm hover:bg-canvas ${focusClass} focus-visible:outline-offset-[-2px] ${
                    selected ? 'font-semibold text-navy' : 'font-medium text-ink/75'
                  }`}
                >
                  {item.label}
                  {selected ? <Check size={15} strokeWidth={2.4} aria-hidden="true" className="text-blue" /> : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function VolumeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload

  return (
    <div className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-xs shadow-[0_8px_24px_-12px_rgba(11,31,91,0.45)]">
      <p className="font-semibold text-navy">{label}</p>
      <p className="mt-1.5 text-ink/70">
        Messages sent <span className="font-semibold text-navy tabular-nums">{formatCount(row.sent)}</span>
      </p>
      <p className="text-ink/70">
        Delivered <span className="font-semibold text-navy tabular-nums">{formatCount(row.delivered)}</span>
      </p>
      <p className="text-ink/70">
        Delivery rate <span className="font-semibold text-navy tabular-nums">{row.rate}%</span>
      </p>
    </div>
  )
}

function VolumeChart() {
  const [period, setPeriod] = useState('daily')
  const { data, ticks } = volumeSeries(period)
  const axis = volumeAxis(data)

  return (
    <article className={`${card} flex min-w-0 flex-col`}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-base font-bold text-navy sm:text-lg">Message Volume & Delivery Rate</h2>
        <PeriodMenu period={period} onChange={setPeriod} />
      </div>

      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink/70">
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-[2px]" style={{ backgroundColor: sentColor }} />
          Messages Sent
        </li>
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="size-2.5 rounded-[2px]" style={{ backgroundColor: deliveredColor }} />
          Delivered
        </li>
        <li className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="relative flex h-2.5 w-5 items-center">
            <span className="h-0.5 w-full" style={{ backgroundColor: rateColor }} />
            <span
              className="absolute left-1/2 size-2 -translate-x-1/2 rounded-full"
              style={{ backgroundColor: rateColor }}
            />
          </span>
          Delivery Rate
        </li>
      </ul>

      {/* Grows with the neighbouring card, so the plot fills the space instead of leaving a gap. */}
      <div className="relative mt-2 min-h-72 min-w-0 flex-1">
        <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }} barGap={1} barCategoryGap="32%">
            <CartesianGrid vertical={false} stroke="#EEF2F6" />
            <XAxis
              dataKey="label"
              ticks={ticks}
              tick={tick}
              axisLine={false}
              tickLine={false}
              dy={6}
              interval={0}
            />
            <YAxis
              yAxisId="volume"
              domain={axis.domain}
              ticks={axis.ticks}
              tick={tick}
              tickFormatter={formatVolume}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <YAxis
              yAxisId="rate"
              orientation="right"
              domain={[80, 100]}
              ticks={[80, 85, 90, 95, 100]}
              tick={tick}
              tickFormatter={(value) => `${value}%`}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            <Tooltip content={<VolumeTooltip />} cursor={{ fill: 'rgb(11 31 91 / 0.04)' }} />
            <Bar yAxisId="volume" dataKey="sent" fill={sentColor} radius={[2, 2, 0, 0]} maxBarSize={8} />
            <Bar yAxisId="volume" dataKey="delivered" fill={deliveredColor} radius={[2, 2, 0, 0]} maxBarSize={8} />
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="rate"
              stroke={rateColor}
              strokeWidth={2}
              dot={{ r: 3, fill: rateColor, stroke: rateColor }}
              activeDot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        </div>
      </div>
    </article>
  )
}

const donutSize = 120
const donutStroke = 13
const donutRadius = (donutSize - donutStroke) / 2
const donutLength = 2 * Math.PI * donutRadius

function DeliveryDonut({ active, onActive }) {
  const slices = deliveryStatus.reduce((list, item) => {
    const cursor = list.reduce((sum, slice) => sum + slice.length, 0)
    const length = (item.value / deliveryTotal) * donutLength
    return [...list, { ...item, length, cursor }]
  }, [])

  return (
    <svg viewBox={`0 0 ${donutSize} ${donutSize}`} className="h-full w-full" role="img" aria-label="Delivery status">
      <g transform={`rotate(-90 ${donutSize / 2} ${donutSize / 2})`}>
        {slices.map((slice, index) => (
          <circle
            key={slice.label}
            cx={donutSize / 2}
            cy={donutSize / 2}
            r={donutRadius}
            fill="none"
            stroke={slice.color}
            strokeWidth={donutStroke}
            strokeDasharray={`${slice.length} ${donutLength - slice.length}`}
            strokeDashoffset={-slice.cursor}
            className="cursor-pointer transition-opacity duration-150"
            opacity={active == null || active === index ? 1 : 0.35}
            onMouseEnter={(event) => onActive(index, event)}
            onMouseLeave={() => onActive(null)}
          />
        ))}
      </g>
    </svg>
  )
}

function DeliveryStatus() {
  const cardRef = useRef(null)
  const [active, setActive] = useState(null)
  const [pointer, setPointer] = useState(null)
  const hovered = active == null ? null : deliveryStatus[active]

  function track(event) {
    const box = cardRef.current?.getBoundingClientRect()
    if (!box) return
    const tipWidth = 136
    const tipHeight = 52
    let x = event.clientX - box.left + 12
    let y = event.clientY - box.top - tipHeight - 6
    if (x + tipWidth > box.width - 8) x = event.clientX - box.left - tipWidth - 12
    if (x < 8) x = 8
    if (y < 8) y = event.clientY - box.top + 14
    setPointer({ x, y })
  }

  function focus(index, event) {
    setActive(index)
    if (event) track(event)
  }

  return (
    <article
      ref={cardRef}
      className={`${card} @container/status relative flex min-w-0 flex-col`}
      onMouseMove={active == null ? undefined : track}
    >
      <h2 className="text-base font-bold text-navy sm:text-lg">Delivery Status</h2>

      <div className="mt-5 flex min-w-0 flex-1 flex-col justify-center gap-6 @min-[26rem]/status:flex-row @min-[26rem]/status:items-center @min-[26rem]/status:gap-5">
        <div className="@container/donut relative mx-auto aspect-square w-full max-w-60 min-w-0 @min-[26rem]/status:mx-0 @min-[26rem]/status:w-[46%] @min-[26rem]/status:shrink-0">
          <DeliveryDonut active={active} onActive={focus} />
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[clamp(0.9rem,14cqw,1.75rem)] leading-none font-bold tracking-tight whitespace-nowrap text-navy tabular-nums">
              {formatCount(deliveryTotal)}
            </p>
            <p className="mt-1.5 text-[clamp(0.65rem,6.5cqw,0.8125rem)] text-ink/50">Messages</p>
          </div>
        </div>

        <ul className="@container/legend min-w-0 flex-1 divide-y divide-ink/[0.07]" onMouseLeave={() => setActive(null)}>
          {deliveryStatus.map((item, index) => (
            <li
              key={item.label}
              className={`grid grid-cols-[auto_minmax(0,1fr)_auto_3.25em] items-center gap-x-[clamp(0.4rem,3cqw,0.75rem)] py-[clamp(0.55rem,4cqw,0.9rem)] text-[clamp(0.7rem,5.6cqw,0.875rem)] transition-opacity duration-150 ${
                active == null || active === index ? 'opacity-100' : 'opacity-40'
              }`}
              onMouseEnter={(event) => focus(index, event)}
            >
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate font-medium text-ink/75">{item.label}</span>
              <span className="font-bold text-navy tabular-nums">{formatCount(item.value)}</span>
              <span className="text-right text-ink/45 tabular-nums">{item.share}</span>
            </li>
          ))}
        </ul>
      </div>

      {hovered && pointer ? (
        <div
          className="pointer-events-none absolute z-20 w-max rounded-lg border border-ink/10 bg-white px-3 py-2 text-xs shadow-[0_8px_24px_-12px_rgba(11,31,91,0.45)]"
          style={{ left: pointer.x, top: pointer.y }}
        >
          <p className="font-semibold text-navy">{hovered.label}</p>
          <p className="mt-1 text-ink/70 tabular-nums">
            {formatCount(hovered.value)} · {hovered.share}
          </p>
        </div>
      ) : null}
    </article>
  )
}

export function MessageCharts() {
  return (
    <section aria-label="Message volume and delivery status" className="@container/charts mt-6 min-w-0 sm:mt-7">
      <div className="grid min-w-0 items-stretch gap-4 @min-[40rem]/charts:grid-cols-[minmax(0,1.7fr)_minmax(16rem,0.95fr)]">
        <VolumeChart />
        <DeliveryStatus />
      </div>
    </section>
  )
}
