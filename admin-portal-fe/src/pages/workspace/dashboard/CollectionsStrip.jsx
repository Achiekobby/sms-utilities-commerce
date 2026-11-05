import { ArrowRight, Wallet } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../../../routes/paths'
import { collections, formatCedi } from './data'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function CollectionsStrip() {
  return (
    <section
      aria-label="Collections"
      className="mt-6 w-full overflow-hidden rounded-xl border border-[#D8E7FA] bg-white shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:mt-7"
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-mint/15 text-green">
            <Wallet size={22} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink/55">Collections this month</p>
            <p className="mt-0.5 text-3xl font-bold tracking-tight text-navy tabular-nums">{formatCedi(collections.total)}</p>
            <p className="mt-1 text-sm text-ink/55">{collections.note}</p>
          </div>
        </div>
        <Link
          to={paths.payments}
          className={`inline-flex h-10 w-fit items-center gap-1.5 rounded-lg bg-green px-3 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
        >
          Payments
          <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
        </Link>
      </div>
      <ul className="grid border-t border-ink/10 sm:grid-cols-2">
        {collections.recent.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3 last:border-b-0 sm:border-b-0 sm:px-5 sm:odd:border-r"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-navy">{entry.client}</span>
              <span className="mt-0.5 block text-xs text-ink/45">
                {entry.detail} · {entry.when}
              </span>
            </span>
            <span className="shrink-0 text-sm font-bold text-green tabular-nums">+{formatCedi(entry.amount)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
