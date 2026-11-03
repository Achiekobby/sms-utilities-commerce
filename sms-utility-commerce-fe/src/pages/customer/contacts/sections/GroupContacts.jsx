import { Ban, CloudUpload, Eye, Pencil, Trash2, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { apiErrorMessage } from '../../../../features/auth/client'
import { contactInitials, contactName } from '../../../../features/contacts/contact'
import { formatStamp } from '../../../../features/contacts/contactImport'
import { paths } from '../../../../routes/paths'
import { useGetContactsQuery } from '../../../../services/api/contacts/contactRecordsApi'
import { PageBar } from './PageBar'
import { ContactFormDrawer } from './ContactFormDrawer'
import { ContactViewDrawer } from './ContactViewDrawer'
import { useContactActions } from './useContactActions.jsx'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const head = 'bg-[#F3F7FD] px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-navy'
const cell = 'border-t border-[#E7EEF8] px-3 py-3 align-middle text-sm text-ink/75'
const iconButton =
  'flex size-8 items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 hover:border-blue/40 hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue'

const tones = [
  ['#DCEBFD', '#0B63F6'],
  ['#FDE1EC', '#D6246E'],
  ['#E7DCFA', '#7B3FD6'],
  ['#DDF3E6', '#008859'],
  ['#FFE8D0', '#D9750B'],
]

function toneFor(id) {
  let value = 0
  const text = String(id)
  for (let index = 0; index < text.length; index += 1) value = (value * 31 + text.charCodeAt(index)) >>> 0
  return tones[value % tones.length]
}

function Actions({ contact, onView, onEdit, onDnd, onRemove }) {
  const name = contactName(contact)
  return (
    <div className="flex justify-end gap-1">
      <button type="button" className={iconButton} aria-label={`View ${name}`} onClick={() => onView(contact)}>
        <Eye size={14} aria-hidden="true" />
      </button>
      <button type="button" className={iconButton} aria-label={`Edit ${name}`} onClick={() => onEdit(contact)}>
        <Pencil size={14} aria-hidden="true" />
      </button>
      <button type="button" className={iconButton} aria-label={contact.dnd ? `Allow messages to ${name}` : `Stop messages to ${name}`} onClick={() => onDnd(contact)}>
        <Ban size={14} aria-hidden="true" />
      </button>
      <button type="button" className={iconButton} aria-label={`Remove ${name}`} onClick={() => onRemove(contact)}>
        <Trash2 size={14} aria-hidden="true" />
      </button>
    </div>
  )
}

export function GroupContacts({ group, onAdd, notice, onNotice }) {
  const [page, setPage] = useState(1)
  const [viewId, setViewId] = useState(null)
  const [editing, setEditing] = useState(null)
  const query = useGetContactsQuery({ groupId: group.id, page })
  const { ask, dialog } = useContactActions({
    groupId: group.id,
    onDone(message) {
      setViewId(null)
      onNotice(message)
    },
  })
  const lastPage = query.data?.lastPage
  if (lastPage && page > lastPage) setPage(lastPage)
  const rows = query.data?.rows ?? []
  const total = query.data?.total ?? 0

  function saved(message) {
    setEditing(null)
    setPage(1)
    onNotice(message)
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-navy">
          Contacts
          {query.data ? <span className="ml-2 font-medium text-ink/45 tabular-nums">{total.toLocaleString('en-GH')}</span> : null}
        </h3>
      </div>

      {notice ? (
        <p role="status" className="mt-3 rounded-xl border border-green/25 bg-[#F3FBF6] px-4 py-3 text-sm text-[#0E6B3C]">
          {notice}
        </p>
      ) : null}

      {query.isLoading ? (
        <div role="status" className="mt-3 space-y-2">
          <span className="sr-only">Loading contacts</span>
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className="skeleton block h-12 rounded-lg" />
          ))}
        </div>
      ) : null}

      {query.isError ? (
        <div role="alert" className="mt-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3">
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(query.error)}</p>
          <button type="button" onClick={query.refetch} className={`mt-2 text-sm font-semibold text-navy ${focusClass}`}>
            Try again
          </button>
        </div>
      ) : null}

      {!query.isLoading && !query.isError && rows.length === 0 ? (
        <div className="mt-3 flex flex-col items-center rounded-xl border border-dashed border-ink/15 px-4 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#E3EFFD] text-blue">
            <CloudUpload size={22} aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-semibold text-navy">No contacts in this group yet</p>
          <p className="mt-1 max-w-sm text-sm leading-5 text-ink/55">Add one person, or upload an Excel file. We check the file before it is queued.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={onAdd} className={`inline-flex h-9 items-center gap-2 rounded-lg bg-green px-3.5 text-[13px] font-semibold text-white hover:bg-[#006B46] ${focusClass}`}>
              <UserPlus size={15} aria-hidden="true" />
              Add contact
            </button>
            <Link to={paths.contactUpload(group.id)} className={`inline-flex h-9 items-center gap-2 rounded-lg border border-ink/15 px-3.5 text-[13px] font-semibold text-navy ${focusClass}`}>
              Upload a file
            </Link>
          </div>
        </div>
      ) : null}

      {rows.length ? (
        <>
          <div className="mt-3 hidden overflow-x-auto rounded-xl border border-[#E1EAF6] md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className={head}>Name</th>
                  <th scope="col" className={head}>Phone</th>
                  <th scope="col" className={`${head} hidden lg:table-cell`}>Email</th>
                  <th scope="col" className={`${head} hidden xl:table-cell`}>Location</th>
                  <th scope="col" className={head}>Messages</th>
                  <th scope="col" className={`${head} hidden lg:table-cell`}>Added</th>
                  <th scope="col" className={`${head} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((contact) => {
                  const [tint, color] = toneFor(contact.id)
                  return (
                    <tr key={contact.id} className="hover:bg-canvas">
                      <th scope="row" className={`${cell} text-left font-semibold text-navy`}>
                        <span className="flex items-center gap-2.5 whitespace-nowrap">
                          <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: tint, color }}>
                            {contactInitials(contact)}
                          </span>
                          {contactName(contact)}
                        </span>
                      </th>
                      <td className={`${cell} whitespace-nowrap tabular-nums`}>{contact.phone}</td>
                      <td className={`${cell} hidden max-w-48 truncate lg:table-cell`}>{contact.email || '—'}</td>
                      <td className={`${cell} hidden whitespace-nowrap xl:table-cell`}>{[contact.city, contact.region].filter(Boolean).join(', ') || '—'}</td>
                      <td className={cell}>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${contact.dnd ? 'bg-[#FFEBCB] text-[#B45F06]' : 'bg-[#DDF3E6] text-[#0E7A38]'}`}>
                          {contact.dnd ? 'Do not disturb' : 'Can receive'}
                        </span>
                      </td>
                      <td className={`${cell} hidden whitespace-nowrap lg:table-cell`}>{formatStamp(contact.createdAt)}</td>
                      <td className={cell}>
                        <Actions contact={contact} onView={(item) => setViewId(item.id)} onEdit={setEditing} onDnd={(item) => ask('dnd', item)} onRemove={(item) => ask('remove', item)} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <ul className="mt-3 divide-y divide-[#E7EEF8] rounded-xl border border-[#E1EAF6] md:hidden">
            {rows.map((contact) => (
              <li key={contact.id} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy">{contactName(contact)}</p>
                    <p className="mt-0.5 text-xs text-ink/60 tabular-nums">{contact.phone}</p>
                    {contact.email ? <p className="truncate text-xs text-ink/55">{contact.email}</p> : null}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${contact.dnd ? 'bg-[#FFEBCB] text-[#B45F06]' : 'bg-[#DDF3E6] text-[#0E7A38]'}`}>
                    {contact.dnd ? 'DND' : 'Can receive'}
                  </span>
                </div>
                <div className="mt-2">
                  <Actions contact={contact} onView={(item) => setViewId(item.id)} onEdit={setEditing} onDnd={(item) => ask('dnd', item)} onRemove={(item) => ask('remove', item)} />
                </div>
              </li>
            ))}
          </ul>

          <PageBar
            page={query.data?.page ?? page}
            lastPage={query.data?.lastPage ?? 1}
            total={total}
            perPage={query.data?.perPage ?? 15}
            onPage={setPage}
            label="Contact pages"
          />
        </>
      ) : null}

      {viewId ? (
        <ContactViewDrawer
          groupId={group.id}
          contactId={viewId}
          onClose={() => setViewId(null)}
          onEdit={(contact) => {
            setViewId(null)
            setEditing(contact)
          }}
          onDnd={(contact) => {
            setViewId(null)
            ask('dnd', contact)
          }}
          onRemove={(contact) => {
            setViewId(null)
            ask('remove', contact)
          }}
        />
      ) : null}
      {editing ? (
        <ContactFormDrawer key={editing.id} groupId={group.id} contact={editing} onClose={() => setEditing(null)} onSaved={saved} />
      ) : null}
      {dialog}
    </div>
  )
}
