import { Check, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { subscriptionStatuses } from '../../../features/subscriptions/subscriptionModel'
import { focusClass } from './ui'

export function SubscriptionFilterDrawer({ status, clientId, onApply, onClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const clientFieldId = useId()
  const [draftStatus, setDraftStatus] = useState(status)
  const [draftClient, setDraftClient] = useState(clientId)
  const [clientError, setClientError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  function apply() {
    const nextClient = draftClient.trim()
    if (nextClient && !/^\d+$/.test(nextClient)) {
      setClientError('Enter the client’s numeric ID.')
      return
    }
    onApply({ status: draftStatus, clientId: nextClient })
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="drawer-right fixed inset-y-0 right-0 left-auto z-50 m-0 flex h-dvh max-h-none w-[min(24rem,100vw)] max-w-none flex-col rounded-none border-0 bg-white p-0 text-ink shadow-[-24px_0_64px_-24px_rgba(11,31,91,0.45)] backdrop:bg-navy/40"
    >
      <header className="flex items-start justify-between gap-4 border-b border-ink/[0.06] px-5 py-4">
        <div>
          <h2 id={titleId} className="text-lg font-bold tracking-tight text-navy">
            Filters
          </h2>
          <p className="mt-1 text-sm text-ink/55">Status and the client these subscriptions belong to.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink/50 hover:bg-ink/[0.04] hover:text-navy ${focusClass}`}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
        <fieldset>
          <legend className="text-sm font-semibold text-navy">Status</legend>
          <div className="mt-2 grid gap-2">
            {subscriptionStatuses.map((option) => {
              const selected = draftStatus === option.value
              return (
                <label
                  key={option.label}
                  onMouseDown={(event) => event.preventDefault()}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                    selected ? 'border-green bg-[#E7F8F0] font-semibold text-navy' : 'border-ink/10 bg-white font-medium text-ink/70 hover:border-green/40'
                  }`}
                >
                  <span>{option.label}</span>
                  <input
                    type="radio"
                    name="subscription-status"
                    value={option.value}
                    checked={selected}
                    onChange={() => setDraftStatus(option.value)}
                    className="sr-only outline-none"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                      selected ? 'border-green bg-green text-white' : 'border-ink/15 text-transparent'
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor={clientFieldId} className="text-sm font-semibold text-navy">
            Client ID
          </label>
          <input
            id={clientFieldId}
            inputMode="numeric"
            value={draftClient}
            placeholder="Any client"
            aria-invalid={clientError ? true : undefined}
            onChange={(event) => {
              setDraftClient(event.target.value)
              setClientError('')
            }}
            className={`mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-green ${focusClass} ${
              clientError ? 'border-[#E0232E]' : 'border-ink/10'
            }`}
          />
          {clientError ? <p className="mt-1 text-xs text-[#9F1C26]">{clientError}</p> : null}
        </div>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-ink/[0.06] px-5 py-4">
        <button
          type="button"
          onClick={() => {
            setDraftStatus('')
            setDraftClient('')
            setClientError('')
          }}
          className={`inline-flex h-11 cursor-pointer items-center rounded-xl px-3 text-sm font-semibold text-ink/60 hover:text-navy ${focusClass}`}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={apply}
          className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-green px-5 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
        >
          Show subscriptions
        </button>
      </footer>
    </dialog>
  )
}
