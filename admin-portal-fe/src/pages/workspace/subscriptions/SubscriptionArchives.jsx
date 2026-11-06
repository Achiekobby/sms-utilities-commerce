import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { apiErrorMessage } from '../../../features/auth/session'
import { pageWindow } from '../../../features/clients/clientModel'
import { formatUnits, formatWhen, labelize, money, monthSpan } from '../../../features/subscriptions/subscriptionModel'
import { useGetSubscriptionArchivesQuery } from '../../../services/api/subscriptions/subscriptionsApi'
import { focusClass, headClass, cellClass } from './ui'

export function SubscriptionArchives({ clientId, compact = false }) {
  const [page, setPage] = useState(1)
  const { data, isLoading, isFetching, isError, error, refetch } = useGetSubscriptionArchivesQuery(
    { clientId, page, perPage: compact ? 3 : 15 },
    { skip: !clientId },
  )
  const records = Array.isArray(data?.data) ? data.data : []
  const pages = pageWindow(
    data?.pagination ?? { current_page: page, per_page: records.length || 15, total: records.length, last_page: 1 },
  )
  const waiting = isLoading && !data

  if (waiting) return <div className="skeleton mt-3 h-20 rounded-xl" aria-hidden="true" />

  if (isError) {
    return (
      <div className="mt-3" role="alert">
        <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
        <button type="button" onClick={refetch} className={`mt-2 text-sm font-semibold text-blue ${focusClass}`}>
          Try again
        </button>
      </div>
    )
  }

  if (!records.length) return <p className="mt-3 text-sm text-ink/55">No earlier subscriptions.</p>

  return (
    <div aria-busy={isFetching || undefined}>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {['Plan', 'Type', 'Units', 'Price', 'Period'].map((label) => (
                <th key={label} scope="col" className={headClass}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <th scope="row" className={`${cellClass} font-semibold text-navy`}>
                  {record.plan_name || 'Plan'}
                </th>
                <td className={cellClass}>{labelize(record.plan_type) || '—'}</td>
                <td className={`${cellClass} tabular-nums`}>{formatUnits(record.units) || '—'}</td>
                <td className={`${cellClass} tabular-nums`}>{money(record.plan_price) || '—'}</td>
                <td className={cellClass}>
                  {formatWhen(record.starts_at) || '—'}
                  <span className="text-ink/35"> – </span>
                  {record.ends_at ? formatWhen(record.ends_at) : 'No end date'}
                  {record.duration_in_months ? <span className="block text-xs text-ink/45">{monthSpan(record.duration_in_months)}</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {compact && pages.total > records.length ? (
        <p className="mt-2 text-xs text-ink/45">The rest of this history is on the client profile.</p>
      ) : null}
      {compact || pages.total <= pages.perPage ? null : (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-sm text-ink/50">
            Showing {pages.from}–{pages.to} of {pages.total}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous archive page"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={pages.current <= 1}
              className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-ink/10 text-navy disabled:opacity-40 ${focusClass}`}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next archive page"
              onClick={() => setPage((current) => current + 1)}
              disabled={pages.current >= pages.lastPage}
              className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-ink/10 text-navy disabled:opacity-40 ${focusClass}`}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
