import { ArrowRight } from 'lucide-react'
import { recentCampaigns, scheduledMessages } from '../data'
import { formatCount } from '../format'

const card =
  'rounded-xl border border-ink/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-5'

const head = 'bg-[#F3F6FB] px-3 py-2.5 text-xs font-medium whitespace-nowrap text-ink/50 first:rounded-l-lg last:rounded-r-lg'
const cell = 'border-b border-ink/[0.06] px-3 py-3.5 text-sm whitespace-nowrap text-ink/75'

const statusStyle = {
  Completed: { dot: '#159447', pill: 'bg-[#E5F6EC] text-[#0E8A3E]' },
  'In Progress': { dot: '#1473E6', pill: 'bg-[#E7F1FC] text-blue' },
  Scheduled: { dot: null, pill: 'bg-[#E7F1FC] text-blue' },
}

function ViewAll() {
  return (
    <button
      type="button"
      className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue transition-colors hover:text-blue/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
    >
      View all
      <ArrowRight size={14} strokeWidth={2.2} aria-hidden="true" />
    </button>
  )
}

function Status({ value }) {
  const tone = statusStyle[value] ?? { dot: null, pill: 'bg-canvas text-navy' }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.pill}`}>
      {tone.dot ? (
        <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: tone.dot }} />
      ) : null}
      {value}
    </span>
  )
}

function Panel({ title, children }) {
  return (
    <article className={card}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-navy sm:text-lg">{title}</h2>
        <ViewAll />
      </div>
      <div className="mt-4 overflow-x-auto">{children}</div>
    </article>
  )
}

export function RecentCampaigns() {
  return (
    <section aria-label="Campaigns and scheduled messages" className="@container/lists mt-6 sm:mt-7">
      <div className="grid items-start gap-4 @4xl/lists:grid-cols-2">
        <Panel title="Recent Campaigns">
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
              {recentCampaigns.map((campaign) => (
                <tr key={campaign.name}>
                  <th scope="row" className={`${cell} text-left font-medium text-navy`}>
                    {campaign.name}
                  </th>
                  <td className={cell}>{campaign.type}</td>
                  <td className={`${cell} tabular-nums`}>{formatCount(campaign.messages)}</td>
                  <td className={`${cell} tabular-nums`}>{campaign.rate}</td>
                  <td className={cell}>
                    <Status value={campaign.status} />
                  </td>
                  <td className={cell}>{campaign.created}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="Scheduled Messages">
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
              {scheduledMessages.map((item) => (
                <tr key={item.message}>
                  <th scope="row" className={`${cell} text-left font-medium text-navy`}>
                    {item.message}
                  </th>
                  <td className={`${cell} tabular-nums`}>{formatCount(item.recipients)}</td>
                  <td className={cell}>{item.sendTime}</td>
                  <td className={cell}>
                    <Status value={item.status} />
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
