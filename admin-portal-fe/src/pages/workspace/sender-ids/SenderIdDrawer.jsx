import { IdCard, UserRound, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/session'
import { usePermissions } from '../../../features/auth/usePermissions'
import { clientName, formatPhone, formatWhen, labelize } from '../../../features/clients/clientModel'
import { senderStatusTone } from '../../../features/sender-ids/senderModel'
import { paths } from '../../../routes/paths'
import { useGetSenderIdQuery } from '../../../services/api/sender-ids/senderIdsApi'
import { ClientAvatar } from '../clients/ClientAvatar'
import { focusClass } from './ui'
import { SenderReviewDialogs } from './SenderReviewDialogs'

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    wait: 'bg-[#FFF4DF] text-[#9A5B00]',
    bad: 'bg-[#FDECEE] text-[#9F1C26]',
    neutral: 'bg-[#F3F6FB] text-navy',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/[0.06] py-2.5 last:border-b-0">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-right text-sm font-medium break-words text-navy">{value}</dd>
    </div>
  )
}

export function SenderIdDrawer({ id, onClose }) {
  const access = usePermissions()
  const canOpenClient = access.hasPermission('client.manage')
  const canReview = access.hasPermission('sender_id.approve')
  const dialogRef = useRef(null)
  const titleId = useId()
  const [closing, setClosing] = useState(false)
  const [review, setReview] = useState(null)
  const { data, isLoading, isFetching, isError, error, refetch } = useGetSenderIdQuery(id, { skip: !id })
  const record = data?.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : null
  const waiting = !record && (isLoading || isFetching) && !isError
  const client = record?.client

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!closing) return undefined
    const timer = window.setTimeout(() => onCloseRef.current(), 240)
    return () => window.clearTimeout(timer)
  }, [closing])

  function requestClose() {
    if (closing || review) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onClose()
      return
    }
    setClosing(true)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        requestClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose()
      }}
      className={`drawer-right fixed inset-y-0 right-0 left-auto z-50 m-0 flex h-dvh max-h-none w-[min(26rem,100vw)] max-w-none flex-col rounded-none border-0 bg-white p-0 text-ink shadow-[-24px_0_64px_-24px_rgba(11,31,91,0.45)] backdrop:bg-navy/40 ${
        closing ? 'drawer-right-out' : ''
      }`}
    >
      <header className="flex items-start justify-between gap-4 border-b border-ink/[0.06] px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">Sender ID</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 id={titleId} className="truncate text-lg font-bold tracking-tight text-navy">
              {record?.name || 'Sender ID'}
            </h2>
            {record ? <Badge tone={senderStatusTone(record.status)}>{labelize(record.status) || 'Unknown'}</Badge> : null}
          </div>
        </div>
        <button
          type="button"
          onClick={requestClose}
          aria-label="Close sender ID"
          className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink/50 hover:bg-ink/[0.04] hover:text-navy ${focusClass}`}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
        {waiting ? (
          <div className="space-y-3" aria-hidden="true">
            <div className="skeleton h-5 w-40 rounded-md" />
            <div className="skeleton h-4 w-full rounded-md" />
            <div className="skeleton h-4 w-2/3 rounded-md" />
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-xl border border-[#E0232E]/20 bg-[#FDECEE] px-4 py-4" role="alert">
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
            <button
              type="button"
              onClick={refetch}
              className={`mt-3 inline-flex h-9 cursor-pointer items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white ${focusClass}`}
            >
              Try again
            </button>
          </div>
        ) : null}

        {!waiting && !isError && !record ? <p className="text-sm text-ink/60">This sender ID could not be found.</p> : null}

        {record ? (
          <div className="space-y-6">
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-navy">
                <IdCard size={16} className="text-blue" aria-hidden="true" />
                Request
              </h3>
              {record.rejection_reason ? (
                <p className="mt-3 rounded-xl bg-[#FDECEE] px-3 py-2 text-sm text-[#9F1C26]">{record.rejection_reason}</p>
              ) : null}
              <dl className="mt-2">
                <Row label="Requested" value={formatWhen(record.created_at)} />
                <Row label="Approved" value={formatWhen(record.approved_at)} />
                <Row label="Rejected" value={formatWhen(record.rejected_at)} />
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-navy">Client</h3>
              {client ? (
                <div className="mt-3 flex items-center gap-3">
                  <ClientAvatar client={client} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy">{clientName(client)}</p>
                    <p className="truncate text-xs text-ink/50">{labelize(client.account_type)}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink/55">Client {record.client_id} is not included on this record.</p>
              )}
              <dl className="mt-2">
                <Row label="Email" value={client?.email} />
                <Row label="Mobile" value={formatPhone(client?.phone_number)} />
                <Row label="Status" value={client ? labelize(client.status) : ''} />
                <Row label="Verification" value={client ? (client.is_verified ? 'Verified' : 'Unverified') : ''} />
              </dl>
              {client && canOpenClient ? (
                <Link
                  to={`${paths.clients}/${client.id}`}
                  className={`mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue ${focusClass}`}
                >
                  <UserRound size={15} aria-hidden="true" />
                  Open client
                </Link>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>

      {record && canReview ? (
        <footer className="flex gap-2 border-t border-ink/[0.06] px-5 py-4">
          {record.status === 'rejected' ? null : (
            <button
              type="button"
              onClick={() => setReview('reject')}
              className={`inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-[#E0232E]/30 text-sm font-semibold text-[#9F1C26] hover:bg-[#FDECEE] ${focusClass}`}
            >
              Reject
            </button>
          )}
          {record.status === 'approved' ? null : (
            <button
              type="button"
              onClick={() => setReview('approve')}
              className={`inline-flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl bg-green text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
            >
              Approve
            </button>
          )}
        </footer>
      ) : null}

      {review && record ? <SenderReviewDialogs record={record} mode={review} onClose={() => setReview(null)} /> : null}
    </dialog>
  )
}
