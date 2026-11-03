import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { TypeBadge } from '../../../components/TypeBadge'
import { paths } from '../../../routes/paths'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { formatCount } from '../dashboard/format'
import { CampaignStatus } from './sections/CampaignStatus'
import {
  deliveryRate,
  formatCreated,
  messageCount,
  campaignGroups,
  sampleMessage,
  whenLabel,
} from './model'
import { useCampaign } from './useCampaigns'

function Fact({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-3">
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="text-right text-sm font-medium text-navy">{value}</dd>
    </div>
  )
}

function MissingCampaign() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <h1 className="text-2xl font-semibold text-navy">Campaign not found</h1>
      <p className="mt-3 text-sm leading-6 text-ink/70">That campaign is not in this workspace.</p>
      <Link
        to={paths.campaigns}
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        <ArrowLeft size={15} strokeWidth={2.2} aria-hidden="true" />
        Back to campaigns
      </Link>
    </div>
  )
}

export function CampaignDetailPage() {
  const { campaignId } = useParams()
  const campaign = useCampaign(campaignId)
  useDocumentTitle(campaign ? campaign.name : 'Campaign')

  if (!campaign) return <MissingCampaign />

  const reported = campaign.delivered != null
  const audience = campaignGroups(campaign)

  return (
    <div className="w-full min-w-0">
      <p className="text-sm font-medium text-ink/55">
        <Link
          to={paths.campaigns}
          className="inline-flex items-center gap-1 rounded-sm text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          <ArrowLeft size={14} strokeWidth={2.2} aria-hidden="true" />
          Campaigns
        </Link>
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem]">{campaign.name}</h1>
        <CampaignStatus status={campaign.status} />
      </div>
      <p className="mt-1.5 text-sm text-ink/55">Created {formatCreated(campaign.createdAt)}</p>

      {/* Side by side once the pane is wide enough, so the page fills the space instead of a narrow strip. */}
      <div className="@container/detail mt-6">
      <div className="grid items-start gap-4 @4xl/detail:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="min-w-0 rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6">
        <h2 className="text-base font-bold text-navy">Send</h2>
        <dl className="mt-2">
          <Fact label="Type" value={<TypeBadge type={campaign.type} />} />
          <div className="border-b border-ink/10 py-3">
            <dt className="text-sm text-ink/55">{audience.length === 1 ? 'Group' : 'Groups'}</dt>
            <dd className="mt-2 grid gap-2 sm:grid-cols-2">
              {audience.map((group) => (
                <Link
                  key={group.id}
                  to={paths.contactGroup(group.id)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-ink/10 px-3 py-2.5 text-sm hover:border-blue/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                >
                  <span className="font-semibold text-blue">{group.name}</span>
                  <span className="text-xs text-ink/55 tabular-nums">{formatCount(group.active)} active</span>
                </Link>
              ))}
            </dd>
          </div>
          <Fact label="Recipients" value={formatCount(campaign.recipients)} />
          <Fact label="Messages" value={formatCount(messageCount(campaign))} />
          <Fact label="Sender" value={campaign.sender} />
          <Fact label="When" value={whenLabel(campaign)} />
        </dl>

        <div className="mt-5 rounded-xl bg-canvas px-4 py-4">
          <p className="text-xs font-semibold tracking-wide text-navy">{campaign.sender}</p>
          <p className="mt-1 text-sm leading-6 whitespace-pre-wrap text-ink">{sampleMessage(campaign.body)}</p>
        </div>
      </div>

      <section
        aria-labelledby="campaign-delivery"
        className="min-w-0 rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="campaign-delivery" className="text-base font-bold text-navy">
            Delivery
          </h2>
          {reported ? <p className="text-sm font-semibold text-navy tabular-nums">{deliveryRate(campaign)}</p> : null}
        </div>
        {reported ? (
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ['Delivered', campaign.delivered],
              ['Pending', campaign.pending],
              ['Failed', campaign.failed],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-canvas px-4 py-3">
                <dt className="text-xs text-ink/55">{label}</dt>
                <dd className="mt-1 text-lg font-bold tracking-tight text-navy tabular-nums">{formatCount(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-sm leading-6 text-ink/60">Delivery has not been reported yet.</p>
        )}
      </section>
      </div>
      </div>
    </div>
  )
}
