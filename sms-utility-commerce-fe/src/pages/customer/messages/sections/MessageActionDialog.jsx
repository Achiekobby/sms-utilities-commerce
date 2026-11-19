import { RotateCcw, Send } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { formatCount } from '../../dashboard/format'
import { charsPerSmsUnit, smsSendUnits, smsUnitCount } from '../model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const maxBodyLength = charsPerSmsUnit * 6

export function MessageActionDialog({
  type,
  recipientCount,
  draft,
  onDraftChange,
  busy = false,
  onConfirm,
  onClose,
}) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const reblast = type === 'reblast'
  const Icon = reblast ? RotateCcw : Send
  const characters = draft.length
  const unitsPerRecipient = smsUnitCount(draft)
  const totalUnits = smsSendUnits({ body: draft, recipients: recipientCount })

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
      className="confirm-dialog fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[min(36rem,calc(100vw-1.5rem))] max-w-none overflow-hidden rounded-2xl bg-white text-ink shadow-[0_1px_2px_rgba(16,33,61,0.08),0_28px_72px_-16px_rgba(11,31,91,0.55)]"
    >
      <div className="confirm-panel px-6 pt-6 pb-5 sm:px-7 sm:pt-7 sm:pb-6">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-[#DDF3E6] text-green">
          <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <h2 id={titleId} className="mt-4 text-xl font-bold tracking-tight text-navy">
          {reblast ? 'Reblast failed recipients?' : 'Resend this quick SMS?'}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-ink/70">
          {reblast
            ? `Queue another bulk send to ${formatCount(recipientCount)} failed recipient${recipientCount === 1 ? '' : 's'}.`
            : `Queue another quick SMS to the same ${formatCount(recipientCount)} number${recipientCount === 1 ? '' : 's'}.`}
        </p>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-navy">Message</span>
          <textarea
            data-autofocus
            value={draft}
            disabled={busy}
            maxLength={maxBodyLength}
            rows={8}
            onChange={(event) => onDraftChange(event.target.value)}
            className={`min-h-[12rem] w-full resize-y rounded-xl border border-ink/15 bg-white px-3.5 py-3 text-sm leading-6 text-navy outline-none transition-colors hover:border-blue/35 focus:border-blue focus:ring-4 focus:ring-blue/15 disabled:opacity-60 ${focusClass}`}
          />
        </label>

        <div className="mt-3 rounded-xl border border-[#D8E7FA] bg-[#F7FBFF] px-3.5 py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tabular-nums">
            <span className="font-semibold text-navy">{formatCount(characters)} characters</span>
            <span className="text-ink/30" aria-hidden="true">
              ·
            </span>
            <span className="font-semibold text-navy">
              {formatCount(unitsPerRecipient)} {unitsPerRecipient === 1 ? 'unit' : 'units'} / recipient
            </span>
            <span className="text-ink/30" aria-hidden="true">
              ·
            </span>
            <span className="font-semibold text-navy">
              {formatCount(totalUnits)} total {totalUnits === 1 ? 'unit' : 'units'}
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-4 text-ink/50">
            1 unit = {charsPerSmsUnit} characters. Longer text uses more units.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`inline-flex h-11 items-center justify-center rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-canvas disabled:opacity-60 ${focusClass}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy || !draft.trim()}
            className={`inline-flex h-11 items-center justify-center rounded-lg bg-green px-5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] hover:bg-[#006B46] disabled:cursor-wait disabled:opacity-70 ${focusClass}`}
          >
            {busy ? (reblast ? 'Queueing reblast…' : 'Queueing resend…') : reblast ? 'Reblast' : 'Resend'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
