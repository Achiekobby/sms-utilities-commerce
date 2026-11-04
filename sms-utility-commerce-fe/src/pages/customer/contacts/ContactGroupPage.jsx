import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/client'
import { useNotify } from '../../../features/notifications/useNotify'
import { paths } from '../../../routes/paths'
import { useDisclosure } from '../../../utils/hooks/useDisclosure'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { ContactFormDrawer } from './sections/ContactFormDrawer'
import { EditGroupDrawer } from './sections/EditGroupDrawer'
import { GroupDetail } from './sections/GroupDetail'
import { GroupInsightsDrawer } from './sections/GroupInsightsDrawer'
import { useGroupActions } from './useGroupActions.jsx'
import { useContactGroup } from './useGroups'

const backLink =
  'inline-flex items-center gap-1.5 rounded text-sm font-semibold text-blue hover:text-[#0056D6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue'

const dangerButton =
  'inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-[#C21F2D] hover:bg-[#FDECEE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function ContactGroupPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { group, isLoading, isFetching, isError, error, refetch } = useContactGroup(groupId)
  const insights = useDisclosure()
  const edit = useDisclosure()
  const [adding, setAdding] = useState(false)
  const notify = useNotify()
  const { ask, dialog } = useGroupActions({
    onSuccess(type, message) {
      const view = type === 'restore' ? '' : '?view=archived'
      navigate(`${paths.contacts}${view}`, { state: { notice: message, type } })
    },
  })
  const waiting = !group && !isError && (isLoading || isFetching)

  useDocumentTitle(group ? group.name : waiting ? 'Contact group' : 'Group not found')

  // Opening a group from a scrolled list should start at the top of the new page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [groupId])

  if (waiting) {
    return (
      <div role="status" aria-live="polite" className="rounded-xl border border-[#D8E7FA] bg-white p-5">
        <span className="sr-only">Loading group</span>
        <div className="flex items-center gap-3">
          <span className="skeleton size-14 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <span className="skeleton block h-5 w-48 max-w-full rounded" />
            <span className="skeleton block h-3 w-64 max-w-full rounded" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!group && isError) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-bold text-navy">Could not load this group</h1>
        <p className="mt-2 text-sm text-ink/60">{apiErrorMessage(error)}</p>
        <button
          type="button"
          onClick={refetch}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-xl font-bold text-navy">Group not found</h1>
        <p className="mt-2 text-sm text-ink/60">
          This group may have been deleted, or the link is out of date.
        </p>
        <Link to={paths.contacts} className={`${backLink} mt-5`}>
          <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
          Back to Contact Groups
        </Link>
      </div>
    )
  }

  if (group.deletedAt) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-[#D8E7FA] bg-white px-6 py-10 text-center">
        <h1 className="text-xl font-bold text-navy">{group.name} is archived</h1>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          Contacts in this group were not removed. Restore it to use the group again, or remove it forever.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button type="button" onClick={() => ask('discard', group)} className={dangerButton}>
            Remove forever
          </button>
          <button
            type="button"
            onClick={() => ask('restore', group)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            <RotateCcw size={16} strokeWidth={2.2} aria-hidden="true" />
            Restore group
          </button>
        </div>
        <Link to={`${paths.contacts}?view=archived`} className={`${backLink} mt-5`}>
          <ArrowLeft size={16} strokeWidth={2.2} aria-hidden="true" />
          Back to archived groups
        </Link>
        {dialog}
      </div>
    )
  }

  return (
    <div>
      <GroupDetail
        group={group}
        onArchive={() => ask('archive', group)}
        onEdit={edit.open}
        onOpenInsights={insights.open}
        onAddContact={() => setAdding(true)}
      />

      {adding ? (
        <ContactFormDrawer
          groupId={group.id}
          onClose={() => setAdding(false)}
          onSaved={(message) => {
            setAdding(false)
            notify.success(message)
          }}
        />
      ) : null}
      {insights.isOpen ? <GroupInsightsDrawer group={group} onClose={insights.close} /> : null}
      {edit.isOpen ? <EditGroupDrawer key={group.id} group={group} onClose={edit.close} /> : null}
      {dialog}
    </div>
  )
}
