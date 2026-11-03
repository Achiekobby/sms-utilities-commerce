import { Archive, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'

const tones = {
  caution: {
    icon: Archive,
    iconClass: 'bg-[#FFEBCB] text-[#B45F06]',
    buttonClass: 'bg-navy hover:bg-navy/90',
  },
  restore: {
    icon: RotateCcw,
    iconClass: 'bg-[#DDF3E6] text-green',
    buttonClass: 'bg-green hover:bg-[#006B46]',
  },
  danger: {
    icon: Trash2,
    iconClass: 'bg-[#FDECEE] text-[#C21F2D]',
    buttonClass: 'bg-[#C21F2D] hover:bg-[#9F1C26]',
  },
}

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

// A native modal dialog. Focus is trapped, Escape cancels, and the page behind is inert.
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  busyLabel,
  tone = 'caution',
  busy = false,
  error = '',
  focusConfirm = false,
  onConfirm,
  onClose,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const look = tones[tone] ?? tones.caution
  const Icon = look.icon

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    dialog.querySelector('[data-autofocus]')?.focus()
  }, [])

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
      className="confirm-dialog fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[min(26rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-2xl bg-white text-ink shadow-[0_1px_2px_rgba(16,33,61,0.08),0_24px_64px_-16px_rgba(11,31,91,0.55)]"
    >
      <div className="confirm-panel px-6 pt-6 pb-5">
        <span className={`flex size-11 items-center justify-center rounded-full ${look.iconClass}`}>
          <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <h2 id={titleId} className="mt-4 text-lg font-bold tracking-tight text-navy">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-ink/70">
          {description}
        </p>
        {error ? (
          <p role="alert" className="mt-3 rounded-lg bg-[#FDECEE] px-3 py-2 text-[13px] leading-5 text-[#9F1C26]">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            data-autofocus={focusConfirm ? undefined : true}
            onClick={onClose}
            disabled={busy}
            className={`inline-flex h-10 items-center justify-center rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-canvas disabled:opacity-60 ${focusClass}`}
          >
            Cancel
          </button>
          <button
            type="button"
            data-autofocus={focusConfirm ? true : undefined}
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] disabled:cursor-wait disabled:opacity-70 ${look.buttonClass} ${focusClass}`}
          >
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
