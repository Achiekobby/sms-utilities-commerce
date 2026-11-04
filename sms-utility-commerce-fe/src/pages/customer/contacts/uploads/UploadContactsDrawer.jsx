import { Ban, CheckCircle2, Eye, FileSpreadsheet, Pencil, Trash2, Users, X } from 'lucide-react'
import { useState } from 'react'
import { ActionMenu, actionIconTrigger } from '../../../../components/ActionMenu'
import { Drawer } from '../../../../components/Drawer'
import { apiErrorMessage } from '../../../../features/auth/client'
import { contactInitials, contactName } from '../../../../features/contacts/contact'
import { formatStamp } from '../../../../features/contacts/contactImport'
import { useNotify } from '../../../../features/notifications/useNotify'
import { useGetUploadContactsQuery } from '../../../../services/api/contacts/contactRecordsApi'
import { formatCount } from '../../dashboard/format'
import { ContactFormDrawer } from '../sections/ContactFormDrawer'
import { ContactViewDrawer } from '../sections/ContactViewDrawer'
import { PageBar } from '../sections/PageBar'
import { useContactActions } from '../sections/useContactActions.jsx'
import { formatBytes } from '../upload/rules'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const head = 'bg-[#F3F7FD] px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap text-navy uppercase'
const cell = 'border-t border-[#E7EEF8] px-3 py-3 align-middle text-sm text-ink/75'

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

function MessagesBadge({ dnd, compact = false }) {
  const Icon = dnd ? Ban : CheckCircle2
  const label = dnd ? (compact ? 'DND' : 'Do not disturb') : 'Can receive'
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${
        dnd ? 'bg-[#FFEBCB] text-[#B45F06]' : 'bg-[#DDF3E6] text-[#0E7A38]'
      } ${compact ? 'text-[11px]' : ''}`}
    >
      <Icon size={compact ? 11 : 12} strokeWidth={2.3} aria-hidden="true" className="shrink-0" />
      {label}
    </span>
  )
}

function contactActions(contact, { onView, onEdit, onDnd, onRemove }) {
  const name = contactName(contact)
  return [
    {
      id: 'view',
      label: 'View contact',
      hint: 'Open full details',
      icon: Eye,
      color: '#0B63F6',
      tint: '#E3EFFD',
      onClick: () => onView(contact),
    },
    {
      id: 'edit',
      label: 'Edit contact',
      hint: 'Update name, phone, or email',
      icon: Pencil,
      color: '#0B63F6',
      tint: '#E3EFFD',
      onClick: () => onEdit(contact),
    },
    {
      id: 'dnd',
      label: contact.dnd ? 'Allow messages' : 'Do not disturb',
      hint: contact.dnd ? `${name} can receive messages again` : `Stop messages to ${name}`,
      icon: Ban,
      color: contact.dnd ? '#0E7A38' : '#B45F06',
      tint: contact.dnd ? '#DDF3E6' : '#FFEBCB',
      tone: contact.dnd ? 'default' : 'caution',
      onClick: () => onDnd(contact),
    },
    'separator',
    {
      id: 'remove',
      label: 'Remove contact',
      hint: 'Take this person out of the group',
      icon: Trash2,
      color: '#C21F2D',
      tint: '#FDECEE',
      tone: 'danger',
      onClick: () => onRemove(contact),
    },
  ]
}

function Actions({ contact, onView, onEdit, onDnd, onRemove }) {
  return (
    <div className="flex justify-end">
      <ActionMenu
        label={`Actions for ${contactName(contact)}`}
        iconOnly
        items={contactActions(contact, { onView, onEdit, onDnd, onRemove })}
        triggerClassName={actionIconTrigger}
      />
    </div>
  )
}

export function UploadContactsDrawer({ groupId, upload, onClose }) {
  const [page, setPage] = useState(1)
  const [viewId, setViewId] = useState(null)
  const [editing, setEditing] = useState(null)
  const notify = useNotify()
  const query = useGetUploadContactsQuery({ groupId, importId: upload.id, page })
  const { ask, dialog } = useContactActions({
    groupId,
    importId: upload.id,
    onDone(message) {
      setViewId(null)
      notify.success(message)
    },
  })

  const lastPage = query.data?.lastPage
  if (lastPage && page > lastPage) setPage(lastPage)

  const rows = query.data?.rows ?? []
  const total = query.data?.total ?? 0

  function saved(message) {
    setEditing(null)
    setPage(1)
    notify.success(message)
  }

  return (
    <>
      <Drawer label={`Contacts from ${upload.fileName}`} onClose={onClose} widthClass="w-[min(72rem,calc(100vw-1.5rem))]">
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F7EE] text-green">
                  <FileSpreadsheet size={18} strokeWidth={2.1} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-navy">{upload.fileName}</h2>
                  <p className="mt-0.5 text-[13px] text-ink/60">
                    {upload.fileSize ? formatBytes(upload.fileSize) : 'Excel file'}
                    {upload.inserted ? ` · ${formatCount(upload.inserted)} added` : ''}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink/55 transition-colors hover:bg-canvas hover:text-navy ${focusClass}`}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="inline-flex items-center gap-2 text-sm font-bold text-navy">
                <Users size={15} strokeWidth={2.2} aria-hidden="true" />
                Contacts
                {query.data ? <span className="font-medium text-ink/45 tabular-nums">{formatCount(total)}</span> : null}
              </h3>
            </div>

            {query.isLoading ? (
              <div role="status" className="mt-4 space-y-2">
                <span className="sr-only">Loading contacts</span>
                {Array.from({ length: 6 }, (_, index) => (
                  <span key={index} className="skeleton block h-12 rounded-lg" />
                ))}
              </div>
            ) : null}

            {query.isError ? (
              <div role="alert" className="mt-4 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3">
                <p className="text-sm text-[#9F1C26]">{apiErrorMessage(query.error)}</p>
                <button type="button" onClick={query.refetch} className={`mt-2 cursor-pointer text-sm font-semibold text-navy ${focusClass}`}>
                  Try again
                </button>
              </div>
            ) : null}

            {!query.isLoading && !query.isError && rows.length === 0 ? (
              <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-ink/15 px-4 py-12 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-[#E3EFFD] text-blue">
                  <Users size={22} aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-semibold text-navy">No contacts from this upload</p>
                <p className="mt-1 max-w-sm text-sm leading-5 text-ink/55">
                  Nothing was added from this file, or the contacts are no longer in the group.
                </p>
              </div>
            ) : null}

            {rows.length ? (
              <>
                <div className="mt-4 hidden overflow-x-auto rounded-xl border border-[#E1EAF6] sm:block">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr>
                        <th scope="col" className={head}>
                          Name
                        </th>
                        <th scope="col" className={head}>
                          Phone
                        </th>
                        <th scope="col" className={`${head} hidden md:table-cell`}>
                          Email
                        </th>
                        <th scope="col" className={head}>
                          Messages
                        </th>
                        <th scope="col" className={`${head} hidden lg:table-cell`}>
                          Added
                        </th>
                        <th scope="col" className={`${head} text-right`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((contact) => {
                        const [tint, color] = toneFor(contact.id)
                        return (
                          <tr key={contact.id} className="hover:bg-canvas">
                            <th scope="row" className={`${cell} text-left font-semibold text-navy`}>
                              <span className="flex items-center gap-2.5 whitespace-nowrap">
                                <span
                                  aria-hidden="true"
                                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                                  style={{ backgroundColor: tint, color }}
                                >
                                  {contactInitials(contact)}
                                </span>
                                {contactName(contact)}
                              </span>
                            </th>
                            <td className={`${cell} whitespace-nowrap tabular-nums`}>{contact.phone}</td>
                            <td className={`${cell} hidden max-w-40 truncate md:table-cell`}>{contact.email || '—'}</td>
                            <td className={`${cell} whitespace-nowrap`}>
                              <MessagesBadge dnd={contact.dnd} />
                            </td>
                            <td className={`${cell} hidden whitespace-nowrap lg:table-cell`}>{formatStamp(contact.createdAt)}</td>
                            <td className={cell}>
                              <Actions
                                contact={contact}
                                onView={(item) => setViewId(item.id)}
                                onEdit={setEditing}
                                onDnd={(item) => ask('dnd', item)}
                                onRemove={(item) => ask('remove', item)}
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <ul className="mt-4 divide-y divide-[#E7EEF8] rounded-xl border border-[#E1EAF6] sm:hidden">
                  {rows.map((contact) => (
                    <li key={contact.id} className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-navy">{contactName(contact)}</p>
                          <p className="mt-0.5 text-xs text-ink/60 tabular-nums">{contact.phone}</p>
                          {contact.email ? <p className="truncate text-xs text-ink/55">{contact.email}</p> : null}
                        </div>
                        <MessagesBadge dnd={contact.dnd} compact />
                      </div>
                      <div className="mt-2">
                        <Actions
                          contact={contact}
                          onView={(item) => setViewId(item.id)}
                          onEdit={setEditing}
                          onDnd={(item) => ask('dnd', item)}
                          onRemove={(item) => ask('remove', item)}
                        />
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
                  label="Upload contact pages"
                />
              </>
            ) : null}
          </div>
        </div>
      </Drawer>

      {viewId ? (
        <ContactViewDrawer
          groupId={groupId}
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
        <ContactFormDrawer key={editing.id} groupId={groupId} contact={editing} onClose={() => setEditing(null)} onSaved={saved} />
      ) : null}
      {dialog}
    </>
  )
}
