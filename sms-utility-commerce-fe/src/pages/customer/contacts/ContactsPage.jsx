import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/client'
import { useGetContactStatsQuery } from '../../../services/api/contacts/contactsApi'
import { useDisclosure } from '../../../utils/hooks/useDisclosure'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { formatCount } from '../dashboard/format'
import { ContactStats } from './sections/ContactStats'
import { ContactsHeader } from './sections/ContactsHeader'
import { CreateGroupDrawer } from './sections/CreateGroupDrawer'
import { EditGroupDrawer } from './sections/EditGroupDrawer'
import { GroupsList } from './sections/GroupsList'
import { useGroupActions } from './useGroupActions.jsx'
import { useGroups, useTrashedGroups } from './useGroups'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function GroupViewTabs({ archived, archivedCount, onChange }) {
  function tabClass(selected) {
    return `rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${focusClass} ${
      selected ? 'bg-white text-navy shadow-[0_1px_2px_rgba(16,33,61,0.08)]' : 'text-ink/60 hover:text-navy'
    }`
  }

  return (
    <div role="tablist" aria-label="Group lists" className="mt-6 inline-flex rounded-lg bg-ink/[0.05] p-1">
      <button type="button" role="tab" id="groups-tab-active" aria-selected={!archived} aria-controls="groups-panel" onClick={() => onChange('active')} className={tabClass(!archived)}>
        Active
      </button>
      <button type="button" role="tab" id="groups-tab-archived" aria-selected={archived} aria-controls="groups-panel" onClick={() => onChange('archived')} className={tabClass(archived)}>
        Archived
        {archivedCount > 0 ? (
          <span className={`ml-1.5 rounded-full px-1.5 text-xs tabular-nums ${archived ? 'bg-navy/10' : 'bg-white'}`}>
            {formatCount(archivedCount)}
          </span>
        ) : null}
      </button>
    </div>
  )
}

export function ContactsPage() {
  useDocumentTitle('Contacts')
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const archivedView = params.get('view') === 'archived'
  const active = useGroups()
  const trashed = useTrashedGroups()
  const summary = useGetContactStatsQuery()
  const source = archivedView ? trashed : active
  const create = useDisclosure()
  const [editing, setEditing] = useState(null)
  const [notice, setNotice] = useState(undefined)
  const routed = typeof location.state?.notice === 'string' ? { message: location.state.notice, type: location.state.type ?? '' } : null
  const currentNotice = notice === undefined ? routed : notice
  const { ask, dialog } = useGroupActions({
    onSuccess(type, message) {
      setNotice({ type, message })
    },
  })
  const waiting = !source.isError && source.groups.length === 0 && (source.isLoading || source.isFetching)

  function show(view) {
    setParams(view === 'archived' ? { view: 'archived' } : {}, { replace: true })
  }

  function dismissNotice() {
    setNotice(null)
    if (location.state?.notice) {
      navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
    }
  }

  return (
    <div>
      <ContactsHeader onCreateGroup={create.open} />
      <GroupViewTabs archived={archivedView} archivedCount={trashed.groups.length} onChange={show} />

      {currentNotice?.message ? (
        <div
          role="status"
          className="mt-4 flex flex-col gap-3 rounded-xl border border-green/25 bg-[#F3FBF6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-[#0E6B3C]">{currentNotice.message}</p>
          <div className="flex shrink-0 items-center gap-2">
            {currentNotice.type === 'archive' && !archivedView ? (
              <button type="button" onClick={() => show('archived')} className={`text-sm font-semibold text-navy ${focusClass}`}>
                View archived
              </button>
            ) : null}
            {currentNotice.type === 'restore' && archivedView ? (
              <button type="button" onClick={() => show('active')} className={`text-sm font-semibold text-navy ${focusClass}`}>
                View active groups
              </button>
            ) : null}
            <button type="button" onClick={dismissNotice} className={`text-sm font-semibold text-ink/55 hover:text-navy ${focusClass}`}>
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {archivedView ? null : (
        <ContactStats stats={summary.data ?? null} failed={summary.isError} onRetry={summary.refetch} />
      )}

      {source.isError ? (
        <div
          role="alert"
          className="mt-6 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(source.error)}</p>
          <button
            type="button"
            onClick={source.refetch}
            className={`inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-white px-3 text-sm font-semibold text-navy ring-1 ring-[#E0232E]/20 hover:bg-canvas ${focusClass}`}
          >
            Try again
          </button>
        </div>
      ) : null}

      {source.isError && source.groups.length === 0 ? null : (
        <div role="tabpanel" id="groups-panel" aria-labelledby={archivedView ? 'groups-tab-archived' : 'groups-tab-active'}>
          <GroupsList
            groups={source.groups}
            loading={waiting}
            archived={archivedView}
            onEdit={setEditing}
            onArchive={(group) => ask('archive', group)}
            onRestore={(group) => ask('restore', group)}
            onDiscard={(group) => ask('discard', group)}
          />
        </div>
      )}

      {create.isOpen ? <CreateGroupDrawer groups={active.groups} onClose={create.close} /> : null}
      {editing ? (
        <EditGroupDrawer key={editing.id} group={editing} groups={active.groups} onClose={() => setEditing(null)} />
      ) : null}
      {dialog}
    </div>
  )
}
