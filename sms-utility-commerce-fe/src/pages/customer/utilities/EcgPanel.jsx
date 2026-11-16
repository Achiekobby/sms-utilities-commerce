import { useState } from 'react'
import { quotePayload } from '../../../features/utilities/utilityModel'
import { formatWalletAmount } from '../../../features/wallet/walletRecord'
import { QuoteAction } from './QuoteAction'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const COMMON = [20, 50, 100, 200, 500, 1000]

function money(amount, currency) {
  return formatWalletAmount(amount, currency)
}

function bounds(minAmount, maxAmount) {
  const min = Number(minAmount)
  const max = Number(maxAmount)
  return {
    min: Number.isFinite(min) ? min : 1,
    max: Number.isFinite(max) ? max : 5000,
  }
}

function startingAmount(min, max) {
  const common = COMMON.find((value) => value >= min && value <= max)
  return String(common ?? min)
}

function sanitizeAmount(value) {
  const next = String(value ?? '').replace(/[^\d.]/g, '')
  const dot = next.indexOf('.')
  if (dot === -1) return next
  return `${next.slice(0, dot)}.${next.slice(dot + 1).replace(/\./g, '').slice(0, 2)}`
}

export function EcgPanel({ offer }) {
  const { min, max } = bounds(offer.min, offer.max)
  const [amount, setAmount] = useState(() => startingAmount(min, max))
  const numeric = Number(amount)
  const inRange = Number.isFinite(numeric) && numeric >= min && numeric <= max
  const sliderValue = inRange ? numeric : min
  const span = max > min ? ((Math.min(max, Math.max(min, sliderValue)) - min) / (max - min)) * 100 : 0
  const common = COMMON.filter((value) => value >= min && value <= max)

  return (
    <section
      className="overflow-hidden rounded-2xl border border-[#E3ECF7] bg-white shadow-[0_1px_2px_rgba(16,33,61,0.04)]"
      style={{ '--telco': offer.color }}
    >
      <div className="px-4 pt-4 sm:px-5">
        <div className="flex h-32 items-center justify-center rounded-xl bg-white px-6 ring-1 ring-black/[0.05] sm:h-36">
          {offer.image ? (
            <img src={offer.image} alt="Electricity Company of Ghana" className="max-h-24 w-full object-contain sm:max-h-28" />
          ) : (
            <p className="text-lg font-bold text-navy">ECG</p>
          )}
        </div>
      </div>
      <div className="mx-4 mt-4 h-1 rounded-full sm:mx-5" style={{ backgroundColor: offer.bar }} aria-hidden="true" />
      <div className="p-4 sm:p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-navy">Prepaid units</h2>
          <p className="text-[12px] font-medium text-ink/45 tabular-nums">
            {money(min, offer.currency)} – {money(max, '')}
          </p>
        </div>
        <label className="mt-3 block">
          <span className="sr-only">Prepaid amount</span>
          <span className="flex h-16 items-center rounded-2xl border border-ink/10 bg-canvas px-4 focus-within:border-(--telco)">
            <span className="text-sm font-semibold text-ink/40">{offer.currency || 'GHS'}</span>
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
            Enter an amount from {money(min, offer.currency)} to {money(max, offer.currency)}.
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
              accentColor: offer.color,
              background: `linear-gradient(to right, ${offer.color} ${span}%, #E3ECF7 ${span}%)`,
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
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
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
                        ? { borderColor: offer.color, backgroundColor: offer.tint, boxShadow: `0 0 0 1px ${offer.color}` }
                        : undefined
                    }
                  >
                    <span className="text-[10px] font-semibold tracking-wide text-ink/40">{offer.currency || 'GHS'}</span>
                    <span className="text-lg font-bold tabular-nums">{value}</span>
                  </button>
                )
              })}
            </div>
          </div>
          ) : null}
        <QuoteAction
          canSubmit={inRange}
          payload={quotePayload({ service: 'ecg', amount: inRange ? numeric : '' })}
          signature={inRange ? amount : ''}
          image={offer.image}
          imageAlt="Electricity Company of Ghana"
        />
      </div>
    </section>
  )
}
