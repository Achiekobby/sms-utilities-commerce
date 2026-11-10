import { GroupChoices } from '../../../../components/form/GroupChoices'
import { formatCount } from '../../dashboard/format'
import { RewardStep } from './RewardStep'

const errorColor = '#E0232E'

export function AudienceStep({
  groups,
  groupIds,
  error,
  onToggle,
  values,
  rewardErrors = {},
  onChange,
  balance,
  onAddFunds,
}) {
  const selected = groups.filter((group) => groupIds.includes(group.id))
  const recipients = selected.reduce((sum, group) => sum + group.breakdown.active, 0)

  return (
    <div className="flex flex-col gap-8">
      <fieldset id="campaign-groups">
        <legend className="text-base font-bold text-navy">Who should receive this campaign?</legend>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/60">
          Choose one or more contact groups. Only active contacts are included. Customers appearing in multiple groups will
          receive only one message.
        </p>
        <p className="mt-3 text-sm font-semibold text-navy tabular-nums">
          Estimated recipients · {formatCount(recipients)}
        </p>
        <p className="mt-1 text-sm text-ink/55">
          {selected.length
            ? `${formatCount(selected.length)} ${selected.length === 1 ? 'group' : 'groups'} selected`
            : 'Select at least one group.'}
        </p>
        <GroupChoices groups={groups} groupIds={groupIds} onToggle={onToggle} />
        <p id="campaign-groups-error" role="alert" className="mt-1.5 min-h-5 text-sm" style={{ color: errorColor }}>
          {error}
        </p>
      </fieldset>

      <div className="border-t border-ink/10 pt-6">
        <RewardStep
          values={values}
          errors={rewardErrors}
          onChange={onChange}
          smsRecipients={recipients}
          balance={balance}
          onAddFunds={onAddFunds}
        />
      </div>
    </div>
  )
}
