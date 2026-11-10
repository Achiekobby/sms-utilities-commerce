import { ArrowLeft, CheckCircle2, Clock3, Copy, Gift, MoreHorizontal, Pause, Play, Send, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { ConfirmDialog } from '../../../components/ConfirmDialog'
import { TypeBadge } from '../../../components/TypeBadge'
import { paths } from '../../../routes/paths'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { formatCount } from '../dashboard/format'
import { formatUnits, unitsPerCedi } from '../wallet/money'
import { CampaignStatus } from './sections/CampaignStatus'
import { RewardStatusBadge } from './sections/RewardStatusBadge'
import {
  audienceLabel,
  campaignGroups,
  deliveryRate,
  formatCreated,
  formatSendTime,
  messageCount,
  occasionTypeLabel,
  sampleMessage,
  scheduleLabel,
  triggerOffsetLabel,
} from './model'
import { ctaTypeMeta, formatCtaValue } from './cta'
import {
  formatRewardMoney,
  formatRewardValue,
  rewardPlaceholders,
  rewardTypeMeta,
} from './reward'
import { useCampaign } from './useCampaigns'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const card =
  'rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6'

function Fact({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3 last:border-b-0">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-right text-sm font-medium text-navy">{value ?? '—'}</dd>
    </div>
  )
}

function DeliveryStat({ label, value, icon: Icon, tone }) {
  return (
    <div className={`rounded-xl px-3 py-3 ${tone}`}>
      <dt className="flex items-center gap-1.5 text-xs font-medium text-ink/55">
        <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-navy tabular-nums">{value == null ? '—' : formatCount(value)}</dd>
    </div>
  )
}

function MissingCampaign() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <h1 className="text-2xl font-semibold text-navy">Campaign not found</h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">That campaign is not in this workspace.</p>
      <Link to={paths.campaigns} className={`mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-blue ${focusClass}`}>
        <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
        Back to campaigns
      </Link>
    </div>
  )
}

export function CampaignDetailPage() {
  const { campaignId } = useParams()
  const location = useLocation()
  const campaign = useCampaign(campaignId)
  const [confirmDelete, setConfirmDelete] = useState(false)
  useDocumentTitle(campaign ? campaign.name : 'Campaign')

  const createdBanner = useMemo(() => {
    if (!location.state?.justCreated || !campaign) return null
    if (location.state.outcome === 'activated') {
      return {
        title: 'Campaign activated',
        detail: `${campaign.name} will automatically send when contacts reach their occasion.`,
      }
    }
    if (location.state.outcome === 'scheduled') {
      return {
        title: 'Campaign scheduled',
        detail: `${campaign.name} will be sent to approximately ${formatCount(campaign.recipients)} recipients on ${scheduleLabel(campaign)}.`,
      }
    }
    return {
      title: 'Campaign sent',
      detail: `${campaign.name} is on its way to approximately ${formatCount(campaign.recipients)} recipients.`,
    }
  }, [campaign, location.state])

  if (!campaign) return <MissingCampaign />

  const reported = campaign.delivered != null || campaign.sent != null
  const audience = campaignGroups(campaign)
  const isOccasion = campaign.type === 'occasion'
  const canPause = campaign.status === 'active'
  const canResume = campaign.status === 'paused'

  return (
    <div className="w-full min-w-0">
      <p className="text-sm font-medium text-ink/55">
        <Link to={paths.campaigns} className={`inline-flex items-center gap-1 rounded-sm text-blue ${focusClass}`}>
          <ArrowLeft size={14} strokeWidth={2.2} aria-hidden="true" />
          Campaigns
        </Link>
      </p>

      {createdBanner ? (
        <div className="mt-4 rounded-xl border border-[#B7E4C7] bg-[#F3FBF6] px-4 py-3">
          <p className="text-sm font-semibold text-green">{createdBanner.title}</p>
          <p className="mt-0.5 text-sm text-ink/70">{createdBanner.detail}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              to={paths.campaigns}
              className={`inline-flex h-9 items-center rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
            >
              Back to campaigns
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">{campaign.name}</h1>
            <TypeBadge type={campaign.type} />
            <CampaignStatus status={campaign.status} />
          </div>
          <p className="mt-1.5 text-sm text-ink/55">Created {formatCreated(campaign.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canPause ? (
            <button
              type="button"
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
            >
              <Pause size={15} strokeWidth={2.2} aria-hidden="true" />
              Pause
            </button>
          ) : null}
          {canResume ? (
            <button
              type="button"
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
            >
              <Play size={15} strokeWidth={2.2} aria-hidden="true" />
              Resume
            </button>
          ) : null}
          <button
            type="button"
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
          >
            <Copy size={15} strokeWidth={2.2} aria-hidden="true" />
            Duplicate
          </button>
          <button
            type="button"
            aria-label="More actions"
            onClick={() => setConfirmDelete(true)}
            className={`inline-flex size-9 items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/70 hover:bg-canvas ${focusClass}`}
          >
            <MoreHorizontal size={16} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="@container/detail mt-6 grid items-start gap-4 @4xl/detail:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className={card}>
          <h2 className="text-base font-bold text-navy">Campaign</h2>
          <dl className="mt-2">
            <Fact label="Type" value={<TypeBadge type={campaign.type} />} />
            {isOccasion ? <Fact label="Occasion" value={occasionTypeLabel(campaign.occasionType)} /> : null}
            {isOccasion && campaign.occasionType === 'custom' && campaign.customDate ? (
              <Fact label="Custom date" value={formatCreated(`${campaign.customDate}T12:00:00`)} />
            ) : null}
            <Fact label="Audience" value={audienceLabel(campaign)} />
            <Fact label="SMS recipients" value={formatCount(campaign.recipients)} />
            {campaign.reward?.enabled ? (
              <Fact
                label="Reward recipients"
                value={formatCount(campaign.rewardRecipients ?? campaign.reward.eligibleRecipients ?? campaign.recipients)}
              />
            ) : null}
            <Fact label="Sender" value={campaign.sender} />
            <Fact label={isOccasion ? 'Trigger' : 'Schedule'} value={scheduleLabel(campaign)} />
            {isOccasion ? (
              <>
                <Fact label="Send time" value={formatSendTime(campaign.sendTime)} />
                <Fact label="Offset" value={triggerOffsetLabel(campaign.triggerOffset)} />
                <Fact label="Repeat" value={campaign.repeatYearly ? 'Every year' : 'Does not repeat'} />
              </>
            ) : null}
            {!isOccasion && campaign.cta?.enabled ? (
              <>
                <Fact label="CTA type" value={ctaTypeMeta(campaign.cta.type)?.label ?? '—'} />
                <Fact label="CTA destination" value={formatCtaValue(campaign.cta)} />
                {campaign.cta.label ? <Fact label="CTA prompt" value={campaign.cta.label} /> : null}
                {campaign.reward?.enabled ? (
                  <Fact
                    label="Reward trigger"
                    value={campaign.cta.triggersReward ? 'On CTA use' : 'Not linked to CTA'}
                  />
                ) : null}
              </>
            ) : null}
          </dl>

          <div className="mt-5 rounded-xl bg-canvas px-4 py-4">
            <p className="text-xs font-semibold tracking-wide text-navy">{campaign.sender}</p>
            <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-ink">
              {sampleMessage(campaign.body, rewardPlaceholders(campaign.reward))}
            </p>
          </div>

          {audience.length ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {audience.map((group) => (
                <li key={group.id}>
                  <Link
                    to={paths.contactGroup(group.id)}
                    className={`flex items-center justify-between gap-3 rounded-xl border border-ink/10 px-3 py-2.5 text-sm hover:border-blue/40 ${focusClass}`}
                  >
                    <span className="font-semibold text-blue">{group.name}</span>
                    <span className="text-xs text-ink/55 tabular-nums">{formatCount(group.active)} active</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <div className="space-y-4">
          <section className={card}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-navy">Delivery</h2>
              {reported ? <p className="text-sm font-semibold text-navy tabular-nums">{deliveryRate(campaign)}</p> : null}
            </div>
            {reported ? (
              <dl className="mt-4 grid grid-cols-2 gap-2">
                <DeliveryStat label="Sent" value={campaign.sent ?? messageCount(campaign)} icon={Send} tone="bg-[#E7F1FC]" />
                <DeliveryStat label="Delivered" value={campaign.delivered} icon={CheckCircle2} tone="bg-[#E5F6EC]" />
                <DeliveryStat label="Pending" value={campaign.pending} icon={Clock3} tone="bg-[#FFF8EE]" />
                <DeliveryStat label="Failed" value={campaign.failed} icon={XCircle} tone="bg-[#FDECEE]" />
              </dl>
            ) : (
              <p className="mt-3 text-sm leading-6 text-ink/60">
                {campaign.status === 'draft'
                  ? 'This draft has not been sent yet.'
                  : campaign.status === 'scheduled'
                    ? 'Delivery will appear after the scheduled send.'
                    : 'Delivery has not been reported yet.'}
              </p>
            )}
          </section>

          {campaign.reward?.enabled ? (
            <section className={card}>
              <div className="flex items-center gap-2">
                <Gift size={16} strokeWidth={2.2} className="text-green" aria-hidden="true" />
                <h2 className="text-base font-bold text-navy">Reward</h2>
              </div>
              <dl className="mt-2">
                <Fact label="Type" value={rewardTypeMeta(campaign.reward.type)?.label ?? '—'} />
                <Fact label="Value" value={formatRewardValue(campaign.reward)} />
                <Fact label="Eligible recipients" value={formatCount(campaign.reward.eligibleRecipients)} />
                {campaign.reward.disbursed != null ? (
                  <>
                    <Fact label="Disbursed" value={formatCount(campaign.reward.disbursed)} />
                    <Fact label="Pending" value={formatCount(campaign.reward.pending)} />
                    <Fact label="Failed" value={formatCount(campaign.reward.failed)} />
                    <Fact
                      label="Total disbursed"
                      value={
                        campaign.reward.totalDisbursed != null
                          ? formatRewardMoney(campaign.reward.totalDisbursed)
                          : '—'
                      }
                    />
                  </>
                ) : campaign.reward.estimatedCost != null ? (
                  <Fact label="Estimated reward cost" value={formatUnits(campaign.reward.estimatedCost)} />
                ) : null}
              </dl>
              {campaign.reward.disbursed != null ? (
                <dl className="mt-4 grid grid-cols-2 gap-2">
                  <DeliveryStat label="Successful" value={campaign.reward.disbursed} icon={CheckCircle2} tone="bg-[#E5F6EC]" />
                  <DeliveryStat label="Pending" value={campaign.reward.pending} icon={Clock3} tone="bg-[#FFF8EE]" />
                  <DeliveryStat label="Failed" value={campaign.reward.failed} icon={XCircle} tone="bg-[#FDECEE]" />
                  <DeliveryStat label="Not eligible" value={campaign.reward.notEligible} icon={Gift} tone="bg-[#FFF4E5]" />
                </dl>
              ) : null}
              {campaign.reward.failed > 0 ? (
                <button
                  type="button"
                  className={`mt-4 inline-flex h-9 items-center rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:bg-canvas ${focusClass}`}
                >
                  Retry failed rewards
                </button>
              ) : null}
            </section>
          ) : null}

          {isOccasion && Array.isArray(campaign.upcoming) ? (
            <section className={card}>
              <h2 className="text-base font-bold text-navy">Upcoming sends</h2>
              <p className="mt-1 text-sm text-ink/60">
                Estimated birthday and occasion messages in the next week.
                {campaign.reward?.enabled
                  ? ' Reward costs may vary based on eligible recipients at send time.'
                  : ''}
              </p>
              <dl className="mt-4 space-y-2">
                {campaign.upcoming.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-canvas px-3 py-3">
                    <dt className="text-sm text-ink/60">{item.label}</dt>
                    <dd className="text-sm font-semibold text-navy tabular-nums">
                      {formatCount(item.recipients)} recipients
                      {campaign.reward?.enabled && campaign.reward.amount ? (
                        <span className="ml-2 text-xs font-medium text-ink/50">
                          ~{formatUnits(Math.round(item.recipients * campaign.reward.amount * unitsPerCedi))}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}
        </div>
      </div>

      {Array.isArray(campaign.recipientsSample) && campaign.recipientsSample.length ? (
        <section className={`${card} mt-4`}>
          <h2 className="text-base font-bold text-navy">Recipients</h2>
          <p className="mt-1 text-sm text-ink/60">SMS and reward status are tracked separately.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-xs font-medium text-ink/50">
                  {['Recipient', 'Phone', 'SMS status', 'Reward', 'Reward status'].map((label) => (
                    <th key={label} scope="col" className="border-b border-ink/10 px-3 py-2 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaign.recipientsSample.map((row) => (
                  <tr key={`${row.phone}-${row.name}`}>
                    <td className="border-b border-ink/[0.06] px-3 py-3 font-medium text-navy">{row.name}</td>
                    <td className="border-b border-ink/[0.06] px-3 py-3 text-ink/70">{row.phone}</td>
                    <td className="border-b border-ink/[0.06] px-3 py-3 capitalize text-ink/70">{row.smsStatus}</td>
                    <td className="border-b border-ink/[0.06] px-3 py-3 text-ink/70">{row.rewardLabel}</td>
                    <td className="border-b border-ink/[0.06] px-3 py-3">
                      <RewardStatusBadge status={row.rewardStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {confirmDelete ? (
        <ConfirmDialog
          tone="danger"
          title="Delete campaign?"
          description="This campaign will be permanently removed. This action cannot be undone."
          confirmLabel="Delete campaign"
          busyLabel="Deleting…"
          onConfirm={() => setConfirmDelete(false)}
          onClose={() => setConfirmDelete(false)}
        />
      ) : null}
    </div>
  )
}
