import { useEffect, useRef, useState } from 'react'
import { quotePayload } from '../../../features/utilities/utilityModel'
import { formatWalletAmount } from '../../../features/wallet/walletRecord'
import { QuoteAction } from './QuoteAction'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const COMMON = [50, 100, 150, 200, 300, 500, 1000]

function money(amount, currency) {
  return formatWalletAmount(amount, currency)
}

function bounds(item) {
  const min = Number(item?.min)
  const max = Number(item?.max)
  return {
    min: Number.isFinite(min) ? min : 1,
    max: Number.isFinite(max) ? max : 5000,
  }
}

function startingAmount(item) {
  const { min, max } = bounds(item)
  const common = COMMON.find((value) => value >= min && value <= max)
  return String(common ?? min)
}

function sanitizeAmount(value) {
  const next = String(value ?? '').replace(/[^\d.]/g, '')
  const dot = next.indexOf('.')
  if (dot === -1) return next
  return `${next.slice(0, dot)}.${next.slice(dot + 1).replace(/\./g, '').slice(0, 2)}`
}

export function TvPanel({ items, currency }) {
  const formRef = useRef(null)
  const [selectedId, setSelectedId] = useState('')
  const provider = items.find((item) => item.id === selectedId) ?? null
  const { min, max } = bounds(provider)
  const [amount, setAmount] = useState('')
  const numeric = Number(amount)
  const inRange = provider && Number.isFinite(numeric) && numeric >= min && numeric <= max
  const sliderValue = inRange ? numeric : min
  const span = max > min ? ((Math.min(max, Math.max(min, sliderValue)) - min) / (max - min)) * 100 : 0
  const common = provider ? COMMON.filter((value) => value >= min && value <= max) : []

  useEffect(() => {
    const next = items.find((item) => item.id === selectedId)
    if (!next) return
    setAmount(startingAmount(next))
  }, [selectedId, items])

  useEffect(() => {
    if (!selectedId || !formRef.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    formRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }, [selectedId])

  if (!items.length) return <p className="text-sm text-ink/55">No TV providers are available right now.</p>

  return (
    <div className="space-y-4">
      <section>
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-ink/45 uppercase">1 · Provider</h2>
        <div role="listbox" aria-label="TV providers" className="mt-3 grid gap-3 sm:grid-cols-3">
          {items.map((item) => {
            const selected = item.id === provider?.id
            const range = bounds(item)
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => setSelectedId(item.id)}
                className={`relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white p-3 text-left shadow-[0_1px_2px_rgba(16,33,61,0.04)] transition-colors ${focusClass} ${
                  selected ? '' : 'border-[#E3ECF7] hover:border-ink/15'
                }`}
                style={
                  selected
                    ? { borderColor: item.color, backgroundColor: item.tint, boxShadow: `0 0 0 1px ${item.color}` }
                    : undefined
                }
              >
                <span
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: item.color, opacity: selected ? 1 : 0.4 }}
                  aria-hidden="true"
                />
                <span className="mt-2 flex h-28 items-center justify-center rounded-xl bg-white px-4 ring-1 ring-black/[0.05]">
                  {item.image ? (
                    <img src={item.image} alt="" className="max-h-16 w-full object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-navy">{item.name}</span>
                  )}
                </span>
                <span className="mt-3 flex items-end justify-between gap-3 px-1 pb-0.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-navy">{item.name}</span>
                    <span
                      className="mt-0.5 block text-[11px] font-semibold tracking-wide uppercase"
                      style={{ color: selected ? item.ink : 'rgba(16,33,61,0.4)' }}
                    >
                      {selected ? 'Selected' : 'Choose'}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-[11px] font-medium text-ink/45 tabular-nums">
                    {money(range.min, '')}–{money(range.max, '')}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {provider ? (
        <section
          ref={formRef}
          className="scroll-mt-28 rounded-2xl border border-[#E3ECF7] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04)] sm:p-5"
          style={{ '--telco': provider.color }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: provider.ink }}>
              2 · {provider.name} amount
            </h2>
            <p className="text-[12px] font-medium text-ink/45 tabular-nums">
              {money(min, currency)} – {money(max, '')}
            </p>
          </div>
          <label className="mt-3 block">
            <span className="sr-only">{provider.name} amount</span>
            <span className="flex h-16 items-center rounded-2xl border border-ink/10 bg-canvas px-4 focus-within:border-(--telco)">
              <span className="text-sm font-semibold text-ink/40">{currency || 'GHS'}</span>
              <input
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(sanitizeAmount(event.target.value))}
                className={`h-full min-w-0 flex-1 bg-transparent px-3 text-3xl font-bold tracking-tight text-navy tabular-nums outline-none ${focusClass}`}
              />
            </span>
          </label>
          {amount && !inRange ? (
            <p className="mt-1.5 text-xs text-[#9F1C26]">
              Enter an amount from {money(min, currency)} to {money(max, currency)}.
            </p>
          ) : null}
          <label className="mt-5 block">
            <span className="sr-only">Slide to choose an amount</span>
            <input
              type="range"
              min={min}
              max={max}
              step={1}
              value={sliderValue}
              onChange={(event) => setAmount(event.target.value)}
              style={{
                accentColor: provider.color,
                background: `linear-gradient(to right, ${provider.color} ${span}%, #E3ECF7 ${span}%)`,
              }}
              className={`h-2 w-full cursor-pointer appearance-none rounded-full ${focusClass}`}
            />
            <span className="mt-2 flex justify-between text-[11px] font-medium text-ink/40 tabular-nums">
              <span>{money(min, '')}</span>
              <span>{money(max, '')}</span>
            </span>
          </label>
          {common.length ? (
            <div className="mt-5">
              <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ink/45 uppercase">Common amounts</h3>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {common.map((value) => {
                  const picked = Number(amount) === value
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={picked}
                      onClick={() => setAmount(String(value))}
                      className={`flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-xl border px-2 text-center text-navy transition-colors ${focusClass} ${
                        picked ? '' : 'border-[#E3ECF7] bg-[#F8FBFF] hover:border-ink/15'
                      }`}
                      style={
                        picked
                          ? {
                              borderColor: provider.color,
                              backgroundColor: provider.tint,
                              boxShadow: `0 0 0 1px ${provider.color}`,
                            }
                          : undefined
                      }
                    >
                      <span className="text-[10px] font-semibold tracking-wide text-ink/40">{currency || 'GHS'}</span>
                      <span className="text-lg font-bold tabular-nums">{value}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
          <QuoteAction
            canSubmit={inRange}
            payload={quotePayload({ service: 'tv', billType: provider.id, amount: inRange ? numeric : '' })}
            signature={`${provider.id}:${inRange ? amount : ''}`}
            image={provider.image}
            imageAlt={provider.name}
          />
        </section>
      ) : (
        <p className="rounded-2xl border border-dashed border-[#D5E0EE] bg-white px-4 py-8 text-center text-sm text-ink/55">
          Choose a provider. The amount for that service opens here.
        </p>
      )}
    </div>
  )
}
