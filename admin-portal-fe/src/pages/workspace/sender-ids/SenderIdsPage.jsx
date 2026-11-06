import { ChevronLeft, ChevronRight, IdCard, Search, X } from 'lucide-react'
import { useId, useState } from 'react'
import { useSearchParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/session'
import { usePermissions } from '../../../features/auth/usePermissions'
import { clientName, formatPhone, formatWhen, labelize, pageWindow } from '../../../features/clients/clientModel'
import { decisionWhen, senderStatuses, senderStatusTone } from '../../../features/sender-ids/senderModel'
import { useGetSenderIdsQuery } from '../../../services/api/sender-ids/senderIdsApi'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { ClientAvatar } from '../clients/ClientAvatar'
import { SenderIdDrawer } from './SenderIdDrawer'
import { SenderReviewDialogs } from './SenderReviewDialogs'
import { SenderRowMenu } from './SenderRowMenu'
import { cardClass, cellClass, focusClass, headClass } from './ui'

const permissions = ['sender_id.view', 'sender_id.approve', 'sender_id.blacklist']

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    wait: 'bg-[#FFF4DF] text-[#9A5B00]',
    bad: 'bg-[#FDECEE] text-[#9F1C26]',
    neutral: 'bg-[#F3F6FB] text-navy',
  }
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${tones[tone]}`}>{children}</span>
}

export function SenderIdsPage() {
  const access = usePermissions()
  const allowed = access.hasAnyPermission(permissions)
  const canReview = access.hasPermission('sender_id.approve')
  const searchId = useId()
  const [searchParams, setSearchParams] = useSearchParams()
  const status = senderStatuses.some((item) => item.value === (searchParams.get('status') ?? '')) ? searchParams.get('status') ?? '' : ''
  const requestedPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const [query, setQuery] = useState('')
  const [menuId, setMenuId] = useState(null)
  const [review, setReview] = useState(null)
  const [openId, setOpenId] = useState(null)
  const { data, isLoading, isFetching, isError, error, refetch } = useGetSenderIdsQuery(
    { page: requestedPage, status },
    { skip: !allowed },
  )

  if (!allowed) return <AccessDeniedPage />

  const records = Array.isArray(data?.data) ? data.data : []
  const needle = query.trim().toLowerCase()
  const visible = needle
    ? records.filter((record) => {
        const client = record.client
        const haystack = [record.name, record.rejection_reason, client ? clientName(client) : '', client?.email, client?.phone_number, client ? formatPhone(client.phone_number) : '']
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(needle)
      })
    : records
  const pages = pageWindow(
    data?.pagination ?? {
      current_page: requestedPage,
      per_page: records.length || 15,
      total: records.length,
      last_page: 1,
    },
  )
  const totalCount = pages.total
  const waiting = isLoading && !data
  const filtered = Boolean(status || needle)

  function writeParams(next) {
    const params = {}
    if (next.page > 1) params.page = String(next.page)
    if (next.status) params.status = next.status
    setSearchParams(params, { replace: true })
  }

  function chooseStatus(next) {
    writeParams({ page: 1, status: next })
  }

  function clearFilters() {
    setQuery('')
    writeParams({ page: 1, status: '' })
  }

  return (
    <div className="w-full min-w-0">
      <header className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)]">
        <div className="flex min-w-0 items-center gap-4 px-5 py-5 sm:px-6">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F0FF] text-blue ring-1 ring-blue/15">
            <IdCard size={22} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">Messaging</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h1 className="text-[1.75rem] leading-none font-bold tracking-tight text-navy">Sender IDs</h1>
              <span aria-live="polite" className="inline-flex h-6 items-center rounded-full bg-[#F3F6FB] px-2 text-xs font-semibold text-navy tabular-nums">
                {waiting ? '…' : totalCount}
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-5 text-ink/60">
              Names clients want to send from, including pending, approved, and rejected requests.
            </p>
          </div>
        </div>

        <div className="border-t border-ink/[0.06] bg-canvas/70 px-5 py-3 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <label htmlFor={searchId} className="sr-only">
                Search sender IDs on this page
              </label>
              <Search
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/35"
              />
              <input
                id={searchId}
                type="search"
                value={query}
                placeholder="Search sender ID, client, or email"
                onChange={(event) => setQuery(event.target.value)}
                className={`h-11 w-full rounded-xl border border-ink/10 bg-white pr-3 pl-10 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-blue ${focusClass}`}
              />
            </div>
            <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
              {senderStatuses.map((item) => {
                const selected = status === item.value
                return (
                  <button
                    key={item.label}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => chooseStatus(item.value)}
                    className={`inline-flex h-9 cursor-pointer items-center rounded-full border px-3 text-sm font-semibold ${focusClass} ${
                      selected ? 'border-blue bg-[#E7F0FF] text-navy' : 'border-ink/10 bg-white text-ink/70 hover:border-blue/40'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          </div>
          {filtered ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {status ? (
                <button
                  type="button"
                  aria-label={`Remove ${labelize(status)} filter`}
                  onClick={() => chooseStatus('')}
                  className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#E7F0FF] px-3 text-sm font-medium text-navy ${focusClass}`}
                >
                  <span aria-hidden="true">{labelize(status)}</span>
                  <X size={14} strokeWidth={2.2} aria-hidden="true" />
                </button>
              ) : null}
              <button type="button" onClick={clearFilters} className={`text-sm font-semibold text-blue ${focusClass}`}>
                Clear filters
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <section className={`${cardClass} mt-5`} aria-busy={isFetching || undefined}>
        {isError && !records.length ? (
          <div className="rounded-xl border border-[#E0232E]/20 bg-[#FDECEE] px-4 py-4" role="alert">
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
            <button
              type="button"
              onClick={refetch}
              className={`mt-3 inline-flex h-9 cursor-pointer items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white ${focusClass}`}
            >
              Try again
            </button>
          </div>
        ) : null}

        {waiting ? <SenderSkeleton /> : null}

        {!waiting && !isError && !records.length ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-navy">{filtered ? 'No sender IDs match' : 'No sender IDs yet'}</p>
            <p className="mt-1 text-sm text-ink/55">
              {filtered ? 'Try another status.' : 'Requests from clients will show up here.'}
            </p>
            {filtered ? (
              <button
                type="button"
                onClick={clearFilters}
                className={`mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg border border-ink/10 px-3 text-sm font-semibold text-navy hover:border-blue/40 ${focusClass}`}
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}

        {!waiting && records.length ? (
          <>
            {visible.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    {['Sender ID', 'Client', 'Status', 'Requested', 'Decision', 'Reason'].map((label) => (
                      <th key={label} scope="col" className={headClass}>
                        {label}
                      </th>
                    ))}
                    <th scope="col" className={`${headClass} text-right`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((record) => {
                    const client = record.client
                    const name = client ? clientName(client) : 'Unknown client'
                    return (
                      <tr
                        key={record.id}
                        className="cursor-pointer hover:bg-[#F7FAFC]"
                        onClick={() => setOpenId(record.id)}
                      >
                        <th scope="row" className={`${cellClass} font-semibold text-navy`}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setOpenId(record.id)
                            }}
                            className={`cursor-pointer font-semibold text-navy ${focusClass}`}
                          >
                            {record.name}
                          </button>
                        </th>
                        <td className={cellClass}>
                          <span className="flex min-w-0 items-center gap-3">
                            <ClientAvatar client={client} />
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-navy">{name}</span>
                              <span className="block truncate text-xs text-ink/50">{client?.email || `Client ${record.client_id}`}</span>
                            </span>
                          </span>
                        </td>
                        <td className={cellClass}>
                          <Badge tone={senderStatusTone(record.status)}>{labelize(record.status) || 'Unknown'}</Badge>
                        </td>
                        <td className={cellClass}>{formatWhen(record.created_at) || '—'}</td>
                        <td className={cellClass}>{formatWhen(decisionWhen(record)) || '—'}</td>
                        <td className={`${cellClass} max-w-56 truncate`}>{record.rejection_reason || '—'}</td>
                        <td className={`${cellClass} text-right`} onClick={(event) => event.stopPropagation()}>
                          <SenderRowMenu
                            name={record.name}
                            status={record.status}
                            canReview={canReview}
                            open={menuId === record.id}
                            onToggle={() => setMenuId((current) => (current === record.id ? null : record.id))}
                            onClose={() => setMenuId((current) => (current === record.id ? null : current))}
                            onView={() => setOpenId(record.id)}
                            onApprove={() => setReview({ record, mode: 'approve' })}
                            onReject={() => setReview({ record, mode: 'reject' })}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            ) : (
              <div className="py-8 text-center" role="status">
                <p className="text-sm font-semibold text-navy">No sender IDs match</p>
                <p className="mt-1 text-sm text-ink/55">Nothing on this page fits “{query.trim()}”.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className={`mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg border border-ink/10 px-3 text-sm font-semibold text-navy hover:border-blue/40 ${focusClass}`}
                >
                  Clear search
                </button>
              </div>
            )}
            <Pagination pages={pages} onPage={(next) => writeParams({ page: next, status })} />
            {pages.lastPage > 1 && needle ? (
              <p className="mt-3 text-xs text-ink/45">Search checks the sender IDs loaded on this page.</p>
            ) : null}
          </>
        ) : null}
      </section>
      {review ? <SenderReviewDialogs record={review.record} mode={review.mode} onClose={() => setReview(null)} /> : null}
      {openId ? <SenderIdDrawer id={openId} onClose={() => setOpenId(null)} /> : null}
    </div>
  )
}

function pageNumbers(current, last) {
  if (last <= 7) return Array.from({ length: last }, (_, index) => index + 1)
  const picked = new Set([1, last, current - 1, current, current + 1])
  if (current <= 3) [2, 3, 4].forEach((page) => picked.add(page))
  if (current >= last - 2) [last - 3, last - 2, last - 1].forEach((page) => picked.add(page))
  const sorted = [...picked].filter((page) => page >= 1 && page <= last).sort((left, right) => left - right)
  const numbers = []
  sorted.forEach((page, index) => {
    if (index && page - sorted[index - 1] > 1) numbers.push(`gap-${page}`)
    numbers.push(page)
  })
  return numbers
}

function Pagination({ pages, onPage }) {
  if (!pages.total) return null
  const numbers = pageNumbers(pages.current, pages.lastPage)
  return (
    <nav className="mt-4 flex flex-col gap-3 border-t border-ink/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Sender ID pages">
      <p className="text-sm text-ink/50">
        Showing {pages.from}–{pages.to} of {pages.total}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPage(pages.current - 1)}
          disabled={pages.current <= 1}
          className={`inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-ink/10 px-2.5 text-sm font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
        >
          <ChevronLeft size={16} aria-hidden="true" />
          Previous
        </button>
        {numbers.map((page) =>
          typeof page === 'string' ? (
            <span key={page} className="px-1 text-sm text-ink/35" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={page}
              type="button"
              aria-label={`Page ${page}`}
              aria-current={page === pages.current ? 'page' : undefined}
              onClick={() => onPage(page)}
              className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold ${focusClass} ${
                page === pages.current ? 'bg-navy text-white' : 'border border-ink/10 text-navy hover:bg-[#F4F7FC]'
              }`}
            >
              {page}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPage(pages.current + 1)}
          disabled={pages.current >= pages.lastPage}
          className={`inline-flex h-9 cursor-pointer items-center gap-1 rounded-lg border border-ink/10 px-2.5 text-sm font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
        >
          Next
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}

function SenderSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="skeleton size-9 rounded-full" />
          <div className="skeleton h-4 w-48 rounded-md" />
        </div>
      ))}
    </div>
  )
}
