import { Loader2, ShieldCheck, Wallet } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * Blocking modal shown while a top-up / checkout request is prepared and
 * the browser is about to leave for the payment provider.
 * Portaled to document.body so it works above drawers and other dialogs.
 */
export function PaymentRedirectModal({ open, amountLabel = '', stage = 'preparing' }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const redirecting = stage === 'redirecting'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined

    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()

    return undefined
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy="true"
      onCancel={(event) => event.preventDefault()}
      className="confirm-dialog fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[min(24rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-2xl border-0 bg-transparent p-0 text-ink shadow-none"
    >
      <div className="confirm-panel overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(16,33,61,0.08),0_28px_72px_-18px_rgba(11,31,91,0.58)]">
        <div className="relative overflow-hidden bg-[linear-gradient(160deg,#F3FBF7_0%,#FFFFFF_42%,#F4F8FD_100%)] px-6 pt-8 pb-7 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 left-1/2 size-40 -translate-x-1/2 rounded-full bg-green/15 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -bottom-12 size-32 rounded-full bg-blue/10 blur-2xl"
          />

          <div className="relative mx-auto flex size-16 items-center justify-center">
            <span className="absolute inset-0 rounded-full border-2 border-green/20" />
            <span className="absolute inset-1 animate-ping rounded-full border border-green/25 motion-reduce:animate-none" />
            <span className="relative flex size-12 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_-12px_rgba(0,136,89,0.65)] ring-1 ring-green/15">
              {redirecting ? (
                <ShieldCheck size={22} strokeWidth={2.2} className="text-green" aria-hidden="true" />
              ) : (
                <Wallet size={22} strokeWidth={2.2} className="text-green" aria-hidden="true" />
              )}
            </span>
          </div>

          <h2 id={titleId} className="relative mt-5 text-lg font-bold tracking-tight text-navy">
            {redirecting ? 'Taking you to payment' : 'Preparing payment'}
          </h2>
          <p id={descriptionId} className="relative mx-auto mt-2 max-w-[18rem] text-sm leading-6 text-ink/65">
            {redirecting
              ? 'Your secure checkout is ready. This page will open the payment provider next.'
              : 'Hold on while we set up a secure checkout for this top-up.'}
          </p>

          {amountLabel ? (
            <div className="relative mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 text-sm shadow-[0_1px_2px_rgba(16,33,61,0.06)] ring-1 ring-ink/[0.06]">
              <span className="text-ink/50">Amount</span>
              <span className="font-bold text-navy tabular-nums">{amountLabel}</span>
            </div>
          ) : null}

          <div className="relative mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-navy">
            <Loader2
              size={16}
              strokeWidth={2.4}
              aria-hidden="true"
              className="animate-spin text-green motion-reduce:animate-none"
            />
            {redirecting ? 'Redirecting…' : 'Opening payment…'}
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  )
}
