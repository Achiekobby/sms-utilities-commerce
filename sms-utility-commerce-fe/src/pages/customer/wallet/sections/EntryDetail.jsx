import { ArrowRight, X } from 'lucide-react'
import { Link } from 'react-router'
import { Drawer } from '../../../../components/Drawer'
import { paths } from '../../../../routes/paths'
import { formatCreated } from '../../campaigns/model'
import { channelById, formatUnits } from '../money'
import { EntryStatusBadge, EntryTypeBadge } from './EntryBadge'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function Fact({ label, children }) {
  return (
    <div className="border-b border-ink/10 py-3">
      <dt className="text-xs font-medium text-ink/50">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-navy">{children}</dd>
    </div>
  )
}

export function EntryDetail({ entry, onClose }) {
  const channel = channelById(entry.channel)
  const related =
    entry.relatedKind === 'campaign'
      ? { to: paths.campaign(entry.relatedId), label: 'View campaign' }
      : entry.relatedKind === 'message'
        ? { to: paths.message(entry.relatedId), label: 'View message' }
        : null

  return (
    <Drawer label={entry.description} onClose={onClose} widthClass="w-[min(28rem,calc(100vw-1.5rem))]">
      <div className="flex h-full flex-col bg-white">
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink/50">{formatCreated(entry.createdAt)}</p>
            <h2 className="mt-1 text-lg font-bold text-navy">{entry.description}</h2>
            <p className={`mt-2 text-xl font-bold tabular-nums ${entry.type === 'credit' ? 'text-green' : 'text-navy'}`}>
              {entry.type === 'credit' ? '+' : '−'}
              {formatUnits(entry.amount)}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <EntryTypeBadge type={entry.type} />
              <EntryStatusBadge status={entry.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-autofocus="true"
            className={`-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-ink/55 transition-colors hover:bg-canvas hover:text-navy ${focusClass}`}
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <dl>
            <Fact label="Balance after">{entry.balanceAfter == null ? 'Waiting' : formatUnits(entry.balanceAfter)}</Fact>
            <Fact label="Reference">{entry.reference}</Fact>
            {channel ? (
              <Fact label="Paid with">
                {channel.label} · {channel.gatewayLabel}
              </Fact>
            ) : null}
          </dl>
          {related ? (
            <Link
              to={related.to}
              className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue hover:text-blue/80 ${focusClass}`}
            >
              {related.label}
              <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </Drawer>
  )
}
