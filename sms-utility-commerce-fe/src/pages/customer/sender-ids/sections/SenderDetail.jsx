import { X } from 'lucide-react'
import { Drawer } from '../../../../components/Drawer'
import { apiErrorMessage } from '../../../../features/auth/client'
import { formatStamp } from '../../../../features/contacts/contactImport'
import { useGetSenderIdQuery } from '../../../../services/api/sender-ids/senderIdsApi'
import { SenderStatus } from './SenderStatus'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function Fact({ label, children }) {
  return (
    <div className="border-b border-ink/10 py-3 last:border-b-0">
      <dt className="text-xs font-medium text-ink/50">{label}</dt>
      <dd className="mt-0.5 text-sm text-navy">{children || '—'}</dd>
    </div>
  )
}

function when(value) {
  return formatStamp(value) || '—'
}

export function SenderDetail({ id, onClose, onEdit, onDelete }) {
  const query = useGetSenderIdQuery(id)
  const sender = query.data

  return (
    <Drawer label="Sender ID" onClose={onClose} widthClass="w-[min(28rem,calc(100vw-1.5rem))]">
      <div className="flex h-full min-h-0 flex-col bg-white">
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-navy">{sender?.name || 'Sender ID'}</h2>
            {sender ? (
              <div className="mt-2">
                <SenderStatus status={sender.status} />
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink/55 hover:bg-canvas hover:text-navy ${focusClass}`}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {query.isLoading ? (
            <div role="status" className="space-y-3">
              <span className="sr-only">Loading sender ID</span>
              {Array.from({ length: 4 }, (_, index) => (
                <span key={index} className="skeleton block h-10 rounded-lg" />
              ))}
            </div>
          ) : null}

          {query.isError ? (
            <div role="alert">
              <p className="text-sm text-[#9F1C26]">{apiErrorMessage(query.error)}</p>
              <button type="button" onClick={query.refetch} className={`mt-3 text-sm font-semibold text-blue ${focusClass}`}>
                Try again
              </button>
            </div>
          ) : null}

          {sender ? (
            <>
              {sender.status === 'rejected' ? (
                <section className="mb-4 rounded-lg border border-[#E0232E]/20 bg-[#FDECEE] px-3 py-3">
                  <h3 className="text-xs font-semibold text-[#9F1C26]">Rejection reason</h3>
                  <p className="mt-1 text-sm leading-6 text-[#9F1C26]">
                    {sender.rejectionReason || 'No rejection reason was provided.'}
                  </p>
                </section>
              ) : null}
              {sender.status === 'pending' ? <p className="mb-3 text-sm text-ink/60">Awaiting approval</p> : null}
              <dl>
                <Fact label="Sender ID">{sender.name}</Fact>
                <Fact label="Status">{sender.status ? <SenderStatus status={sender.status} /> : '—'}</Fact>
                <Fact label="Created">{when(sender.createdAt)}</Fact>
                <Fact label="Approved">{when(sender.approvedAt)}</Fact>
                <Fact label="Rejected">{when(sender.rejectedAt)}</Fact>
              </dl>
            </>
          ) : null}
        </div>

        {sender ? (
          <footer className="flex items-center justify-end gap-2 border-t border-ink/10 px-5 py-4">
            <button
              type="button"
              onClick={() => onDelete(sender)}
              className={`inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold text-[#C21F2D] hover:bg-[#FDECEE] ${focusClass}`}
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => onEdit(sender)}
              className={`inline-flex h-10 items-center rounded-lg border border-ink/15 px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
            >
              Edit
            </button>
          </footer>
        ) : null}
      </div>
    </Drawer>
  )
}
