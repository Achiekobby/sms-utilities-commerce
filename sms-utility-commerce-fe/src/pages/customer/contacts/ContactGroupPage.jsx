import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { paths } from '../../../routes/paths'
import { useDisclosure } from '../../../utils/hooks/useDisclosure'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { GroupDetail } from './sections/GroupDetail'
import { GroupInsightsDrawer } from './sections/GroupInsightsDrawer'
import { useGroups } from './useGroups'

const backLink =
  'inline-flex items-center gap-1.5 rounded text-sm font-semibold text-blue hover:text-[#0056D6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue'

export function ContactGroupPage() {
  const { groupId } = useParams()
  const groups = useGroups()
  const group = groups.find((item) => item.id === groupId)
  const insights = useDisclosure()

  useDocumentTitle(group ? group.name : 'Group not found')

  // Opening a group from a scrolled list should start at the top of the new page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [groupId])

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

  return (
    <div>
      <GroupDetail group={group} onOpenInsights={insights.open} />

      {insights.isOpen ? <GroupInsightsDrawer group={group} onClose={insights.close} /> : null}
    </div>
  )
}
