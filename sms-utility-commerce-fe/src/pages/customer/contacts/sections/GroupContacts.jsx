import { Ban, CheckCircle2, CloudUpload, Eye, Pencil, Search, Trash2, UserPlus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ActionMenu, actionIconTrigger } from '../../../../components/ActionMenu'
import { SelectMenu } from '../../../../components/SelectMenu'
import { apiErrorMessage } from '../../../../features/auth/client'
import { contactInitials, contactName } from '../../../../features/contacts/contact'
import { useNotify } from '../../../../features/notifications/useNotify'
import { formatStamp } from '../../../../features/contacts/contactImport'
import { paths } from '../../../../routes/paths'
import { useGetContactsQuery } from '../../../../services/api/contacts/contactRecordsApi'
import { useDebouncedValue } from '../../../../utils/hooks/useDebouncedValue'
import { formatCount } from '../../dashboard/format'
import { PageBar } from './PageBar'
import { ContactFormDrawer } from './ContactFormDrawer'
import { ContactViewDrawer } from './ContactViewDrawer'
import { useContactActions } from './useContactActions.jsx'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const head =
  'sticky top-0 z-[1] border-b border-[#E1EAF6] bg-[#F3F7FD] px-2.5 py-2.5 text-left text-[11px] font-semibold tracking-wide whitespace-nowrap text-navy uppercase first:pl-4 last:pr-4 sm:px-3'
const cell = 'border-b border-[#E7EEF8] px-2.5 py-3.5 align-middle text-sm text-ink/75 first:pl-4 last:pr-4 sm:px-3'

const lengthOptions = [
  { id: '10', label: '10' },
  { id: '15', label: '15' },
  { id: '25', label: '25' },
  { id: '50', label: '50' },
  { id: '100', label: '100' },
]

const messageFilters = [
  { id: 'all', label: 'All', dnd: 'all' },
  { id: 'receive', label: 'Can receive', dnd: 'inactive' },
  { id: 'dnd', label: 'Do not disturb', dnd: 'active' },
]

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

export function GroupContacts({ group, onAdd }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState('all')
  const [viewId, setViewId] = useState(null)
  const [editing, setEditing] = useState(null)
  const notify = useNotify()
  const debounced = useDebouncedValue(query.trim().toLowerCase())
  const messageFilter = messageFilters.find((item) => item.id === messages) ?? messageFilters[0]

  const list = useGetContactsQuery({
    groupId: group.id,
    page,
    perPage: pageSize,
    search: debounced,
    dnd: messageFilter.dnd,
  })
  const { ask, dialog } = useContactActions({
    groupId: group.id,
    onDone(message) {
      setViewId(null)
      notify.success(message)
    },
  })

  const lastPage = list.data?.lastPage
  if (lastPage && page > lastPage) setPage(lastPage)

  const rows = useMemo(() => {
    const next = list.data?.rows ?? []
    return next.filter((contact) => {
      if (messages === 'receive' && contact.dnd) return false
      if (messages === 'dnd' && !contact.dnd) return false
      if (!debounced) return true
      const haystack = [contactName(contact), contact.phone, contact.email, contact.city, contact.region]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(debounced)
    })
  }, [debounced, list.data?.rows, messages])

  const total = list.data?.total ?? 0
  const filteredAway = Boolean(debounced) || messages !== 'all'
  const emptyGroup = !list.isLoading && !list.isError && total === 0 && !filteredAway

  function refine(setter) {
    return (value) => {
      setter(value)
      setPage(1)
    }
  }

  function clearFilters() {
    setQuery('')
    setMessages('all')
    setPage(1)
  }

  function saved(message) {
    setEditing(null)
    setPage(1)
    notify.success(message)
  }

  return (
    <div className="mt-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative min-w-0 flex-1 lg:max-w-md">
          <span className="sr-only">Search contacts</span>
          <Search
            size={15}
            strokeWidth={2}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/45"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => refine(setQuery)(event.target.value)}
            placeholder="Search by name, phone, or email…"
            className="h-10 w-full rounded-lg border border-ink/15 bg-white pr-9 pl-9 text-[13px] text-navy placeholder:text-ink/45 transition-colors focus-visible:border-blue/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
          />
          {query ? (
            <button
              type="button"
              onClick={() => refine(setQuery)('')}
              aria-label="Clear search"
              className={`absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-ink/45 transition-colors hover:bg-canvas hover:text-navy ${focusClass}`}
            >
              <X size={14} strokeWidth={2.2} aria-hidden="true" />
            </button>
          ) : null}
        </label>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by messages">
          {messageFilters.map((item) => {
            const selected = messages === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => refine(setMessages)(item.id)}
                className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold whitespace-nowrap transition-colors ${focusClass} ${
                  selected
                    ? 'border-blue bg-blue/[0.06] text-navy'
                    : 'border-ink/15 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-[13px] text-ink/60 tabular-nums" aria-live="polite">
          {formatCount(filteredAway ? rows.length : total)} {(filteredAway ? rows.length : total) === 1 ? 'contact' : 'contacts'}
          {filteredAway && list.data ? ` of ${formatCount(total)}` : ''}
        </p>
        {filteredAway ? (
          <button
            type="button"
            onClick={clearFilters}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-sm text-[13px] font-semibold text-blue transition-colors hover:text-blue/80 ${focusClass}`}
          >
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
            Clear filters
          </button>
        ) : null}
      </div>

      {list.isLoading ? (
        <div role="status" className="mt-4 space-y-2">
          <span className="sr-only">Loading contacts</span>
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className="skeleton block h-12 rounded-lg" />
          ))}
        </div>
      ) : null}

      {list.isError ? (
        <div role="alert" className="mt-4 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3">
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(list.error)}</p>
          <button type="button" onClick={list.refetch} className={`mt-2 cursor-pointer text-sm font-semibold text-navy ${focusClass}`}>
            Try again
          </button>
        </div>
      ) : null}

      {emptyGroup ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-ink/15 px-4 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#E3EFFD] text-blue">
            <CloudUpload size={22} aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-semibold text-navy">No contacts in this group yet</p>
          <p className="mt-1 max-w-sm text-sm leading-5 text-ink/55">
            Add one person, or upload an Excel file. We check the file before it is queued.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={onAdd}
              className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-green px-3.5 text-[13px] font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
            >
              <UserPlus size={15} aria-hidden="true" />
              Add contact
            </button>
            <Link
              to={paths.contactUpload(group.id)}
              className={`inline-flex h-9 items-center gap-2 rounded-lg border border-ink/15 px-3.5 text-[13px] font-semibold text-navy ${focusClass}`}
            >
              Upload a file
            </Link>
          </div>
        </div>
      ) : null}

      {!list.isLoading && !list.isError && !emptyGroup && rows.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-ink/15 bg-[#F8FBFF] px-4 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-[#E3EFFD] text-blue">
            <Search size={20} strokeWidth={2} aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-bold text-navy">No matching contacts</p>
          <p className="mt-1 max-w-sm text-sm text-ink/55">Try a different search or clear the messages filter.</p>
          {filteredAway ? (
            <button
              type="button"
              onClick={clearFilters}
              className={`mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : null}

      {rows.length ? (
        <>
          <div className="mt-4 hidden w-full min-w-0 overflow-x-auto rounded-xl border border-[#D8E7FA] bg-white shadow-[0_1px_2px_rgba(20,115,230,0.05),0_12px_28px_-18px_rgba(11,31,91,0.4)] md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className={head}>
                    Name
                  </th>
                  <th scope="col" className={head}>
                    Phone
                  </th>
                  <th scope="col" className={`${head} hidden lg:table-cell`}>
                    Email
                  </th>
                  <th scope="col" className={`${head} hidden xl:table-cell`}>
                    Location
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
              <tbody className="[&>tr:last-child>*]:border-b-0">
                {rows.map((contact) => {
                  const [tint, color] = toneFor(contact.id)
                  return (
                    <tr key={contact.id} className="hover:bg-canvas">
                      <th scope="row" className={`${cell} text-left font-semibold whitespace-nowrap text-navy`}>
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
                      <td className={`${cell} hidden max-w-48 truncate whitespace-nowrap lg:table-cell`}>
                        {contact.email || '—'}
                      </td>
                      <td className={`${cell} hidden whitespace-nowrap xl:table-cell`}>
                        {[contact.city, contact.region].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className={`${cell} whitespace-nowrap`}>
                        <MessagesBadge dnd={contact.dnd} />
                      </td>
                      <td className={`${cell} hidden whitespace-nowrap lg:table-cell`}>{formatStamp(contact.createdAt)}</td>
                      <td className={`${cell} whitespace-nowrap`}>
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

          <ul className="mt-4 divide-y divide-[#E7EEF8] rounded-xl border border-[#D8E7FA] md:hidden">
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

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-[13px] text-ink/60 tabular-nums" aria-live="polite">
                {total === 0
                  ? 'Showing 0 entries'
                  : `Showing ${formatCount((list.data?.page ?? page) * (list.data?.perPage ?? pageSize) - (list.data?.perPage ?? pageSize) + 1)}–${formatCount(Math.min((list.data?.page ?? page) * (list.data?.perPage ?? pageSize), total))} of ${formatCount(total)}`}
              </p>
              <label className="inline-flex items-center gap-2 text-[13px] text-ink/60">
                <span className="whitespace-nowrap">Show</span>
                <SelectMenu
                  label="Rows per page"
                  value={String(pageSize)}
                  options={lengthOptions}
                  onChange={(id) => {
                    setPageSize(Number(id))
                    setPage(1)
                  }}
                  compact
                  placement="top"
                  align="left"
                  className="w-[4.5rem]"
                  menuClassName="w-24"
                />
                <span>per page</span>
              </label>
            </div>
            <PageBar
              page={list.data?.page ?? page}
              lastPage={list.data?.lastPage ?? 1}
              total={total}
              perPage={list.data?.perPage ?? pageSize}
              onPage={setPage}
              label="Contact pages"
              className=""
              showSummary={false}
            />
          </div>
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
