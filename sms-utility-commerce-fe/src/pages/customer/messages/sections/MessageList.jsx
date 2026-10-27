import { Hash, LayoutGrid, Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { paths } from '../../../../routes/paths'
import { formatCount } from '../../dashboard/format'
import { CampaignStatus } from '../../campaigns/sections/CampaignStatus'
import { deliveryRate, formatCreated, messageCount } from '../../campaigns/model'
import { kindLabel, messageKinds } from '../model'
import { KindBadge } from './KindBadge'

const head =
  'bg-[#F3F6FB] px-3 py-2.5 text-xs font-medium whitespace-nowrap text-ink/50 first:rounded-l-lg last:rounded-r-lg'
const cell = 'border-b border-ink/[0.06] px-3 py-3.5 text-sm whitespace-nowrap text-ink/75'
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function matches(message, kind, term) {
  if (kind !== 'all' && message.kind !== kind) return false
  if (!term) return true
  const groupNames = message.groups.map((group) => group.name).join(' ')
  const haystack = `${message.name} ${kindLabel(message.kind)} ${message.sender} ${groupNames}`.toLowerCase()
  return haystack.includes(term)
}

export function MessageList({ messages }) {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState('all')
  const term = query.trim().toLowerCase()
  const results = useMemo(
    () => messages.filter((message) => matches(message, kind, term)),
    [messages, kind, term],
  )

  return (
    <section aria-label="Messages" className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search messages</span>
          <Search
            size={15}
            strokeWidth={2}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/45"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, group, or sender"
            className="h-9 w-full rounded-lg border border-ink/15 bg-white pr-3 pl-9 text-[13px] text-navy placeholder:text-ink/45 focus-visible:border-blue/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by send">
          {[
            { id: 'all', label: 'All', icon: LayoutGrid },
            { id: 'numbers', label: messageKinds[0].label, icon: Hash },
            { id: 'groups', label: messageKinds[1].label, icon: Users },
          ].map((item) => {
            const selected = kind === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setKind(item.id)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold transition-colors ${focusClass} ${
                  selected ? 'border-blue bg-blue/[0.06] text-navy' : 'border-ink/15 bg-white text-navy hover:border-blue/40'
                }`}
              >
                <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <p className="mt-3 text-[13px] text-ink/60 tabular-nums" aria-live="polite">
        {formatCount(results.length)} {results.length === 1 ? 'report' : 'reports'}
      </p>

      {results.length ? (
        <>
          <ul className="mt-4 space-y-3 md:hidden">
            {results.map((message) => (
              <li key={message.id}>
                <Link
                  to={paths.message(message.id)}
                  className={`block rounded-xl border border-[#D8E7FA] bg-white p-4 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)] transition-colors duration-200 hover:border-blue/40 ${focusClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold text-navy">{message.name}</p>
                      <div className="mt-1.5">
                        <KindBadge kind={message.kind} />
                      </div>
                    </div>
                    <CampaignStatus status={message.status} />
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-ink/50">Recipients</dt>
                      <dd className="mt-0.5 font-semibold text-navy tabular-nums">{formatCount(message.recipients)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink/50">Delivery</dt>
                      <dd className="mt-0.5 font-semibold text-navy tabular-nums">{deliveryRate(message)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink/50">Created</dt>
                      <dd className="mt-0.5 font-medium text-ink/75">{formatCreated(message.createdAt)}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-ink/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_12px_28px_-18px_rgba(11,31,91,0.45)] md:block sm:p-5">
            <table className="w-full min-w-[44rem] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  {['Message', 'Send', 'Recipients', 'Messages', 'Delivery', 'Status', 'Created'].map((label) => (
                    <th key={label} scope="col" className={head}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&>tr:last-child>*]:border-b-0">
                {results.map((message) => (
                  <tr key={message.id}>
                    <th scope="row" className={`${cell} text-left font-medium text-navy`}>
                      <Link to={paths.message(message.id)} className={`rounded-sm hover:text-blue ${focusClass}`}>
                        {message.name}
                      </Link>
                    </th>
                    <td className={cell}>
                      <KindBadge kind={message.kind} />
                    </td>
                    <td className={`${cell} tabular-nums`}>{formatCount(message.recipients)}</td>
                    <td className={`${cell} tabular-nums`}>{formatCount(messageCount(message))}</td>
                    <td className={`${cell} tabular-nums`}>{deliveryRate(message)}</td>
                    <td className={cell}>
                      <CampaignStatus status={message.status} />
                    </td>
                    <td className={cell}>{formatCreated(message.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-ink/15 bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-navy">No reports match</p>
          <p className="mt-1 text-sm text-ink/55">
            {term ? `Nothing matches “${query.trim()}”.` : 'Nothing matches this send.'}
          </p>
        </div>
      )}
    </section>
  )
}
