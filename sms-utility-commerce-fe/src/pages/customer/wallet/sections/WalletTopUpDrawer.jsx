import { Wallet, X } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import { apiErrorMessage } from '../../../../features/auth/client'
import { useNotify } from '../../../../features/notifications/useNotify'
import { formatWalletAmount, parseTopUpAmount } from '../../../../features/wallet/walletRecord'
import { useCreateWalletTopUpMutation } from '../../../../services/api/wallet/walletApi'

const PRESETS = [20, 50, 100, 200, 500, 1000]
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function WalletTopUpDrawer({ currency = '', onClose }) {
  const notify = useNotify()
  const [createTopUp, { isLoading }] = useCreateWalletTopUpMutation()
  const [amount, setAmount] = useState('50')
  const [attempted, setAttempted] = useState(false)
  const [formError, setFormError] = useState('')
  const code = currency || 'GHS'
  const parsed = parseTopUpAmount(amount)
  const amountError = parsed == null ? 'Enter an amount greater than zero.' : ''

  function onAmount(event) {
    const next = event.target.value.replace(/[^\d.]/g, '')
    const dot = next.indexOf('.')
    if (dot === -1) {
      setAmount(next)
      return
    }
    setAmount(`${next.slice(0, dot)}.${next.slice(dot + 1).replace(/\./g, '').slice(0, 2)}`)
  }

  async function submit(event) {
    event.preventDefault()
    if (isLoading) return
    setAttempted(true)
    setFormError('')
    if (amountError) return

    try {
      const result = await createTopUp({ amount: parsed }).unwrap()
      if (result.topUp?.nextUrl) {
        window.location.assign(result.topUp.nextUrl)
        return
      }
      notify.success(result.message)
      onClose()
    } catch (error) {
      setFormError(apiErrorMessage(error))
    }
  }

  return (
    <Drawer label="Top up wallet" onClose={onClose} widthClass="w-[min(32rem,calc(100vw-1.5rem))]">
      <form onSubmit={submit} className="flex h-full flex-col bg-white" noValidate>
        <header className="flex items-start justify-between gap-3 border-b border-[#E3ECF7] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E7F8F0] text-green">
              <Wallet size={20} strokeWidth={2.2} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-navy">Top up wallet</h2>
              <p className="mt-0.5 text-[13px] leading-5 text-ink/55">Choose an amount. Payment finishes on the checkout page.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
            className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink/55 hover:bg-canvas hover:text-navy disabled:opacity-50 ${focusClass}`}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <label className="block">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-navy">
              <Wallet size={15} strokeWidth={2.2} className="text-ink/45" aria-hidden="true" />
              Amount
            </span>
            <span className="mt-1 block text-[12px] leading-5 text-ink/45">
              Type the amount to add, or pick one of the common values below.
            </span>
            <span className="mt-2 flex h-16 items-center rounded-2xl border border-ink/10 bg-canvas px-4 focus-within:border-navy">
              <span className="text-sm font-semibold text-ink/40">{code}</span>
              <input
                inputMode="decimal"
                autoComplete="off"
                value={amount}
                onChange={onAmount}
                placeholder="0.00"
                aria-invalid={attempted && Boolean(amountError)}
                aria-describedby={attempted && amountError ? 'topup-amount-error' : undefined}
                data-autofocus
                className={`h-full min-w-0 flex-1 bg-transparent px-3 text-3xl font-bold tracking-tight text-navy tabular-nums outline-none placeholder:text-ink/25 ${focusClass}`}
              />
            </span>
            {attempted && amountError ? (
              <p id="topup-amount-error" className="mt-1.5 text-[13px] text-[#9F1C26]">
                {amountError}
              </p>
            ) : null}
          </label>

          <div className="mt-5">
            <h3 className="text-[11px] font-semibold tracking-[0.14em] text-ink/45 uppercase">Common amounts</h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {PRESETS.map((value) => {
                const selected = Number(amount) === value
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setAmount(String(value))}
                    className={`flex min-h-16 cursor-pointer flex-col items-center justify-center rounded-xl border px-2 text-center text-navy ${focusClass} ${
                      selected ? 'border-green bg-[#E7F8F0] shadow-[0_0_0_1px_#008859]' : 'border-[#E3ECF7] bg-[#F8FBFF] hover:border-ink/15'
                    }`}
                  >
                    <span className="text-[10px] font-semibold tracking-wide text-ink/40">{code}</span>
                    <span className="text-lg font-bold tabular-nums">{value}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {formError ? (
            <p role="alert" className="mt-4 rounded-xl bg-[#FDECEE] px-3.5 py-3 text-sm text-[#9F1C26]">
              {formError}
            </p>
          ) : null}
        </div>

        <footer className="border-t border-[#E3ECF7] bg-[#F7FAFD] px-5 py-4">
          <button
            type="submit"
            disabled={isLoading || parsed == null}
            className={`inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-navy text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
          >
            {isLoading ? 'Opening payment…' : parsed == null ? 'Top up' : `Top up ${formatWalletAmount(parsed, code)}`}
          </button>
        </footer>
      </form>
    </Drawer>
  )
}
