import { ArrowRight, X } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { PaymentRedirectModal } from '../../../../components/PaymentRedirectModal'
import { getIdentity } from '../../../../components/workspace/identity'
import { apiErrorMessage } from '../../../../features/auth/client'
import { selectCurrentUser } from '../../../../features/auth/authSlice'
import { useNotify } from '../../../../features/notifications/useNotify'
import { formatWalletAmount, parseTopUpAmount } from '../../../../features/wallet/walletRecord'
import { useCreateWalletTopUpMutation } from '../../../../services/api/wallet/walletApi'

const PRESETS = [20, 50, 100, 200, 500, 1000]
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const primary = `inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] disabled:cursor-not-allowed disabled:bg-ink/20 ${focusClass}`

function sanitizeAmount(raw) {
  const next = String(raw ?? '').replace(/[^\d.]/g, '')
  const dot = next.indexOf('.')
  if (dot === -1) return next
  return `${next.slice(0, dot)}.${next.slice(dot + 1).replace(/\./g, '').slice(0, 2)}`
}

export function TopUpForm({ currency = '', onDone, onCancel }) {
  const notify = useNotify()
  const user = useSelector(selectCurrentUser)
  const identity = getIdentity(user)
  const [createTopUp, { isLoading }] = useCreateWalletTopUpMutation()
  const [amountText, setAmountText] = useState('50')
  const [attempted, setAttempted] = useState(false)
  const [formError, setFormError] = useState('')
  const [paymentStage, setPaymentStage] = useState('')
  const code = currency || 'GHS'
  const parsed = parseTopUpAmount(amountText)
  const amountError = parsed == null ? 'Enter an amount greater than zero.' : ''
  const openingPayment = Boolean(paymentStage) || isLoading

  async function submit(event) {
    event.preventDefault()
    if (openingPayment) return
    setAttempted(true)
    setFormError('')
    if (amountError) return

    let stage = 'preparing'
    setPaymentStage(stage)
    try {
      const result = await createTopUp({ amount: parsed }).unwrap()
      if (result.topUp?.nextUrl) {
        stage = 'redirecting'
        setPaymentStage(stage)
        window.location.assign(result.topUp.nextUrl)
        return
      }
      setPaymentStage('')
      notify.success(result.message)
      onDone?.()
    } catch (error) {
      // Aborted in-flight work during redirect is not a real failure.
      if (stage === 'redirecting') return
      setPaymentStage('')
      setFormError(apiErrorMessage(error))
    }
  }

  return (
    <form onSubmit={submit} className="flex h-full flex-col" noValidate>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="text-sm font-semibold text-navy">Amount</p>
        <p className="mt-1 text-sm leading-6 text-ink/60">
          Card and mobile money are chosen on the payment page. Your wallet updates after the charge succeeds.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PRESETS.map((value) => {
            const selected = Number(amountText) === value
            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                onClick={() => setAmountText(String(value))}
                className={`h-14 rounded-xl border-2 text-base font-bold tabular-nums transition-colors ${focusClass} ${
                  selected ? 'border-green bg-mint/10 text-navy' : 'border-ink/12 text-navy hover:border-blue/40'
                }`}
              >
                {formatWalletAmount(value, code)}
              </button>
            )
          })}
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-navy">Amount</span>
          <span className="mt-1.5 flex h-12 items-center rounded-lg border-2 border-ink/15 bg-white focus-within:border-blue">
            <span className="pl-3 text-sm font-semibold text-ink/45">{code}</span>
            <input
              inputMode="decimal"
              autoComplete="off"
              value={amountText}
              onChange={(event) => setAmountText(sanitizeAmount(event.target.value))}
              placeholder="0.00"
              aria-label="Amount"
              aria-invalid={attempted && Boolean(amountError)}
              className="h-full min-w-0 flex-1 bg-transparent px-2 text-base text-navy tabular-nums outline-none placeholder:text-ink/35"
            />
          </span>
        </label>
        {attempted && amountError ? <p className="mt-2 text-sm text-[#B8141F]">{amountError}</p> : null}

        <dl className="mt-6 rounded-xl bg-canvas px-4 py-3 text-sm">
          <div className="flex items-baseline justify-between gap-4 py-1.5">
            <dt className="text-ink/55">Added to wallet</dt>
            <dd className="font-bold text-navy tabular-nums">
              {parsed == null ? '—' : formatWalletAmount(parsed, code)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-ink/10 py-1.5">
            <dt className="text-ink/55">Receipt for</dt>
            <dd className="text-right font-medium text-navy">
              {identity.person}
              <span className="mt-0.5 block text-xs font-normal text-ink/55">{user?.email}</span>
            </dd>
          </div>
        </dl>

        {formError ? (
          <p role="alert" className="mt-4 rounded-xl bg-[#FDECEE] px-3.5 py-3 text-sm text-[#9F1C26]">
            {formError}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={openingPayment}
            className={`inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-navy hover:bg-canvas disabled:opacity-50 ${focusClass}`}
          >
            <X size={16} strokeWidth={2.3} aria-hidden="true" />
            Cancel
          </button>
        ) : null}
        <button type="submit" disabled={openingPayment || parsed == null} className={primary}>
          {openingPayment ? 'Opening payment…' : 'Continue to payment'}
          {openingPayment ? null : <ArrowRight size={16} strokeWidth={2.3} aria-hidden="true" />}
        </button>
      </div>

      <PaymentRedirectModal
        open={openingPayment}
        stage={paymentStage || 'preparing'}
        amountLabel={parsed == null ? '' : formatWalletAmount(parsed, code)}
      />
    </form>
  )
}
