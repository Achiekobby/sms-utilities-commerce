import { useEffect, useId, useRef, useState } from 'react'
import { ConfirmDialog } from '../../../../components/ConfirmDialog'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const unavailable = 'Deactivating or deleting an account is not available from the workspace yet.'

export function DangerZone() {
  const [deactivate, setDeactivate] = useState(false)
  const [remove, setRemove] = useState(false)
  const [deactivateError, setDeactivateError] = useState('')

  return (
    <section className="rounded-xl border border-[#E0232E]/25 bg-white p-5 sm:p-6">
      <h2 className="text-base font-semibold text-[#9F1C26]">Danger zone</h2>
      <div className="mt-4 flex flex-col gap-4">
        <div className="flex flex-col gap-3 border-b border-ink/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-navy">Deactivate account</h3>
            <p className="mt-1 text-sm leading-6 text-ink/60">Temporarily disable your account.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeactivateError('')
              setDeactivate(true)
            }}
            className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
          >
            Deactivate account
          </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-navy">Delete account</h3>
            <p className="mt-1 text-sm leading-6 text-ink/60">Permanently delete your account and associated data.</p>
          </div>
          <button
            type="button"
            onClick={() => setRemove(true)}
            className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-[#C21F2D] px-3 text-sm font-semibold text-white hover:bg-[#9F1C26] ${focusClass}`}
          >
            Delete account
          </button>
        </div>
      </div>

      {deactivate ? (
        <ConfirmDialog
          title="Deactivate this account?"
          description="You would not be able to sign in until the account is turned back on."
          confirmLabel="Deactivate account"
          busyLabel="Deactivating"
          tone="warning"
          error={deactivateError}
          onConfirm={() => setDeactivateError(unavailable)}
          onClose={() => setDeactivate(false)}
        />
      ) : null}
      {remove ? <DeleteAccountDialog onClose={() => setRemove(false)} /> : null}
    </section>
  )
}

function DeleteAccountDialog({ onClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const inputId = useId()
  const [phrase, setPhrase] = useState('')
  const [error, setError] = useState('')
  const ready = phrase === 'DELETE'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="confirm-dialog fixed inset-0 m-auto h-fit w-[min(26rem,calc(100vw-2rem))] max-w-none rounded-2xl bg-white p-0 text-ink shadow-[0_24px_64px_-16px_rgba(11,31,91,0.55)]"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <form
        className="confirm-panel px-6 pt-6 pb-5"
        onSubmit={(event) => {
          event.preventDefault()
          if (!ready) return
          setError(unavailable)
        }}
      >
        <h2 id={titleId} className="text-lg font-bold tracking-tight text-navy">
          Delete this account?
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">
          This would permanently delete the account and its data. Type DELETE to continue.
        </p>
        <label htmlFor={inputId} className="mt-4 block text-sm font-medium text-navy">
          Confirmation
        </label>
        <input
          id={inputId}
          value={phrase}
          autoComplete="off"
          onChange={(event) => setPhrase(event.target.value)}
          className={`mt-1.5 h-11 w-full rounded-lg border border-ink/15 px-3 text-sm text-ink ${focusClass}`}
        />
        {error ? (
          <p role="alert" className="mt-3 rounded-lg bg-[#FDECEE] px-3 py-2 text-sm text-[#9F1C26]">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`inline-flex h-10 items-center justify-center rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!ready}
            className={`inline-flex h-10 items-center justify-center rounded-lg bg-[#C21F2D] px-4 text-sm font-semibold text-white hover:bg-[#9F1C26] disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
          >
            Delete account
          </button>
        </div>
      </form>
    </dialog>
  )
}
