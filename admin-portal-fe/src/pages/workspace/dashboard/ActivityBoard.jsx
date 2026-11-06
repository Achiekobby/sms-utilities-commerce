import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../../routes/paths'
import { recentActivity, reviewQueue } from './data'

const card =
  'rounded-xl border border-ink/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-5'
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const head = 'bg-[#F3F6FB] px-3 py-2.5 text-xs font-medium whitespace-nowrap text-ink/50 first:rounded-l-lg last:rounded-r-lg'
const cell = 'border-b border-ink/[0.06] px-3 py-3.5 text-sm whitespace-nowrap text-ink/75'

const tones = {
  Settled: 'bg-[#DDF3E6] text-[#0E7A38]',
  Approved: 'bg-[#DDF3E6] text-[#0E7A38]',
  Sent: 'bg-[#E7F0FF] text-[#0B63F6]',
  Pending: 'bg-[#FFF4DF] text-[#B45F06]',
  Review: 'bg-[#FFF4DF] text-[#B45F06]',
  New: 'bg-[#F3F6FB] text-navy',
}

function Status({ value }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${tones[value] ?? tones.New}`}>
      {value}
    </span>
  )
}

function ViewAll({ to, label }) {
  return (
    <Link to={to} className={`inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue hover:text-blue/80 ${focusClass}`}>
      {label}
      <ArrowRight size={14} strokeWidth={2.2} aria-hidden="true" />
    </Link>
  )
}

export function ActivityBoard() {
  return (
    <section aria-label="Recent activity and reviews" className="mt-6 flex w-full min-w-0 flex-col gap-4 sm:mt-7">
      <div className="grid w-full min-w-0 gap-4">
        <article className={`${card} min-w-0`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-navy sm:text-lg">Recent activity</h2>
            <ViewAll to={paths.activityLogs} label="Activity logs" />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  {['Client', 'Event', 'Detail', 'When', 'Status'].map((label) => (
                    <th key={label} scope="col" className={head}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row) => (
                  <tr key={row.id}>
                    <td className={`${cell} font-medium text-navy`}>{row.client}</td>
                    <td className={cell}>{row.event}</td>
                    <td className={cell}>{row.detail}</td>
                    <td className={cell}>{row.when}</td>
                    <td className={cell}>
                      <Status value={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={`${card} min-w-0`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-navy sm:text-lg">Needs review</h2>
            <ViewAll to={paths.senderIds} label="Sender IDs" />
          </div>
          <ul className="mt-3 divide-y divide-ink/[0.07]">
            {reviewQueue.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-navy">{item.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-ink/50">{item.detail}</span>
                </span>
                <Status value={item.status} />
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
