import { useEffect, useId, useRef } from 'react'
import { lifecycleActions } from '../actions'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function CampaignActionDialog({ campaignName, action, busy = false, onConfirm, onClose }) {
  const meta = lifecycleActions[action]
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    dialog.querySelector('[data-autofocus]')?.focus()
  }, [])

  if (!meta) return null
  const Icon = meta.icon

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy || undefined}
      onCancel={(event) => {
        if (busy) event.preventDefault()
      }}
      onClose={onClose}
      onClick={(event) => {
        if (busy) return
        if (event.target === event.currentTarget) onClose()
      }}
      className="confirm-dialog fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-2xl bg-white text-ink shadow-[0_1px_2px_rgba(16,33,61,0.08),0_24px_64px_-16px_rgba(11,31,91,0.55)]"
    >
      <div className="px-6 pt-6 pb-5">
        <span className="flex size-12 items-center justify-center rounded-2xl" style={{ backgroundColor: meta.tint, color: meta.color }}>
          <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <h2 id={titleId} className="mt-4 text-lg font-bold tracking-tight text-navy">
          {meta.confirmTitle}
        </h2>
        <p className="mt-2 truncate text-sm font-semibold text-navy">{campaignName}</p>
        <p id={descriptionId} className="mt-1 text-sm leading-6 text-ink/70">
          {meta.confirmDescription}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`inline-flex h-10 items-center justify-center rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-canvas disabled:opacity-60 ${focusClass}`}
          >
            Not now
          </button>
          <button
            type="button"
            data-autofocus
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] disabled:cursor-wait disabled:opacity-70 ${meta.buttonClass} ${focusClass}`}
          >
            {busy ? meta.busyLabel : meta.confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
