import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../../../routes/paths'
import { formatCount } from '../format'
import { CampaignStatus } from '../../campaigns/sections/CampaignStatus'
import { deliveryRate, formatCreated, formatSendAt, messageCount, typeLabel } from '../../campaigns/model'
import { useCampaigns } from '../../campaigns/useCampaigns'
import { useScheduledQueue } from '../../scheduled/queue'

const card =
  'rounded-xl border border-ink/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-5'

const head = 'bg-[#F3F6FB] px-3 py-2.5 text-xs font-medium whitespace-nowrap text-ink/50 first:rounded-l-lg last:rounded-r-lg'
const cell = 'border-b border-ink/[0.06] px-3 py-3.5 text-sm whitespace-nowrap text-ink/75'
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function ViewAll({ to }) {
  return (
    <Link
      to={to}
      className={`inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue transition-colors duration-200 hover:text-blue/80 ${focusClass}`}
    >
      View all
      <ArrowRight size={14} strokeWidth={2.2} aria-hidden="true" />
    </Link>
  )
}

function Panel({ title, to, children }) {
  return (
    <article className={`${card} min-w-0`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-navy sm:text-lg">{title}</h2>
        <ViewAll to={to} />
      </div>
      <div className="mt-4 overflow-x-auto">{children}</div>
    </article>
  )
}

function Name({ campaign }) {
  return (
    <Link to={paths.campaign(campaign.id)} className={`rounded-sm font-medium text-navy hover:text-blue ${focusClass}`}>
      {campaign.name}
    </Link>
  )
}

export function RecentCampaigns() {
  const campaigns = useCampaigns()
  const recent = campaigns.filter((campaign) => campaign.status !== 'scheduled').slice(0, 5)
  const scheduled = useScheduledQueue().slice(0, 5)

  return (
    <section aria-label="Campaigns and scheduled messages" className="@container/lists mt-6 sm:mt-7">
      {/* The tables need about 40rem and 32rem. Side by side only when both fit, otherwise each takes the full
          width, instead of two half-width panels that scroll sideways. */}
      <div className="grid items-start gap-4 @min-[84rem]/lists:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Panel title="Recent Campaigns" to={paths.campaigns}>
          <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th scope="col" className={head}>
                  Campaign Name
                </th>
                <th scope="col" className={head}>
                  Type
                </th>
                <th scope="col" className={head}>
                  Messages
                </th>
                <th scope="col" className={head}>
                  Delivery Rate
                </th>
                <th scope="col" className={head}>
                  Status
                </th>
                <th scope="col" className={head}>
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="[&>tr:last-child>*]:border-b-0">
              {recent.map((campaign) => (
                <tr key={campaign.id}>
                  <th scope="row" className={`${cell} text-left`}>
                    <Name campaign={campaign} />
                  </th>
                  <td className={cell}>{typeLabel(campaign.type)}</td>
                  <td className={`${cell} tabular-nums`}>{formatCount(messageCount(campaign))}</td>
                  <td className={`${cell} tabular-nums`}>{deliveryRate(campaign)}</td>
                  <td className={cell}>
                    <CampaignStatus status={campaign.status} />
                  </td>
                  <td className={cell}>{formatCreated(campaign.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Scheduled Messages" to={paths.scheduled}>
          <table className="w-full min-w-[32rem] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <th scope="col" className={head}>
                  Message
                </th>
                <th scope="col" className={head}>
                  Recipients
                </th>
                <th scope="col" className={head}>
                  Send Time
                </th>
                <th scope="col" className={head}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="[&>tr:last-child>*]:border-b-0">
              {scheduled.map((item) => (
                <tr key={item.key}>
                  <th scope="row" className={`${cell} text-left`}>
                    <Link to={item.to} className={`rounded-sm font-medium text-navy hover:text-blue ${focusClass}`}>
                      {item.name}
                    </Link>
                  </th>
                  <td className={`${cell} tabular-nums`}>{formatCount(item.recipients)}</td>
                  <td className={cell}>{item.sendAt ? formatSendAt(item.sendAt) : '—'}</td>
                  <td className={cell}>
                    <CampaignStatus status="scheduled" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </section>
  )
}
