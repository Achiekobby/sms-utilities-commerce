import { BadgeCheck, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/session'
import { usePermissions } from '../../../features/auth/usePermissions'
import { clientName, pageWindow } from '../../../features/clients/clientModel'
import { formatUnits, formatWhen, labelize, money, subscriptionStatuses } from '../../../features/subscriptions/subscriptionModel'
import { paths } from '../../../routes/paths'
import { useGetSubscriptionsQuery } from '../../../services/api/subscriptions/subscriptionsApi'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { ClientAvatar } from '../clients/ClientAvatar'
import { SubscriptionArchives } from './SubscriptionArchives'
import { SubscriptionDrawer } from './SubscriptionDrawer'
import { SubscriptionFilterDrawer } from './SubscriptionFilterDrawer'
import { TopUpDrawer } from './TopUpDrawer'
import { cardClass, cellClass, focusClass, headClass } from './ui'

const permissions = ['subscription.view', 'subscription.assign']

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    bad: 'bg-[#FDECEE] text-[#9F1C26]',
    neutral: 'bg-[#F3F6FB] text-navy',
  }
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${tones[tone]}`}>{children}</span>
}

function statusTone(status) {
  if (status === 'active') return 'good'
  if (status === 'expired') return 'bad'
  return 'neutral'
}

export function SubscriptionsPage() {
  const access = usePermissions()
  const allowed = access.hasAnyPermission(permissions)
  const canAssign = access.hasPermission('subscription.assign')
  const canOpenClient = access.hasPermission('client.manage')
  const [searchParams, setSearchParams] = useSearchParams()
  const status = subscriptionStatuses.some((item) => item.value === (searchParams.get('status') ?? '')) ? searchParams.get('status') ?? '' : ''
  const clientId = /^\d+$/.test(searchParams.get('client_id') ?? '') ? searchParams.get('client_id') : ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [open, setOpen] = useState(null)
  const [topUp, setTopUp] = useState(null)
  const { data, isLoading, isFetching, isError, error, refetch } = useGetSubscriptionsQuery(
    { page, clientId, status },
    { skip: !allowed },
  )

  if (!allowed) return <AccessDeniedPage />

  const records = Array.isArray(data?.data) ? data.data : []
  const pages = pageWindow(
    data?.pagination ?? { current_page: page, per_page: records.length || 15, total: records.length, last_page: 1 },
  )
  const waiting = isLoading && !data
  const filterCount = Number(Boolean(status)) + Number(Boolean(clientId))

  function write(next) {
    const params = {}
    if (next.page > 1) params.page = String(next.page)
    if (next.status) params.status = next.status
    if (next.clientId) params.client_id = next.clientId
    setSearchParams(params, { replace: true })
  }

  return (
    <div className="w-full min-w-0">
      <header className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)]">
        <div className="flex min-w-0 items-center gap-4 px-5 py-5 sm:px-6">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F8F0] text-green ring-1 ring-green/15">
            <BadgeCheck size={22} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-green uppercase">Customers</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h1 className="text-[1.75rem] leading-none font-bold tracking-tight text-navy">Subscriptions</h1>
              <span aria-live="polite" className="inline-flex h-6 items-center rounded-full bg-[#F3F6FB] px-2 text-xs font-semibold text-navy tabular-nums">
                {waiting ? '…' : pages.total}
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-5 text-ink/60">Plans attached to clients, including trials and credit that does not expire.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-ink/[0.06] bg-canvas/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
            {subscriptionStatuses.map((item) => {
              const selected = status === item.value
              return (
                <button
                  key={item.label}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => write({ page: 1, status: item.value, clientId })}
                  className={`inline-flex h-9 cursor-pointer items-center rounded-full border px-3 text-sm font-semibold ${focusClass} ${
                    selected ? 'border-green bg-[#E7F8F0] text-navy' : 'border-ink/10 bg-white text-ink/70 hover:border-green/40'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          <button
            type="button"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen(true)}
            className={`inline-flex h-11 cursor-pointer items-center gap-2 self-start rounded-xl border px-3 text-sm font-semibold ${focusClass} ${
              filterCount ? 'border-green bg-[#E7F8F0] text-navy' : 'border-ink/10 bg-white text-navy hover:border-green/40'
            }`}
          >
            <SlidersHorizontal size={16} strokeWidth={2} aria-hidden="true" />
            Filters
            {filterCount ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-green px-1.5 text-[11px] font-semibold text-white">{filterCount}</span>
            ) : null}
          </button>
        </div>
        {clientId || status ? (
          <div className="flex flex-wrap items-center gap-2 px-5 pb-4 sm:px-6">
            {status ? (
              <button
                type="button"
                aria-label={`Remove ${labelize(status)} filter`}
                onClick={() => write({ page: 1, status: '', clientId })}
                className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#E7F8F0] px-3 text-sm font-medium text-navy ${focusClass}`}
              >
                {labelize(status)}
                <X size={14} strokeWidth={2.2} aria-hidden="true" />
              </button>
            ) : null}
            {clientId ? (
              <span className="inline-flex h-8 items-center gap-2 rounded-full bg-[#E7F8F0] pl-3 text-sm font-medium text-navy">
                Client {clientId}
                {canOpenClient ? (
                  <Link to={`${paths.clients}/${clientId}`} className={`font-semibold text-green ${focusClass}`}>
                    Open
                  </Link>
                ) : null}
                <button
                  type="button"
                  aria-label={`Remove client ${clientId} filter`}
                  onClick={() => write({ page: 1, status, clientId: '' })}
                  className={`inline-flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-[#d7f3e6] ${focusClass}`}
                >
                  <X size={14} strokeWidth={2.2} aria-hidden="true" />
                </button>
              </span>
            ) : null}
          </div>
        ) : null}
      </header>

      <section className={`${cardClass} mt-5`} aria-busy={isFetching || undefined}>
        {isError && !records.length ? (
          <div role="alert">
            <p className="text-sm text-[#9F1C26]">{apiErrorMessage(error)}</p>
            <button type="button" onClick={refetch} className={`mt-3 inline-flex h-9 cursor-pointer items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white ${focusClass}`}>
              Try again
            </button>
          </div>
        ) : null}
        {waiting ? (
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : null}
        {!waiting && !isError && !records.length ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-navy">{filterCount ? 'No subscriptions match' : 'No subscriptions yet'}</p>
            <p className="mt-1 text-sm text-ink/55">{filterCount ? 'Try another status or client.' : 'Client plans will show up here.'}</p>
          </div>
        ) : null}
        {!waiting && records.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[56rem] border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    {['Client', 'Plan', 'Type', 'Status', 'Units', 'Price', 'Starts', 'Ends'].map((label) => (
                      <th key={label} scope="col" className={headClass}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const client = record.client
                    const name = client ? clientName(client) : `Client ${record.client_id}`
                    return (
                      <tr key={record.id} className="cursor-pointer hover:bg-[#F7FAFC]" onClick={() => setOpen(record)}>
                        <th scope="row" className={`${cellClass} font-semibold text-navy`}>
                          <span className="flex min-w-0 items-center gap-3">
                            <ClientAvatar client={client} />
                            <span className="min-w-0">
                              {canOpenClient ? (
                                <Link
                                  to={`${paths.clients}/${record.client_id}`}
                                  onClick={(event) => event.stopPropagation()}
                                  className={`block truncate font-semibold text-navy hover:text-green ${focusClass}`}
                                >
                                  {name}
                                </Link>
                              ) : (
                                <span className="block truncate">{name}</span>
                              )}
                              <span className="block truncate text-xs font-normal text-ink/50">{client?.email || `Client ${record.client_id}`}</span>
                            </span>
                          </span>
                        </th>
                        <td className={cellClass}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setOpen(record)
                            }}
                            className={`cursor-pointer font-semibold text-navy ${focusClass}`}
                          >
                            {record.plan_name || 'Plan'}
                          </button>
                        </td>
                        <td className={cellClass}>{labelize(record.type) || '—'}</td>
                        <td className={cellClass}>
                          <Badge tone={statusTone(record.status)}>{labelize(record.status) || 'Unknown'}</Badge>
                        </td>
                        <td className={`${cellClass} tabular-nums`}>{formatUnits(record.units) || '—'}</td>
                        <td className={`${cellClass} tabular-nums`}>{money(record.price) || '—'}</td>
                        <td className={cellClass}>{formatWhen(record.starts_at) || '—'}</td>
                        <td className={cellClass}>{record.ends_at ? formatWhen(record.ends_at) : 'No end date'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination pages={pages} onPage={(next) => write({ page: next, status, clientId })} />
          </>
        ) : null}
      </section>

      {clientId ? (
        <section className={`${cardClass} mt-5`}>
          <h2 className="text-lg font-bold tracking-tight text-navy">Subscription history</h2>
          <p className="mt-0.5 text-sm text-ink/55">Earlier plans recorded for this client.</p>
          <SubscriptionArchives clientId={clientId} />
        </section>
      ) : null}

      {filtersOpen ? (
        <SubscriptionFilterDrawer
          status={status}
          clientId={clientId}
          onApply={(next) => {
            write({ page: 1, ...next })
            setFiltersOpen(false)
          }}
          onClose={() => setFiltersOpen(false)}
        />
      ) : null}
      {open ? (
        <SubscriptionDrawer
          subscription={open}
          onClose={() => setOpen(null)}
          onTopUp={
            canAssign
              ? () =>
                  setTopUp({
                    clientId: open.client_id,
                    clientName: open.client ? clientName(open.client) : `Client ${open.client_id}`,
                  })
              : null
          }
        />
      ) : null}
      {topUp ? (
        <TopUpDrawer
          clientId={topUp.clientId}
          clientName={topUp.clientName}
          onActivated={() => setOpen(null)}
          onClose={() => setTopUp(null)}
        />
      ) : null}
    </div>
  )
}

function pageNumbers(current, last) {
  if (last <= 7) return Array.from({ length: last }, (_, index) => index + 1)
  const picked = new Set([1, last, current - 1, current, current + 1])
  if (current <= 3) [2, 3, 4].forEach((item) => picked.add(item))
  if (current >= last - 2) [last - 3, last - 2, last - 1].forEach((item) => picked.add(item))
  const sorted = [...picked].filter((item) => item >= 1 && item <= last).sort((left, right) => left - right)
  const numbers = []
  sorted.forEach((item, index) => {
    if (index && item - sorted[index - 1] > 1) numbers.push(`gap-${item}`)
    numbers.push(item)
  })
  return numbers
}

function Pagination({ pages, onPage }) {
  if (!pages.total) return null
  const numbers = pageNumbers(pages.current, pages.lastPage)
  return (
    <nav className="mt-4 flex flex-col gap-3 border-t border-ink/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Subscription pages">
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
        {numbers.map((item) =>
          typeof item === 'string' ? (
            <span key={item} className="px-1 text-sm text-ink/35" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === pages.current ? 'page' : undefined}
              onClick={() => onPage(item)}
              className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-sm font-semibold ${focusClass} ${
                item === pages.current ? 'bg-navy text-white' : 'border border-ink/10 text-navy hover:bg-[#F4FBF7]'
              }`}
            >
              {item}
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
