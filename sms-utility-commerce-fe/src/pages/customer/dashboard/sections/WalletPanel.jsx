import { ArrowRight, Plus, Wallet } from 'lucide-react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { paths } from '../../../../routes/paths'
import { formatCreated } from '../../campaigns/model'
import { formatUnits, smsRateUnits } from '../../wallet/money'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function WalletPanel() {
  const balance = useSelector((state) => state.wallet.balance)
  const recent = useSelector((state) => state.wallet.entries).slice(0, 2)

  return (
    <section aria-label="Wallet" className="mt-6 overflow-hidden rounded-xl border border-[#D8E7FA] bg-white shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:mt-7">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-mint/15 text-green">
            <Wallet size={22} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink/55">Available balance</p>
            <p className="mt-0.5 text-3xl font-bold tracking-tight text-navy tabular-nums">{formatUnits(balance)}</p>
            <p className="mt-1 text-sm text-ink/55">SMS is {formatUnits(smsRateUnits)} per segment.</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            to={paths.wallet}
            className={`inline-flex h-10 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`}
          >
            Activity
            <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
          </Link>
          <Link
            to={paths.walletTopUp}
            className={`inline-flex h-10 items-center gap-1.5 rounded-lg bg-green px-3 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
          >
            <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
            Top up
          </Link>
        </div>
      </div>
      {recent.length ? (
        <ul className="grid border-t border-ink/10 sm:grid-cols-2">
          {recent.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3 last:border-b-0 sm:border-b-0 sm:px-5 sm:odd:border-r">
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-navy">{entry.description}</span>
                <span className="mt-0.5 block text-xs text-ink/45">{formatCreated(entry.createdAt)}</span>
              </span>
              <span className={`shrink-0 text-sm font-bold tabular-nums ${entry.type === 'credit' ? 'text-green' : 'text-navy'}`}>
                {entry.type === 'credit' ? '+' : '−'}
                {formatUnits(entry.amount)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
