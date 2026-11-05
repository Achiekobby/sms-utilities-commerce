import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import { senderIdError, senderIdMax } from '../rules'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function SenderFormDrawer({ mode = 'create', initialName = '', busy = false, serverField = '', serverError = '', onSubmit, onClose }) {
  const [name, setName] = useState(initialName)
  const [attempted, setAttempted] = useState(false)
  const [hideServer, setHideServer] = useState(false)
  const error = senderIdError(name)
  const visibleError = (!hideServer && serverField) || (attempted ? error : '')

  useEffect(() => {
    setHideServer(false)
  }, [serverField, serverError])
  const editing = mode === 'edit'

  function submit(event) {
    event.preventDefault()
    if (busy) return
    setAttempted(true)
    if (error) return
    onSubmit(name)
  }

  return (
    <Drawer label={editing ? 'Edit sender ID' : 'Create sender ID'} onClose={onClose} widthClass="w-[min(28rem,calc(100vw-1.5rem))]">
      <form onSubmit={submit} className="flex h-full flex-col bg-white" noValidate>
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-navy">{editing ? 'Edit sender ID' : 'Create sender ID'}</h2>
            <p className="mt-1 text-[13px] leading-5 text-ink/60">
              {editing
                ? 'Changing this sender ID will submit it for approval again.'
                : 'Sender IDs identify your business or service as the sender of an SMS.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink/55 hover:bg-canvas hover:text-navy disabled:opacity-50 ${focusClass}`}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 px-5 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="sender-id-name" className="text-sm font-semibold text-navy">
              Sender ID
            </label>
            <p className={`text-xs tabular-nums ${name.length > senderIdMax ? 'font-semibold text-[#9F1C26]' : 'text-ink/45'}`}>
              {name.length} / {senderIdMax}
            </p>
          </div>
          <input
            id="sender-id-name"
            name="name"
            value={name}
            autoComplete="off"
            spellCheck="false"
            data-autofocus
            aria-invalid={visibleError ? true : undefined}
            aria-describedby={visibleError ? 'sender-id-error' : undefined}
            onChange={(event) => {
              setName(event.target.value)
              setHideServer(true)
            }}
            placeholder="CelloBot"
            className="mt-1.5 h-11 w-full rounded-lg border border-ink/15 bg-white px-3 text-sm text-navy outline-none placeholder:text-ink/35 focus:border-blue"
          />
          {visibleError ? (
            <p id="sender-id-error" className="mt-1.5 text-[13px] text-[#9F1C26]">
              {visibleError}
            </p>
          ) : null}
          {serverError ? (
            <p role="alert" className="mt-3 rounded-lg bg-[#FDECEE] px-3 py-2 text-[13px] text-[#9F1C26]">
              {serverError}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-ink/10 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-navy hover:bg-canvas disabled:opacity-50 ${focusClass}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className={`inline-flex h-10 items-center rounded-lg bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] disabled:cursor-wait disabled:opacity-70 ${focusClass}`}
          >
            {busy ? 'Submitting...' : editing ? 'Update sender ID' : 'Create sender ID'}
          </button>
        </div>
      </form>
    </Drawer>
  )
}
