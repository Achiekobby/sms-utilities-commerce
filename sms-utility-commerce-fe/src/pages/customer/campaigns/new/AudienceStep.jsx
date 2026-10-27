import { GroupChoices } from '../../../../components/form/GroupChoices'
import { formatCount } from '../../dashboard/format'

const errorColor = '#E0232E'

export function AudienceStep({ groups, groupIds, error, onToggle }) {
  const selected = groups.filter((group) => groupIds.includes(group.id))
  const recipients = selected.reduce((sum, group) => sum + group.breakdown.active, 0)

  return (
    <fieldset id="campaign-groups">
      <legend className="text-base font-bold text-navy">Who receives it</legend>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">
        Choose one or more groups. Only active contacts are included. Pending, unsubscribed, and blocked numbers stay out.
        Someone in two groups is counted twice.
      </p>
      <p className="mt-2 text-sm font-medium text-navy">
        {selected.length
          ? `${formatCount(selected.length)} ${selected.length === 1 ? 'group' : 'groups'} · ${formatCount(recipients)} active contacts`
          : 'Select at least one group.'}
      </p>
      <GroupChoices groups={groups} groupIds={groupIds} onToggle={onToggle} />
      <p id="campaign-groups-error" role="alert" className="mt-1.5 min-h-5 text-sm" style={{ color: errorColor }}>
        {error}
      </p>
    </fieldset>
  )
}
