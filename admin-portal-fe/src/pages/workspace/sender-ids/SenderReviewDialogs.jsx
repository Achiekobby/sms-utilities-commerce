import { useEffect, useId, useRef, useState } from 'react'
import { apiErrorMessage } from '../../../features/auth/session'
import { useNotify } from '../../../features/notifications/useNotify'
import { useApproveSenderIdMutation, useRejectSenderIdMutation } from '../../../services/api/sender-ids/senderIdsApi'
import { ConfirmDialog } from '../profile/settings/ConfirmDialog'
import { focusClass } from './ui'

export function SenderReviewDialogs({ record, mode, onClose }) {
  const notify = useNotify()
  const [approveSender, { isLoading: approving }] = useApproveSenderIdMutation()
  const [rejectSender, { isLoading: rejecting }] = useRejectSenderIdMutation()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const reasonId = useId()
  const titleId = useId()
  const dialogRef = useRef(null)
  const busy = approving || rejecting

  useEffect(() => {
    if (mode !== 'reject') return undefined
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return undefined
  }, [mode])

  async function confirmApprove() {
    try {
      const result = await approveSender(record.id).unwrap()
      notify.success(result?.message || 'Sender ID approved.')
      onClose()
    } catch (failure) {
      const message = apiErrorMessage(failure)
      setError(message)
      notify.error(message)
    }
  }

  async function confirmReject(event) {
    event.preventDefault()
    const rejectionReason = reason.trim()
    if (!rejectionReason) {
      setError('Enter a reason for rejecting this sender ID.')
      return
    }
    try {
      const result = await rejectSender({ id: record.id, rejectionReason }).unwrap()
      notify.success(result?.message || 'Sender ID rejected.')
      onClose()
    } catch (failure) {
      const message = apiErrorMessage(failure)
      setError(message)
      notify.error(message)
    }
  }

  if (mode === 'approve') {
    return (
      <ConfirmDialog
        title={`Approve ${record.name}?`}
        description="Clients will be able to send with this sender ID."
        confirmLabel="Approve sender ID"
        tone="caution"
        error={error}
        busy={approving}
        onConfirm={confirmApprove}
        onClose={() => {
          if (busy) return
          onClose()
        }}
      />
    )
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        if (busy) event.preventDefault()
      }}
      onClose={() => {
        if (busy) return
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose()
      }}
      className="confirm-dialog fixed inset-0 m-auto h-fit w-[min(26rem,calc(100vw-2rem))] max-w-none rounded-2xl bg-white text-ink shadow-[0_24px_64px_-16px_rgba(11,31,91,0.55)]"
    >
      <form onSubmit={confirmReject} className="confirm-panel px-6 pt-6 pb-5">
        <h2 id={titleId} className="text-lg font-bold tracking-tight text-navy">
          Reject {record.name}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">The client will see this reason with the rejected request.</p>
        <label htmlFor={reasonId} className="mt-4 mb-2 block text-sm font-semibold text-navy">
          Rejection reason
        </label>
        <textarea
          id={reasonId}
          value={reason}
          maxLength={500}
          rows={4}
          required
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            setReason(event.target.value)
            setError('')
          }}
          className={`w-full resize-y rounded-xl border border-ink/10 px-3 py-2.5 text-sm text-ink outline-none focus:border-[#E0232E] ${focusClass}`}
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
            disabled={busy}
            className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-ink/15 bg-white px-4 text-sm font-semibold text-navy hover:bg-canvas disabled:cursor-not-allowed disabled:opacity-50 ${focusClass}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy || undefined}
            className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-lg bg-[#C21F2D] px-4 text-sm font-semibold text-white hover:bg-[#9F1C26] disabled:cursor-wait disabled:opacity-70 ${focusClass}`}
          >
            {busy ? 'Updating' : 'Reject sender ID'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
