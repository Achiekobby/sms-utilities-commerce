import { AtSign, Plus, Send, X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function NoSenderPrompt({ onClose, onAddSender, onProceed }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

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
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="confirm-dialog fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[min(26rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-2xl bg-white text-ink shadow-[0_1px_2px_rgba(16,33,61,0.08),0_24px_64px_-16px_rgba(11,31,91,0.55)]"
    >
      <div className="relative overflow-hidden px-6 pt-6 pb-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-blue/[0.08] blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-12 size-44 rounded-full bg-green/[0.07] blur-2xl"
        />

        <div className="relative flex items-start justify-between gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#E3EFFD] text-blue ring-1 ring-blue/15">
            <AtSign size={22} strokeWidth={2.1} aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink/50 transition-colors hover:bg-canvas hover:text-navy ${focusClass}`}
          >
            <X size={18} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>

        <h2 id={titleId} className="relative mt-4 text-lg font-bold tracking-tight text-navy">
          No sender ID yet
        </h2>
        <p id={descriptionId} className="relative mt-2 text-sm leading-6 text-ink/70">
          Recipients see your sender ID as who the SMS is from. Request one for approval, or continue and choose a
          sender later.
        </p>

        <div className="relative mt-6 flex flex-col gap-2">
          <button
            type="button"
            data-autofocus
            onClick={onAddSender}
            className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] ${focusClass}`}
          >
            <Plus size={17} strokeWidth={2.6} aria-hidden="true" />
            Add a sender ID
          </button>
          <button
            type="button"
            onClick={onProceed}
            className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white px-4 text-sm font-semibold text-navy transition-colors hover:border-blue/35 hover:bg-[#F7FBFF] ${focusClass}`}
          >
            <Send size={16} strokeWidth={2.2} aria-hidden="true" />
            Proceed anyway
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-semibold text-ink/60 transition-colors hover:bg-canvas hover:text-navy ${focusClass}`}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  )
}
