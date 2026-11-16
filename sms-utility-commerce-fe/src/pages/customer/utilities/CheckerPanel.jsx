import { useEffect, useRef, useState } from 'react'
import { quotePayload } from '../../../features/utilities/utilityModel'
import { formatWalletAmount } from '../../../features/wallet/walletRecord'
import { QuoteAction } from './QuoteAction'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const COMMON = [1, 2, 5, 10, 20, 50]

function money(amount, currency) {
  return formatWalletAmount(amount, currency)
}

function sanitizeQuantity(value, max) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return String(Math.min(max, Number(digits)))
}

function quantityChoices(max) {
  const listed = COMMON.filter((value) => value <= max)
  if (!listed.includes(max)) listed.push(max)
  return listed
}

export function CheckerPanel({ items, currency, maxQuantity }) {
  const formRef = useRef(null)
  const max = Number.isInteger(maxQuantity) && maxQuantity >= 1 ? maxQuantity : null
  const [selectedId, setSelectedId] = useState('')
  const checker = items.find((item) => item.id === selectedId) ?? null
  const [quantity, setQuantity] = useState('1')
  const count = Number(quantity)
  const valid = checker && max != null && Number.isInteger(count) && count >= 1 && count <= max
  const span = max != null && max > 1 ? ((Math.min(max, Math.max(1, valid ? count : 1)) - 1) / (max - 1)) * 100 : 0
  const common = max == null ? [] : quantityChoices(max)
  const total = valid ? Number(checker.price) * count : null

  useEffect(() => {
    if (!selectedId) return
    setQuantity('1')
  }, [selectedId])

  useEffect(() => {
    if (!selectedId || !formRef.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    formRef.current.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  }, [selectedId])

  if (!items.length) return <p className="text-sm text-ink/55">No checkers are available right now.</p>

  return (
    <div className="space-y-4">
      <section>
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-ink/45 uppercase">1 · Checker</h2>
        <div role="listbox" aria-label="Results checkers" className="mt-3 grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const selected = item.id === checker?.id
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={!item.available}
                onClick={() => setSelectedId(item.id)}
                className={`relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white p-3 text-left shadow-[0_1px_2px_rgba(16,33,61,0.04)] transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${focusClass} ${
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
                  style={{ backgroundColor: item.bar, opacity: selected ? 1 : 0.7 }}
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
                      {selected ? 'Selected' : item.available ? 'Choose' : 'Unavailable'}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-[12px] font-semibold text-navy tabular-nums">
                    {money(item.price, currency)}
                    <span className="block text-[10px] font-medium text-ink/40">each</span>
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {checker ? (
        <section
          ref={formRef}
          className="scroll-mt-28 rounded-2xl border border-[#E3ECF7] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04)] sm:p-5"
          style={{ '--checker': checker.color }}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: checker.ink }}>
              2 · {checker.name} vouchers
            </h2>
            <p className="text-[12px] font-medium text-ink/45 tabular-nums">
              {max == null ? 'No purchase limit listed' : `Maximum ${max} vouchers`}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              aria-label="Fewer vouchers"
              disabled={!valid || count <= 1}
              onClick={() => setQuantity(String(Math.max(1, count - 1)))}
              className={`flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#E3ECF7] bg-white text-lg font-bold text-navy disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
            >
              −
            </button>
            <label className="min-w-0 flex-1">
              <span className="sr-only">Number of vouchers</span>
              <span className="flex h-12 items-center rounded-xl border border-ink/10 bg-canvas px-4 focus-within:border-(--checker)">
                <input
                  inputMode="numeric"
                  value={quantity}
                  disabled={max == null}
                onChange={(event) => {
                  if (max == null) return
                  setQuantity(sanitizeQuantity(event.target.value, max))
                }}
                  className={`h-full w-full bg-transparent text-center text-2xl font-bold tracking-tight text-navy tabular-nums outline-none ${focusClass}`}
                />
              </span>
            </label>
            <button
              type="button"
              aria-label="More vouchers"
              disabled={!valid || count >= max}
              onClick={() => setQuantity(String(Math.min(max, count + 1)))}
              className={`flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#E3ECF7] bg-white text-lg font-bold text-navy disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
            >
              +
            </button>
          </div>
          {quantity && !valid ? (
            <p className="mt-1.5 text-xs text-[#9F1C26]">
              {max == null ? 'A purchase limit was not included for these checkers.' : `Enter a quantity from 1 to ${max}.`}
            </p>
          ) : null}
          {max != null ? (
          <>
          <label className="mt-5 block">
            <span className="sr-only">Slide to choose a quantity</span>
            <input
              type="range"
              min={1}
              max={max}
              step={1}
              value={valid ? count : 1}
              onChange={(event) => setQuantity(event.target.value)}
              style={{
                accentColor: checker.color,
                background: `linear-gradient(to right, ${checker.color} ${span}%, #E3ECF7 ${span}%)`,
              }}
              className={`h-2 w-full cursor-pointer appearance-none rounded-full ${focusClass}`}
            />
            <span className="mt-2 flex justify-between text-[11px] font-medium text-ink/40 tabular-nums">
              <span>1</span>
              <span>{max}</span>
            </span>
          </label>
          {common.length ? (
            <div className="mt-5">
              <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ink/45 uppercase">Common quantities</h3>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {common.map((value) => {
                  const picked = count === value
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={picked}
                      onClick={() => setQuantity(String(value))}
                      className={`flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-xl border text-navy transition-colors ${focusClass} ${
                        picked ? '' : 'border-[#E3ECF7] bg-[#F8FBFF] hover:border-ink/15'
                      }`}
                      style={
                        picked
                          ? { borderColor: checker.color, backgroundColor: checker.tint, boxShadow: `0 0 0 1px ${checker.color}` }
                          : undefined
                      }
                    >
                      <span className="text-lg font-bold tabular-nums">{value}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
          </>
          ) : null}
          <div className="mt-5 flex items-end justify-between gap-3 rounded-xl px-3.5 py-3" style={{ backgroundColor: checker.tint }}>
            <p className="text-[12px] font-medium text-ink/55">
              {valid ? `${count} × ${money(checker.price, currency)}` : 'Choose a quantity'}
            </p>
            <p className="text-lg font-bold text-navy tabular-nums">{total == null ? '—' : money(total, currency)}</p>
          </div>
          <QuoteAction
            canSubmit={valid}
            payload={quotePayload({ service: 'results', checkerType: checker.id, quantity: valid ? count : '' })}
            signature={`${checker.id}:${valid ? quantity : ''}`}
            image={checker.image}
            imageAlt={checker.name}
          />
        </section>
      ) : (
        <p className="rounded-2xl border border-dashed border-[#D5E0EE] bg-white px-4 py-8 text-center text-sm text-ink/55">
          Choose a checker. The quantity for that voucher opens here.
        </p>
      )}
    </div>
  )
}
