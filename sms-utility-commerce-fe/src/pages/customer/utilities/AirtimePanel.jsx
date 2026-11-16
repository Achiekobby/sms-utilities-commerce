import { useEffect, useState } from 'react'
import { formatWalletAmount } from '../../../features/wallet/walletRecord'
import { quotePayload } from '../../../features/utilities/utilityModel'
import { QuoteAction } from './QuoteAction'
import { TelcoLogo } from './TelcoLogo'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const POPULAR = [5, 10, 20, 50, 100, 200]

function money(amount, currency) {
  return formatWalletAmount(amount, currency)
}

function bounds(item) {
  const min = Number(item?.min)
  const max = Number(item?.max)
  return {
    min: Number.isFinite(min) ? min : 1,
    max: Number.isFinite(max) ? max : 500,
  }
}

function startingAmount(item) {
  const { min, max } = bounds(item)
  const popular = POPULAR.find((value) => value >= min && value <= max)
  return String(popular ?? min)
}

function sanitizeAmount(value) {
  const next = String(value ?? '').replace(/[^\d.]/g, '')
  const dot = next.indexOf('.')
  if (dot === -1) return next
  return `${next.slice(0, dot)}.${next.slice(dot + 1).replace(/\./g, '').slice(0, 2)}`
}

export function AirtimePanel({ items, currency }) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? '')
  const network = items.find((item) => item.id === selectedId) ?? items[0]
  const { min, max } = bounds(network)
  const [amount, setAmount] = useState(() => startingAmount(items[0]))
  const numeric = Number(amount)
  const inRange = Number.isFinite(numeric) && numeric >= min && numeric <= max
  const sliderValue = inRange ? numeric : min
  const span = max > min ? ((Math.min(max, Math.max(min, sliderValue)) - min) / (max - min)) * 100 : 0
  const popular = POPULAR.filter((value) => value >= min && value <= max)

  useEffect(() => {
    const next = items.find((item) => item.id === selectedId) ?? items[0]
    setAmount(startingAmount(next))
  }, [selectedId, items])

  if (!items.length) return <p className="text-sm text-ink/55">No networks are available right now.</p>

  return (
    <div className="space-y-4">
      <div role="listbox" aria-label="Networks" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => {
          const selected = item.id === network?.id
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => setSelectedId(item.id)}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors ${focusClass} ${
                selected ? '' : 'border-[#E3ECF7] bg-white hover:border-ink/15'
              }`}
              style={
                selected
                  ? { borderColor: item.color, backgroundColor: item.tint, boxShadow: `0 0 0 1px ${item.color}` }
                  : undefined
              }
            >
              <TelcoLogo image={item.image} label={item.label} color={item.color} fit={item.fit} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-navy">{item.label}</span>
                <span
                  className="mt-0.5 block text-[11px] font-semibold tracking-wide uppercase"
                  style={{ color: selected ? item.ink : 'rgba(16,33,61,0.4)' }}
                >
                  {selected ? 'Selected' : 'Choose'}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {network ? (
        <>
        <section
          className="grid gap-4 rounded-2xl border border-[#E3ECF7] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04)] sm:p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-stretch lg:gap-8"
          style={{ '--telco': network.color }}
        >
          <div className="flex min-w-0 flex-col justify-center">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold text-navy">{network.label} airtime</h2>
              <p className="text-[12px] font-medium text-ink/45 tabular-nums">
                {money(min, currency)} – {money(max, '')}
              </p>
            </div>
            <label className="mt-3 block">
              <span className="sr-only">Airtime amount</span>
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
                  accentColor: network.color,
                  background: `linear-gradient(to right, ${network.color} ${span}%, #E3ECF7 ${span}%)`,
                }}
                className={`h-2 w-full cursor-pointer appearance-none rounded-full ${focusClass}`}
              />
              <span className="mt-2 flex justify-between text-[11px] font-medium text-ink/40 tabular-nums">
                <span>{money(min, '')}</span>
                <span>{money(max, '')}</span>
              </span>
            </label>
          </div>

          {popular.length ? (
            <div className="flex min-w-0 flex-col border-t border-ink/[0.06] pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
              <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ink/45 uppercase">Popular amounts</h3>
              <div className="mt-3 grid flex-1 grid-cols-3 gap-2">
                {popular.map((value) => {
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
                          ? { borderColor: network.color, backgroundColor: network.tint, boxShadow: `0 0 0 1px ${network.color}` }
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
        </section>
        <QuoteAction
          direct
          canSubmit={inRange}
          preview={{
            title: `${network.label} airtime`,
            network: network.label,
            unitAmount: inRange ? numeric : null,
            currency,
            verifiedContacts: String(network.id).toLowerCase() === 'yello',
          }}
          payload={quotePayload({ service: 'airtime', network: network.id, amount: inRange ? numeric : '' })}
          signature={`${network.id}:${inRange ? amount : ''}`}
          image={network.image}
          imageAlt={network.label}
        />
        </>
      ) : null}
    </div>
  )
}
