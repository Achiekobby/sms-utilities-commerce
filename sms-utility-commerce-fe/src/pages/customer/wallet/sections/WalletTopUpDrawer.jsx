import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import { apiErrorMessage } from '../../../../features/auth/client'
import { useNotify } from '../../../../features/notifications/useNotify'
import { useCreateWalletTopUpMutation } from '../../../../services/api/wallet/walletApi'
import { parseTopUpAmount, walletMethods, walletNetworks } from '../../../../features/wallet/walletRecord'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function WalletTopUpDrawer({ currency = '', onClose }) {
  const notify = useNotify()
  const [createTopUp, { isLoading }] = useCreateWalletTopUpMutation()
  const [amount, setAmount] = useState('')
  const [network, setNetwork] = useState(walletNetworks[0]?.id ?? '')
  const [attempted, setAttempted] = useState(false)
  const [formError, setFormError] = useState('')
  const method = walletMethods[0]
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
    if (amountError || !network || !method) return

    try {
      const result = await createTopUp({
        amount: parsed,
        network,
        method: method.id,
      }).unwrap()
      notify.success(result.message)
      if (result.topUp?.nextUrl) {
        window.location.assign(result.topUp.nextUrl)
        return
      }
      onClose()
    } catch (error) {
      setFormError(apiErrorMessage(error))
    }
  }

  return (
    <Drawer label="Top up wallet" onClose={onClose} widthClass="w-[min(28rem,calc(100vw-1.5rem))]">
      <form onSubmit={submit} className="flex h-full flex-col bg-white" noValidate>
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-navy">Top up wallet</h2>
            <p className="mt-1 text-[13px] leading-5 text-ink/60">Add funds with mobile money.</p>
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

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <label className="block">
            <span className="text-sm font-semibold text-navy">Amount</span>
            <span className="mt-1.5 flex h-11 items-center rounded-lg border border-ink/15 bg-white focus-within:border-blue">
              <span className="pl-3 text-sm font-medium text-ink/45">{currency || 'Amount'}</span>
              <input
                inputMode="decimal"
                autoComplete="off"
                value={amount}
                onChange={onAmount}
                placeholder="0.00"
                aria-invalid={attempted && Boolean(amountError)}
                aria-describedby={attempted && amountError ? 'topup-amount-error' : undefined}
                data-autofocus
                className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm text-navy tabular-nums outline-none placeholder:text-ink/35"
              />
            </span>
            {attempted && amountError ? (
              <p id="topup-amount-error" className="mt-1.5 text-[13px] text-[#9F1C26]">
                {amountError}
              </p>
            ) : null}
          </label>

          <fieldset>
            <legend className="text-sm font-semibold text-navy">Network</legend>
            <div className="mt-1.5 flex flex-col gap-2">
              {walletNetworks.map((option) => {
                const selected = network === option.id
                return (
                  <label key={option.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="wallet-network"
                      value={option.id}
                      checked={selected}
                      onChange={() => setNetwork(option.id)}
                      className="peer sr-only"
                    />
                    <span
                      className={`flex min-h-12 items-center gap-3 rounded-lg border px-3 py-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue ${
                        selected ? 'border-navy bg-canvas' : 'border-ink/15 bg-white hover:border-ink/30'
                      }`}
                    >
                      <span className="flex h-8 w-14 shrink-0 items-center">
                        <img src={option.image} alt="" className="h-8 w-auto max-w-14 object-contain object-left" />
                      </span>
                      <span className={`min-w-0 flex-1 text-sm ${selected ? 'font-semibold text-navy' : 'font-medium text-ink/75'}`}>
                        {option.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                          selected ? 'border-navy bg-navy text-white' : 'border-ink/20 bg-white'
                        }`}
                      >
                        {selected ? <Check size={11} strokeWidth={3} /> : null}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div>
            <span className="text-sm font-semibold text-navy">Payment method</span>
            <p className="mt-1.5 flex h-11 items-center rounded-lg border border-ink/10 bg-canvas px-3 text-sm text-navy">
              {method?.label}
            </p>
          </div>

          {formError ? (
            <p role="alert" className="rounded-lg bg-[#FDECEE] px-3 py-2 text-[13px] text-[#9F1C26]">
              {formError}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-ink/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-navy hover:bg-canvas disabled:opacity-50 ${focusClass}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex h-10 items-center rounded-lg bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-wait disabled:opacity-70 ${focusClass}`}
          >
            {isLoading ? 'Processing...' : 'Top up wallet'}
          </button>
        </div>
      </form>
    </Drawer>
  )
}
