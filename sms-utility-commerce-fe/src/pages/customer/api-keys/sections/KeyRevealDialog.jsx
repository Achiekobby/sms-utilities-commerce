import { Check, Copy, KeyRound, ShieldAlert } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { useCopyToClipboard } from '../../../../utils/hooks/useCopyToClipboard'
import { ApiKeyField } from './ApiKeyField'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function KeyRevealDialog({ token, onClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const { copied, copy } = useCopyToClipboard()

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
      className="confirm-dialog fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[min(34rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-2xl bg-white text-ink shadow-[0_1px_2px_rgba(16,33,61,0.08),0_24px_64px_-16px_rgba(11,31,91,0.55)]"
    >
      <div className="confirm-panel px-6 pt-6 pb-5">
        <span className="flex size-11 items-center justify-center rounded-full bg-[#DDF3E6] text-green">
          <KeyRound size={20} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <h2 id={titleId} className="mt-4 text-lg font-bold tracking-tight text-navy">
          New API key
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-ink/70">
          Copy this key now. You will not be able to view it again.
        </p>

        <ApiKeyField
          value={token}
          label=""
          allowCopy
          defaultVisible
          hint=""
          className="mt-4"
        />

        <div
          role="status"
          className="mt-3 flex items-start gap-2 rounded-xl border border-[#F0D7A8] bg-[#FFF8EE] px-3 py-2.5 text-[13px] leading-5 text-[#8A4B08]"
        >
          <ShieldAlert size={16} strokeWidth={2.2} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span>Store this key somewhere safe. Closing this dialog clears it from the page.</span>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex h-10 items-center justify-center rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
          >
            I&apos;ve saved my key
          </button>
          <button
            type="button"
            data-autofocus
            onClick={() => copy(token)}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] hover:bg-[#006B46] ${focusClass}`}
          >
            {copied ? <Check size={16} strokeWidth={2.3} aria-hidden="true" /> : <Copy size={16} strokeWidth={2.2} aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy API Key'}
          </button>
        </div>
      </div>
    </dialog>
  )
}
