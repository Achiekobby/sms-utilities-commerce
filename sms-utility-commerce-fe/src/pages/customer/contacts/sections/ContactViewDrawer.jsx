import { Ban, Pencil, Trash2, X } from 'lucide-react'
import { Drawer } from '../../../../components/Drawer'
import { apiErrorMessage } from '../../../../features/auth/client'
import { contactName } from '../../../../features/contacts/contact'
import { formatStamp } from '../../../../features/contacts/contactImport'
import { useGetContactQuery } from '../../../../services/api/contacts/contactRecordsApi'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function Fact({ label, value }) {
  return (
    <div className="border-b border-ink/10 py-3 last:border-b-0">
      <dt className="text-xs font-medium text-ink/50">{label}</dt>
      <dd className="mt-0.5 text-sm text-navy">{value || '—'}</dd>
    </div>
  )
}

export function ContactViewDrawer({ groupId, contactId, onClose, onEdit, onDnd, onRemove }) {
  const query = useGetContactQuery({ groupId, contactId })
  const contact = query.data

  return (
    <Drawer label="Contact" onClose={onClose} widthClass="w-[min(28rem,calc(100vw-1.5rem))]">
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-navy">{contact ? contactName(contact) : 'Contact'}</h2>
            <p className="mt-0.5 text-[13px] text-ink/60">{contact?.phone || 'Loading the contact'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className={`flex size-8 items-center justify-center rounded-lg text-ink/55 hover:bg-canvas hover:text-navy ${focusClass}`}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          {query.isLoading ? (
            <div role="status" className="space-y-3 py-4">
              <span className="sr-only">Loading contact</span>
              {Array.from({ length: 6 }, (_, index) => (
                <span key={index} className="skeleton block h-10 rounded-lg" />
              ))}
            </div>
          ) : null}
          {query.isError ? (
            <div role="alert" className="py-6">
              <p className="text-sm text-[#9F1C26]">{apiErrorMessage(query.error)}</p>
              <button type="button" onClick={query.refetch} className={`mt-3 text-sm font-semibold text-blue ${focusClass}`}>
                Try again
              </button>
            </div>
          ) : null}
          {contact ? (
            <dl>
              <Fact label="Phone" value={contact.phone} />
              <Fact label="Email" value={contact.email} />
              <Fact label="Gender" value={contact.gender ? contact.gender[0].toUpperCase() + contact.gender.slice(1) : ''} />
              <Fact label="Date of birth" value={contact.dateOfBirth} />
              <Fact label="Region" value={contact.region} />
              <Fact label="City" value={contact.city} />
              <Fact label="GPS address" value={contact.gpsAddress} />
              <Fact label="Address" value={contact.address} />
              <Fact label="Do not disturb" value={contact.dnd ? 'On' : 'Off'} />
              <Fact label="Added" value={formatStamp(contact.createdAt)} />
            </dl>
          ) : null}
        </div>

        {contact ? (
          <footer className="flex flex-wrap gap-2 border-t border-ink/10 px-5 py-4">
            <button type="button" onClick={() => onEdit(contact)} className={`inline-flex h-10 items-center gap-2 rounded-lg bg-green px-3 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}>
              <Pencil size={15} aria-hidden="true" />
              Edit
            </button>
            <button type="button" onClick={() => onDnd(contact)} className={`inline-flex h-10 items-center gap-2 rounded-lg border border-ink/15 px-3 text-sm font-semibold text-navy ${focusClass}`}>
              <Ban size={15} aria-hidden="true" />
              {contact.dnd ? 'Allow messages' : 'Do not disturb'}
            </button>
            <button type="button" onClick={() => onRemove(contact)} className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#C21F2D] hover:bg-[#FDECEE] ${focusClass}`}>
              <Trash2 size={15} aria-hidden="true" />
              Remove
            </button>
          </footer>
        ) : null}
      </div>
    </Drawer>
  )
}
