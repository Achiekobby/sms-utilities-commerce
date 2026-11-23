import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { apiErrorMessage } from '../../../../features/auth/client'
import { formatStamp } from '../../../../features/contacts/contactImport'
import { useGetSmsRecipientsQuery } from '../../../../services/api/messages/messagesApi'
import { formatCount } from '../../dashboard/format'
import { CampaignStatus } from '../../campaigns/sections/CampaignStatus'
import { formatStoredNumber, recipientStatusOptions } from '../model'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const field =
  'h-10 rounded-lg border border-ink/15 bg-white px-3 text-sm text-navy outline-none transition-colors focus:border-blue focus:ring-4 focus:ring-blue/15'
const head =
  'bg-[#F3F6FB] px-3 py-2.5 text-xs font-medium whitespace-nowrap text-ink/50 first:rounded-l-lg last:rounded-r-lg'
const cell = 'border-b border-ink/[0.06] px-3 py-3 text-sm text-ink/75'
const pageButton =
  'flex size-8 cursor-pointer items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue disabled:cursor-not-allowed disabled:opacity-40'

function pageList(current, count) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap-end', count]
  if (current >= count - 3) return [1, 'gap-start', count - 4, count - 3, count - 2, count - 1, count]
  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', count]
}

export function MessageRecipients({ smsId, className = '' }) {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const perPage = 50
  const query = useGetSmsRecipientsQuery(
    {
      smsId,
      page,
      perPage,
      status,
    },
    { skip: !smsId },
  )

  const rows = query.data?.rows ?? []
  const total = query.data?.total ?? 0
  const lastPage = query.data?.lastPage ?? 1
  const rangeStart = total === 0 ? 0 : (page - 1) * perPage + 1
  const rangeEnd = Math.min(page * perPage, total)

  function changeStatus(next) {
    setStatus(next)
    setPage(1)
  }

  return (
    <section aria-labelledby="message-recipients" className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="message-recipients" className="text-base font-bold text-navy">
            Recipients
          </h2>
          <p className="mt-1 text-sm text-ink/55">
            Delivery receipts for each number on this send
            {total ? ` · ${formatCount(total)} total` : ''}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="recipient-status" className="text-xs font-semibold text-ink/50">
            Status
          </label>
          <select
            id="recipient-status"
            value={status}
            onChange={(event) => changeStatus(event.target.value)}
            className={field}
          >
            <option value="">Any status</option>
            {recipientStatusOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {query.isLoading ? (
        <div role="status" className="mt-4 space-y-2">
          <span className="sr-only">Loading recipients</span>
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="skeleton block h-10 rounded-lg" />
          ))}
        </div>
      ) : null}

      {query.isError ? (
        <div
          role="alert"
          className="mt-4 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-[#9F1C26]">{apiErrorMessage(query.error)}</p>
          <button
            type="button"
            onClick={query.refetch}
            className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}
          >
            Try again
          </button>
        </div>
      ) : null}

      {!query.isLoading && !query.isError && !rows.length ? (
        <p className="mt-4 rounded-xl border border-dashed border-ink/15 bg-canvas px-4 py-8 text-center text-sm text-ink/55">
          {status ? 'No recipients match this status.' : 'No recipient receipts yet for this message.'}
        </p>
      ) : null}

      {!query.isLoading && rows.length ? (
        <>
          <ul className="mt-4 space-y-3 md:hidden">
            {rows.map((row) => (
              <li key={row.id} className="rounded-xl border border-ink/10 bg-canvas/60 px-3.5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-navy tabular-nums">{formatStoredNumber(row.to) || row.toRaw}</p>
                    {row.contactName ? <p className="mt-0.5 text-sm text-ink/60">{row.contactName}</p> : null}
                  </div>
                  <CampaignStatus status={row.status} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink/55">
                  <div>
                    <dt>Sent</dt>
                    <dd className="mt-0.5 text-sm text-navy">{formatStamp(row.sentAt) || '—'}</dd>
                  </div>
                  <div>
                    <dt>Delivered</dt>
                    <dd className="mt-0.5 text-sm text-navy">{formatStamp(row.deliveredAt) || '—'}</dd>
                  </div>
                </dl>
                {row.failureReason ? <p className="mt-2 text-xs text-[#9F1C26]">{row.failureReason}</p> : null}
              </li>
            ))}
          </ul>

          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-ink/[0.06] md:block">
            <table className="w-full min-w-[48rem] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  {['Number', 'Contact', 'Status', 'Units', 'Sent', 'Delivered'].map((label) => (
                    <th key={label} scope="col" className={head}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&>tr:last-child>*]:border-b-0">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className={`${cell} font-medium text-navy tabular-nums`}>
                      {formatStoredNumber(row.to) || row.toRaw || '—'}
                    </td>
                    <td className={cell}>{row.contactName || '—'}</td>
                    <td className={cell}>
                      <CampaignStatus status={row.status} />
                      {row.failureReason ? (
                        <p className="mt-1 max-w-[14rem] text-xs text-[#9F1C26]">{row.failureReason}</p>
                      ) : null}
                    </td>
                    <td className={`${cell} tabular-nums`}>{formatCount(row.unitsUsed)}</td>
                    <td className={cell}>{formatStamp(row.sentAt) || '—'}</td>
                    <td className={cell}>{formatStamp(row.deliveredAt) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {lastPage > 1 || total > 0 ? (
            <div className="mt-4 flex flex-col gap-3 border-t border-ink/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-ink/60 tabular-nums">
                Showing {formatCount(rangeStart)}–{formatCount(rangeEnd)} of {formatCount(total)}
              </p>
              {lastPage > 1 ? (
                <nav aria-label="Recipient pages" className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className={`${pageButton} ${focusClass}`}
                  >
                    <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                  {pageList(page, lastPage).map((item) =>
                    typeof item === 'string' ? (
                      <span key={item} aria-hidden="true" className="px-1 text-ink/40">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        aria-current={item === page ? 'page' : undefined}
                        onClick={() => setPage(item)}
                        className={`flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-2 text-[13px] font-semibold tabular-nums ${focusClass} ${
                          item === page
                            ? 'border border-blue bg-blue text-white'
                            : 'border border-ink/15 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
                        }`}
                      >
                        {formatCount(item)}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={page >= lastPage}
                    onClick={() => setPage((current) => Math.min(lastPage, current + 1))}
                    className={`${pageButton} ${focusClass}`}
                  >
                    <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                </nav>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
