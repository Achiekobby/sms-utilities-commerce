import { CheckCircle2, Loader2, MessageSquareText, Send } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { formatCount } from '../../dashboard/format'

/**
 * Blocking modal while an SMS send is in flight, then briefly while
 * navigation back to Messages is prepared.
 */
export function MessageSendingModal({
  open,
  stage = 'sending',
  recipientCount = 0,
  unitCost = 0,
  kind = 'numbers',
}) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const opening = stage === 'opening'
  const bulk = kind === 'groups'

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
              {opening ? (
                <CheckCircle2 size={22} strokeWidth={2.2} className="text-green" aria-hidden="true" />
              ) : (
                <Send size={20} strokeWidth={2.2} className="text-green" aria-hidden="true" />
              )}
            </span>
          </div>

          <h2 id={titleId} className="relative mt-5 text-lg font-bold tracking-tight text-navy">
            {opening ? 'Returning to messages' : bulk ? 'Sending to groups' : 'Sending your message'}
          </h2>
          <p id={descriptionId} className="relative mx-auto mt-2 max-w-[18rem] text-sm leading-6 text-ink/65">
            {opening
              ? 'Your SMS is on its way. Taking you back to Messages next.'
              : bulk
                ? 'Hold on while we queue this send to your selected contact groups.'
                : 'Hold on while we deliver this SMS to the numbers you entered.'}
          </p>

          {(recipientCount > 0 || unitCost > 0) && !opening ? (
            <div className="relative mx-auto mt-5 flex flex-wrap items-center justify-center gap-2">
              {recipientCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-navy shadow-[0_1px_2px_rgba(16,33,61,0.06)] ring-1 ring-ink/[0.06]">
                  <MessageSquareText size={13} strokeWidth={2.2} aria-hidden="true" className="text-blue" />
                  {formatCount(recipientCount)} {recipientCount === 1 ? 'recipient' : 'recipients'}
                </span>
              ) : null}
              {unitCost > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-navy tabular-nums shadow-[0_1px_2px_rgba(16,33,61,0.06)] ring-1 ring-ink/[0.06]">
                  {formatCount(unitCost)} {unitCost === 1 ? 'unit' : 'units'}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="relative mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-navy">
            <Loader2
              size={16}
              strokeWidth={2.4}
              aria-hidden="true"
              className="animate-spin text-green motion-reduce:animate-none"
            />
            {opening ? 'Going to Messages…' : 'Sending…'}
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  )
}
