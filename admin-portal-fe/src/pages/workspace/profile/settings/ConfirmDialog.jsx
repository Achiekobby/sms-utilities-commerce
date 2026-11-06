import { useEffect, useId, useRef } from 'react'
import { focusClass } from './ui'

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  tone = 'caution',
  error = '',
  busy = false,
  onConfirm,
  onClose,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const danger = tone === 'danger' || tone === 'warning'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={onClose}
      onCancel={(event) => {
        if (busy) event.preventDefault()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="confirm-dialog fixed inset-0 m-auto h-fit w-[min(26rem,calc(100vw-2rem))] max-w-none rounded-2xl bg-white text-ink shadow-[0_24px_64px_-16px_rgba(11,31,91,0.55)]"
    >
      <div className="confirm-panel px-6 pt-6 pb-5">
        <h2 id={titleId} className="text-lg font-bold tracking-tight text-navy">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-ink/70">
          {description}
        </p>
        {error ? (
          <p role="alert" className="mt-3 rounded-lg bg-[#FDECEE] px-3 py-2 text-sm text-[#9F1C26]">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy || undefined}
            className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-lg px-4 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70 ${focusClass} ${
              danger ? 'bg-[#C21F2D] hover:bg-[#9F1C26]' : 'bg-navy hover:bg-[#0a3268]'
            }`}
          >
            {busy ? 'Updating' : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
