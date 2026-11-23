import { CheckCircle2, Clock3, Send, TriangleAlert, XCircle } from 'lucide-react'
import { useGetSmsDeliveryReportQuery, useGetSmsStatusQuery } from '../../../../services/api/messages/messagesApi'
import { formatCount } from '../../dashboard/format'
import { messageDeliveryRate, messageFailureReasons, messageHasDelivery } from '../model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function DeliveryStat({ label, value, icon: Icon, tone }) {
  return (
    <div className={`rounded-xl px-3 py-3 ${tone}`}>
      <dt className="flex items-center gap-1.5 text-xs font-medium text-ink/55">
        <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-navy tabular-nums">
        {value == null ? '—' : formatCount(value)}
      </dd>
    </div>
  )
}

function rateFromCounts(counts) {
  if (!counts) return '—'
  if (Number.isFinite(counts.deliveryRate)) return `${counts.deliveryRate}%`
  const total = Number(counts.total) || 0
  const delivered = Number(counts.delivered) || 0
  if (!total) return '—'
  return `${((delivered / total) * 100).toFixed(1)}%`
}

function FailureRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-canvas px-3 py-2.5">
      <dt className="text-sm text-ink/60">{label}</dt>
      <dd className="text-sm font-semibold text-navy tabular-nums">{formatCount(value)}</dd>
    </div>
  )
}

function reasonCodeLabel(code) {
  const value = String(code ?? '').trim().toLowerCase()
  if (!value) return ''
  return value.replace(/_/g, ' ')
}

function FailureReasonsPanel({ summary, rows, compact = false }) {
  const totalFailed = rows.reduce((sum, row) => sum + (Number(row.count) || 0), 0)
  const title = summary || (totalFailed ? `${formatCount(totalFailed)} failed` : 'Delivery failed')

  return (
    <div
      role="status"
      className={`overflow-hidden rounded-2xl border border-[#E0232E]/18 bg-gradient-to-br from-[#FFF7F8] to-[#FDECEE] ${
        compact ? 'mt-4' : 'mt-5'
      }`}
    >
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#C21F2D] text-white shadow-[0_8px_18px_-10px_rgba(194,31,45,0.85)]">
          <TriangleAlert size={18} strokeWidth={2.2} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[#C21F2D]/75 uppercase">
            Why it failed
          </p>
          <h3 className="mt-0.5 text-base font-bold tracking-tight text-[#8F1823]">{title}</h3>
          <p className="mt-1 text-[13px] leading-5 text-ink/65">
            {rows.length === 1
              ? 'One failure reason was reported for this send.'
              : `${formatCount(rows.length)} failure reasons were reported for this send.`}
          </p>
        </div>
      </div>

      <ul className="space-y-2 border-t border-[#E0232E]/12 bg-white/55 px-3 py-3">
        {rows.map((row) => {
          const code = reasonCodeLabel(row.code)
          const refunded = /refund/i.test(row.label)
          return (
            <li
              key={row.code || row.label}
              className="rounded-xl border border-[#E0232E]/12 bg-white px-3.5 py-3 shadow-[0_1px_2px_rgba(143,24,35,0.04)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {code ? (
                    <span className="inline-flex rounded-md bg-[#FDECEE] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#C21F2D] uppercase">
                      {code}
                    </span>
                  ) : null}
                  <p className={`text-sm leading-5 text-navy ${code ? 'mt-1.5' : ''}`}>{row.label}</p>
                  {refunded ? (
                    <p className="mt-1.5 text-[12px] font-medium text-[#008859]">SMS units were refunded</p>
                  ) : null}
                </div>
                {row.count > 0 ? (
                  <span className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-[#C21F2D] px-2 text-[12px] font-bold text-white tabular-nums">
                    {formatCount(row.count)}
                  </span>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Live status (by gateway message_id) + delivery report (by sms id).
 * Falls back to the SMS record’s delivery fields while the report loads.
 */
export function MessageDeliveryReport({ message, compact = false }) {
  const messageId = String(message?.messageId ?? '').trim()
  const smsId = message?.id
  const statusQuery = useGetSmsStatusQuery(messageId, {
    skip: !messageId,
    pollingInterval: ['queued', 'sending', 'processing', 'in_progress'].includes(
      String(message?.status ?? '').toLowerCase(),
    )
      ? 8_000
      : 0,
  })
  const reportQuery = useGetSmsDeliveryReportQuery(
    { smsId, page: 1, perPage: 50 },
    { skip: smsId == null },
  )

  const live = statusQuery.data
  const report = reportQuery.data
  const summary = report?.summary ?? live?.counts
  const reported =
    Boolean(summary) ||
    messageHasDelivery(message) ||
    (live && (live.counts.delivered != null || live.counts.total > 0))

  const delivered = summary?.delivered ?? message?.delivered
  const failed = summary?.failed ?? message?.failed
  const pending = summary?.pending ?? message?.pending
  const sent = summary?.submitted ?? message?.sent
  const rate = summary
    ? rateFromCounts(summary)
    : live?.counts
      ? rateFromCounts(live.counts)
      : messageDeliveryRate(message)

  const failures = report?.failures
  const hasFailures =
    failures &&
    (failures.undelivered > 0 || failures.rejected > 0 || failures.expired > 0 || failures.notSent > 0)
  const reasonRows = messageFailureReasons(message)
  const failureSummary = String(message?.failureSummary ?? '').trim()

  if (reportQuery.isLoading && statusQuery.isLoading && !reported) {
    return (
      <div role="status" className="space-y-3">
        <span className="sr-only">Loading delivery report</span>
        <span className="skeleton block h-8 w-24 rounded-lg" />
        <span className="skeleton block h-20 w-full rounded-xl" />
      </div>
    )
  }

  if (reportQuery.isError && statusQuery.isError && !reported) {
    return (
      <div role="alert" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#9F1C26]">Delivery report could not be loaded.</p>
        <button
          type="button"
          onClick={() => {
            reportQuery.refetch()
            if (messageId) statusQuery.refetch()
          }}
          className={`h-9 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div>
      {reported ? (
        <>
          <p className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold tracking-tight text-navy tabular-nums`}>
            {rate}
          </p>
          <dl className={`mt-4 grid gap-3 ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
            <DeliveryStat label="Submitted" value={sent} icon={Send} tone="bg-[#E7F1FC]" />
            <DeliveryStat label="Delivered" value={delivered} icon={CheckCircle2} tone="bg-[#E5F6EC]" />
            <DeliveryStat label="Pending" value={pending} icon={Clock3} tone="bg-[#FFF8EE]" />
            <DeliveryStat label="Failed" value={failed} icon={XCircle} tone="bg-[#FDECEE]" />
          </dl>
        </>
      ) : (
        <p className="text-sm leading-6 text-ink/60">Delivery has not been reported yet.</p>
      )}

      {live?.units && (live.units.charged > 0 || live.units.refunded > 0) ? (
        <dl className="mt-4 grid gap-2 sm:grid-cols-3">
          {[
            ['Charged', live.units.charged],
            ['Refunded', live.units.refunded],
            ['Net', live.units.net],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-[#E7EEF8] bg-canvas px-3 py-2.5">
              <dt className="text-[11px] font-semibold tracking-wide text-ink/50 uppercase">{label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-navy tabular-nums">{formatCount(value)}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {reasonRows.length ? (
        <FailureReasonsPanel summary={failureSummary} rows={reasonRows} compact={compact} />
      ) : hasFailures ? (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-navy">Failure breakdown</h3>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            <FailureRow label="Undelivered" value={failures.undelivered} />
            <FailureRow label="Rejected" value={failures.rejected} />
            <FailureRow label="Expired" value={failures.expired} />
            <FailureRow label="Not sent" value={failures.notSent} />
          </dl>
        </div>
      ) : null}
    </div>
  )
}
