import { ArrowRight, LoaderCircle, X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { surveyDialogMeta } from './actions'
import { SurveyStatus } from './SurveyStatus'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function SurveyActionDialog({ survey, action, busy = false, onConfirm, onClose }) {
  const meta = surveyDialogMeta(action)
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const destructive = meta?.tone === 'danger'

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
      className="confirm-dialog fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[min(26.5rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-[1.35rem] bg-white text-ink shadow-[0_1px_2px_rgba(16,33,61,0.08),0_28px_72px_-18px_rgba(11,31,91,0.58)]"
    >
      <div className="confirm-panel">
        <div className="relative px-6 pb-5 pt-7 text-center" style={{ background: meta.wash }}>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={busy}
            className={`absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full text-ink/45 hover:bg-white/80 hover:text-navy disabled:opacity-50 ${focusClass}`}
          >
            <X size={16} strokeWidth={2.3} aria-hidden="true" />
          </button>

          <span
            className="mx-auto flex size-14 items-center justify-center rounded-2xl shadow-[inset_0_0_0_1px_rgba(11,31,91,0.04)]"
            style={{ backgroundColor: meta.tint, color: meta.color }}
          >
            <Icon size={24} strokeWidth={2.2} aria-hidden="true" />
          </span>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: meta.color }}>
            {meta.label}
          </p>
          <h2 id={titleId} className="mt-1.5 text-[1.2rem] font-bold tracking-tight text-navy">
            {meta.title}
          </h2>
          <p id={descriptionId} className="mx-auto mt-2 max-w-[22rem] text-sm leading-6 text-ink/65">
            {meta.description}
          </p>

          <div className="mt-5 rounded-2xl border border-ink/[0.08] bg-white/90 px-4 py-3.5 shadow-[0_1px_2px_rgba(16,33,61,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/40">Survey</p>
            <p className="mt-1.5 truncate text-sm font-semibold leading-5 text-navy" title={survey.name}>
              {survey.name}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <SurveyStatus status={survey.status} />
              {meta.resultLabel ? (
                <>
                  <ArrowRight size={14} strokeWidth={2.2} className="text-ink/30" aria-hidden="true" />
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{ backgroundColor: meta.tint, color: meta.color }}
                  >
                    {meta.resultLabel}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          {destructive ? (
            <p className="mt-3 rounded-xl border border-[#F0C8CD] bg-[#FFF7F8] px-3 py-2 text-[12.5px] leading-5 text-[#9F1C26]">
              This action is permanent for the survey’s current run. Review carefully before continuing.
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-2 border-t border-ink/[0.06] bg-[#F8FAFC] px-6 py-4 sm:grid-cols-2">
          <button
            type="button"
            data-autofocus={destructive || undefined}
            onClick={onClose}
            disabled={busy}
            className={`inline-flex h-10 w-full items-center justify-center rounded-xl border border-ink/12 bg-white px-4 text-sm font-semibold text-navy hover:bg-canvas disabled:opacity-60 ${focusClass}`}
          >
            Not now
          </button>
          <button
            type="button"
            data-autofocus={destructive ? undefined : true}
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.22)] disabled:cursor-wait disabled:opacity-70 ${meta.buttonClass} ${focusClass}`}
          >
            {busy ? <LoaderCircle size={16} strokeWidth={2.3} className="animate-spin" aria-hidden="true" /> : <Icon size={16} strokeWidth={2.3} aria-hidden="true" />}
            {busy ? meta.busyLabel : meta.confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}
