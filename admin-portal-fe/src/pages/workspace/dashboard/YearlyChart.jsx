import { ArrowDownRight, ArrowUpRight, Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Area, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCedi, formatCount, yearlySeries, yearlyViews, yearlyYears } from './data'

const tick = { fill: '#8B95A7', fontSize: 12, fontFamily: 'Onest, sans-serif' }
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const card =
  'rounded-xl border border-ink/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-5'

const tones = {
  payments: { stroke: '#008859' },
  subscriptions: { stroke: '#0B63F6' },
}

function formatValue(view, value) {
  return view === 'payments' ? formatCedi(value) : formatCount(value)
}

function formatAxis(view, value) {
  if (value === 0) return '0'
  if (view === 'subscriptions') return formatCount(value)
  return `${Math.round(value / 1000)}k`
}

function YearMenu({ year, onChange }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Year: ${year}`}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border bg-white px-3 text-sm font-medium text-navy ${focusClass} ${
          open ? 'border-blue/50' : 'border-ink/10'
        }`}
      >
        {year}
        <ChevronDown size={15} strokeWidth={2.2} aria-hidden="true" className={`text-ink/45 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="Year"
          className="absolute top-full right-0 z-20 mt-1.5 w-28 overflow-hidden rounded-lg bg-white p-1 shadow-[0_16px_40px_-12px_rgba(11,31,91,0.4)] ring-1 ring-ink/[0.06]"
        >
          {yearlyYears.map((item) => {
            const selected = item === year
            return (
              <li key={item}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(item)
                    setOpen(false)
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-left text-sm hover:bg-canvas ${focusClass} ${
                    selected ? 'font-semibold text-navy' : 'font-medium text-ink/75'
                  }`}
                >
                  {item}
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

function YearTooltip({ active, payload, label, view }) {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value ?? 0

  return (
    <div className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-xs shadow-[0_8px_24px_-12px_rgba(11,31,91,0.45)]">
      <p className="font-semibold text-navy">{label}</p>
      <p className="mt-1 text-ink/70">
        {view === 'payments' ? 'Collected' : 'New plans'}{' '}
        <span className="font-semibold text-navy tabular-nums">{formatValue(view, value)}</span>
      </p>
    </div>
  )
}

export function YearlyChart() {
  const [year, setYear] = useState(yearlyYears[0])
  const [view, setView] = useState('payments')
  const data = yearlySeries(year, view)
  const tone = tones[view]
  const activeView = yearlyViews.find((item) => item.id === view) ?? yearlyViews[0]
  const total = data.reduce((sum, row) => sum + row.value, 0)
  const average = Math.round(total / data.length)
  const peak = data.reduce((best, row) => (row.value > best.value ? row : best), data[0])
  const prior = yearlySeries(year - 1, view)
  const priorTotal = prior.reduce((sum, row) => sum + row.value, 0)
  const change = priorTotal ? ((total - priorTotal) / priorTotal) * 100 : null
  const up = change == null || change >= 0
  const ChangeIcon = up ? ArrowUpRight : ArrowDownRight

  return (
    <section aria-label="Yearly payments and subscriptions" className="mt-6 w-full min-w-0 sm:mt-7">
      <article className={`${card} w-full min-w-0`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-base font-bold text-navy sm:text-lg">Year in view</h2>
            <p className="mt-1 max-w-xl text-sm text-ink/55">{activeView.detail} Sample figures.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div role="tablist" aria-label="Yearly measure" className="inline-flex rounded-lg bg-[#F3F6FB] p-1">
              {yearlyViews.map((item) => {
                const selected = item.id === view
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setView(item.id)}
                    className={`h-8 cursor-pointer rounded-md px-3 text-sm ${focusClass} ${
                      selected ? 'bg-white font-semibold text-navy shadow-sm' : 'font-medium text-ink/60 hover:text-navy'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
            <YearMenu year={year} onChange={setYear} />
          </div>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[#F7F9FC] px-4 py-3">
            <dt className="text-xs font-medium text-ink/50">{view === 'payments' ? 'Collected' : 'New plans'}</dt>
            <dd className="mt-1 text-xl font-bold tracking-tight text-navy tabular-nums">{formatValue(view, total)}</dd>
            {change == null ? null : (
              <p className={`mt-1 inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${up ? 'text-green' : 'text-[#D7192A]'}`}>
                <ChangeIcon size={14} strokeWidth={2.4} aria-hidden="true" />
                <span className="sr-only">{up ? 'Up' : 'Down'} </span>
                {Math.abs(change).toFixed(1)}%
                <span className="font-medium text-ink/45"> vs {year - 1}</span>
              </p>
            )}
          </div>
          <div className="rounded-xl bg-[#F7F9FC] px-4 py-3">
            <dt className="text-xs font-medium text-ink/50">Monthly average</dt>
            <dd className="mt-1 text-xl font-bold tracking-tight text-navy tabular-nums">{formatValue(view, average)}</dd>
          </div>
          <div className="rounded-xl bg-[#F7F9FC] px-4 py-3">
            <dt className="text-xs font-medium text-ink/50">Strongest month</dt>
            <dd className="mt-1 text-xl font-bold tracking-tight text-navy">{peak.label}</dd>
            <p className="mt-1 text-xs font-medium text-ink/45 tabular-nums">{formatValue(view, peak.value)}</p>
          </div>
        </dl>

        <div className="relative mt-4 h-80 w-full min-w-0">
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id={`yearly-${view}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={tone.stroke} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={tone.stroke} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#EEF2F6" />
                <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} dy={6} />
                <YAxis tick={tick} axisLine={false} tickLine={false} width={48} tickFormatter={(value) => formatAxis(view, value)} />
                <Tooltip content={<YearTooltip view={view} />} cursor={{ stroke: tone.stroke, strokeOpacity: 0.25 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={tone.stroke}
                  strokeWidth={2.5}
                  fill={`url(#yearly-${view})`}
                  fillOpacity={1}
                  dot={{ r: 3, fill: tone.stroke, stroke: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: tone.stroke, stroke: '#fff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </article>
    </section>
  )
}
