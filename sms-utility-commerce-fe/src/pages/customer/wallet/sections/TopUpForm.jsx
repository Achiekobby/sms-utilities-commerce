import { ArrowRight, X } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectCurrentUser } from '../../../../features/auth/authSlice'
import { settleTopUp } from '../../../../features/wallet/settleTopUp'
import { getIdentity } from '../../../../components/workspace/identity'
import { formatUnits, minimumTopUpUnits, parseCediInput, sanitizeAmountInput, smsRateUnits, topUpPresets, unitsPerCedi } from '../money'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const primary = `inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] disabled:cursor-not-allowed disabled:bg-ink/20 ${focusClass}`

export function TopUpForm({ onDone, onCancel }) {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const identity = getIdentity(user)
  const [amountText, setAmountText] = useState(String(topUpPresets[1] / unitsPerCedi))
  const [attempted, setAttempted] = useState(false)

  const amount = parseCediInput(amountText)
  const amountError =
    amount == null ? 'Enter an amount.' : amount < minimumTopUpUnits ? `The minimum is ${formatUnits(minimumTopUpUnits)}.` : ''

  function submit(event) {
    event.preventDefault()
    setAttempted(true)
    if (amountError) return
    settleTopUp(dispatch, {
      amount,
      description: 'Wallet top-up',
    })
    onDone()
  }

  return (
    <form onSubmit={submit} className="flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="text-sm font-semibold text-navy">Amount</p>
        <p className="mt-1 text-sm leading-6 text-ink/60">
          Card and mobile money are chosen on the payment page. Hubtel and Paystack confirm the payment before this balance changes.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {topUpPresets.map((value) => {
            const selected = amount === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setAmountText(String(value / unitsPerCedi))}
                className={`h-14 rounded-xl border-2 text-base font-bold tabular-nums transition-colors ${focusClass} ${
                  selected ? 'border-green bg-mint/10 text-navy' : 'border-ink/12 text-navy hover:border-blue/40'
                }`}
              >
                {formatUnits(value)}
              </button>
            )
          })}
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-navy">Amount</span>
          <span className="mt-1.5 flex h-12 items-center rounded-lg border-2 border-ink/15 bg-white focus-within:border-blue">
            <span className="pl-3 text-sm font-semibold text-ink/45">GH₵</span>
            <input
              inputMode="decimal"
              value={amountText}
              onChange={(event) => setAmountText(sanitizeAmountInput(event.target.value))}
              placeholder="0.00"
              aria-label="Amount"
              className="h-full min-w-0 flex-1 bg-transparent px-2 text-base text-navy tabular-nums outline-none placeholder:text-ink/35"
            />
          </span>
        </label>
        {attempted && amountError ? <p className="mt-2 text-sm text-[#B8141F]">{amountError}</p> : null}

        <dl className="mt-6 rounded-xl bg-canvas px-4 py-3 text-sm">
          <div className="flex items-baseline justify-between gap-4 py-1.5">
            <dt className="text-ink/55">Added to wallet</dt>
            <dd className="font-bold text-navy tabular-nums">{amount == null ? '—' : formatUnits(amount)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-ink/10 py-1.5">
            <dt className="text-ink/55">Receipt for</dt>
            <dd className="text-right font-medium text-navy">
              {identity.person}
              <span className="mt-0.5 block text-xs font-normal text-ink/55">{user?.email}</span>
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-[13px] leading-5 text-ink/55">SMS from this balance is {formatUnits(smsRateUnits)} per segment.</p>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        {onCancel ? (
          <button type="button" onClick={onCancel} className={`inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}>
            <X size={16} strokeWidth={2.3} aria-hidden="true" />
            Cancel
          </button>
        ) : null}
        <button type="submit" className={primary}>
          Continue to payment
          <ArrowRight size={16} strokeWidth={2.3} aria-hidden="true" />
        </button>
      </div>
    </form>
  )
}
