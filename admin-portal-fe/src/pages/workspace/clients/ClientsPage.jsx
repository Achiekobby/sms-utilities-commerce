import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, UserPlus, Users, X } from 'lucide-react'
import { useId, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/session'
import {
  activeFilterCount,
  clientMatches,
  clientMatchesFilters,
  clientName,
  describeClientFilters,
  emptyClientFilters,
  formatPhone,
  labelize,
  money,
  pageWindow,
} from '../../../features/clients/clientModel'
import { usePermissions } from '../../../features/auth/usePermissions'
import { paths } from '../../../routes/paths'
import { useNotify } from '../../../features/notifications/useNotify'
import { useGetClientsQuery, useUpdateClientStatusMutation } from '../../../services/api/clients/clientsApi'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { ConfirmDialog } from '../profile/settings/ConfirmDialog'
import { ClientAvatar } from './ClientAvatar'
import { ClientFilterDrawer } from './ClientFilterDrawer'
import { ClientRowMenu } from './ClientRowMenu'
import { cardClass, cellClass, focusClass, headClass } from './ui'

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    wait: 'bg-[#FFF4DF] text-[#9A5B00]',
    info: 'bg-[#E7F0FF] text-blue',
    neutral: 'bg-[#F3F6FB] text-navy',
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  )
}

function accountTone(type) {
  return type === 'business' ? 'neutral' : 'info'
}

export function ClientsPage() {
  const access = usePermissions()
  const allowed = access.hasPermission('client.manage')
  const canOnboard = access.hasPermission('onboarding.client')
  const canViewSubscriptions = access.hasAnyPermission(['subscription.view', 'subscription.assign'])
  const navigate = useNavigate()
  const searchId = useId()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(emptyClientFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [menuId, setMenuId] = useState(null)
  const [statusTarget, setStatusTarget] = useState(null)
  const [statusError, setStatusError] = useState('')
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateClientStatusMutation()
  const notify = useNotify()
  const requestedPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const { data, isLoading, isFetching, isError, error, refetch } = useGetClientsQuery(
    { page: requestedPage },
    { skip: !allowed },
  )

  if (!allowed) return <AccessDeniedPage />

  const clients = Array.isArray(data?.data) ? data.data : []
  const filterCount = activeFilterCount(filters)
  const chips = describeClientFilters(filters)
  const narrowed = Boolean(query.trim()) || filterCount > 0
  const visible = clients.filter((client) => clientMatches(client, query) && clientMatchesFilters(client, filters))
  const pages = pageWindow(
    data?.pagination ?? {
      current_page: requestedPage,
      per_page: clients.length || 15,
      total: clients.length,
      last_page: 1,
    },
  )
  const totalCount = pages.total
  const waiting = isLoading && !data

  function openPage(next) {
    setSearchParams(next <= 1 ? {} : { page: String(next) }, { replace: true })
  }

  function openClient(id) {
    navigate(`${paths.clients}/${id}`)
  }

  function clearNarrowing() {
    setQuery('')
    setFilters(emptyClientFilters)
  }

  async function confirmStatus() {
    if (!statusTarget) return
    const nextStatus = statusTarget.status === 'active' ? 'inactive' : 'active'
    try {
      const result = await updateStatus({ id: statusTarget.id, status: nextStatus }).unwrap()
      setStatusTarget(null)
      setStatusError('')
      notify.success(result?.message || 'Client status updated.')
    } catch (statusFailure) {
      const message = apiErrorMessage(statusFailure)
      setStatusError(message)
      notify.error(message)
    }
  }

  return (
    <div className="w-full min-w-0">
      <header className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)]">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F8F0] text-green ring-1 ring-green/15">
              <Users size={22} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-green uppercase">Customers</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <h1 className="text-[1.75rem] leading-none font-bold tracking-tight text-navy">Clients</h1>
                <span
                  aria-live="polite"
                  className="inline-flex h-6 items-center rounded-full bg-[#F3F6FB] px-2 text-xs font-semibold text-navy tabular-nums"
                >
                  {waiting ? '…' : totalCount}
                </span>
              </div>
              <p className="mt-1.5 max-w-xl text-sm leading-5 text-ink/60">
                Individual and business accounts, including who onboarded them and whether they have verified.
              </p>
            </div>
          </div>
          {canOnboard ? (
            <Link
              to={paths.clientOnboarding}
              className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] sm:self-center ${focusClass}`}
            >
              <UserPlus size={16} strokeWidth={2.2} aria-hidden="true" />
              Onboard a client
            </Link>
          ) : null}
        </div>

        <div className="border-t border-ink/[0.06] bg-canvas/70 px-5 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <label htmlFor={searchId} className="sr-only">
                Search clients on this page
              </label>
              <Search
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/35"
              />
              <input
                id={searchId}
                value={query}
                placeholder="Search name, email, or phone"
                onChange={(event) => setQuery(event.target.value)}
                className={`h-11 w-full rounded-xl border border-ink/10 bg-white pr-3 pl-10 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-green ${focusClass}`}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-expanded={filtersOpen}
                onClick={() => setFiltersOpen(true)}
                className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${focusClass} ${
                  filterCount ? 'border-green bg-[#E7F8F0] text-navy' : 'border-ink/10 bg-white text-navy hover:border-green/40'
                }`}
              >
                <SlidersHorizontal size={16} strokeWidth={2} aria-hidden="true" />
                Filters
                {filterCount ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-green px-1.5 text-[11px] font-semibold text-white">
                    {filterCount}
                  </span>
                ) : null}
              </button>
              {narrowed && !waiting ? (
                <p className="text-sm whitespace-nowrap text-ink/50" aria-live="polite">
                  {visible.length} shown
                </p>
              ) : null}
            </div>
          </div>

          {chips.length ? (
            <ul aria-label="Active filters" className="mt-3 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    aria-label={`Remove ${chip.label} filter`}
                    onClick={() => setFilters((current) => ({ ...current, [chip.key]: '' }))}
                    className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#E7F8F0] px-3 text-sm font-medium text-navy hover:bg-[#d7f3e6] ${focusClass}`}
                  >
                    <span aria-hidden="true">{chip.label}</span>
                    <X size={14} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </header>

      <section className={`${cardClass} mt-5`} aria-busy={isFetching || undefined}>
        {isError && !clients.length ? (
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

        {waiting ? <ClientSkeleton /> : null}

        {!waiting && !isError && !clients.length ? (
          <div className="mt-8 mb-4 text-center">
            <p className="text-sm font-semibold text-navy">No clients yet</p>
            <p className="mt-1 text-sm text-ink/55">Onboard an individual or a business and they will appear here.</p>
          </div>
        ) : null}

        {!waiting && clients.length ? (
          <>
            {visible.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[64rem] border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    {['Client', 'Type', 'Phone', 'Location', 'Status', 'Verification', 'Onboarding', 'Wallet'].map((label) => (
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
                  {visible.map((client) => {
                    const name = clientName(client)
                    const place = [client.city, client.region].filter(Boolean).join(', ')
                    return (
                      <tr
                        key={client.id}
                        className="cursor-pointer hover:bg-[#F7FAF8]"
                        onClick={() => openClient(client.id)}
                      >
                        <th scope="row" className={`${cellClass} font-medium text-navy`}>
                          <Link
                            to={`${paths.clients}/${client.id}`}
                            className={`flex min-w-0 items-center gap-3 ${focusClass}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <ClientAvatar client={client} />
                            <span className="min-w-0">
                              <span className="block truncate">{name}</span>
                              <span className="block truncate text-xs font-normal text-ink/50">{client.email}</span>
                            </span>
                          </Link>
                        </th>
                        <td className={cellClass}>
                          <Badge tone={accountTone(client.account_type)}>{labelize(client.account_type)}</Badge>
                        </td>
                        <td className={cellClass}>{formatPhone(client.phone_number) || '—'}</td>
                        <td className={cellClass}>{place || '—'}</td>
                        <td className={cellClass}>
                          <Badge tone={client.status === 'active' ? 'good' : 'neutral'}>{labelize(client.status) || 'Unknown'}</Badge>
                        </td>
                        <td className={cellClass}>
                          <Badge tone={client.is_verified ? 'good' : 'wait'}>{client.is_verified ? 'Verified' : 'Unverified'}</Badge>
                        </td>
                        <td className={cellClass}>{client.onboarding_type === 'admin' ? 'Admin' : 'Self'}</td>
                        <td className={cellClass}>
                          {client.wallet ? money(client.wallet.balance, client.wallet.currency) : 'No wallet'}
                        </td>
                        <td className={`${cellClass} text-right`} onClick={(event) => event.stopPropagation()}>
                          <ClientRowMenu
                            name={name}
                            active={client.status === 'active'}
                            open={menuId === client.id}
                            onToggle={() => setMenuId((current) => (current === client.id ? null : client.id))}
                            onClose={() => setMenuId((current) => (current === client.id ? null : current))}
                            onView={() => openClient(client.id)}
                            onSubscriptions={
                              canViewSubscriptions ? () => navigate(`${paths.subscriptions}?client_id=${client.id}`) : undefined
                            }
                            onStatus={() => {
                              setStatusError('')
                              setStatusTarget(client)
                            }}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            ) : (
              <div className="mt-8 mb-2 text-center" role="status">
                <p className="text-sm font-semibold text-navy">No clients match</p>
                <p className="mt-1 text-sm text-ink/55">Nothing on this page fits the search or filters.</p>
                <button
                  type="button"
                  onClick={clearNarrowing}
                  className={`mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg border border-ink/10 px-3 text-sm font-semibold text-navy hover:border-green/40 ${focusClass}`}
                >
                  Clear search and filters
                </button>
              </div>
            )}
            <Pagination pages={pages} onPage={openPage} />
            {pages.lastPage > 1 && narrowed ? (
              <p className="mt-3 text-xs text-ink/45">Search and filters check the clients loaded on this page.</p>
            ) : null}
          </>
        ) : null}
      </section>
      {filtersOpen ? (
        <ClientFilterDrawer filters={filters} onApply={(next) => { setFilters(next); setFiltersOpen(false) }} onClose={() => setFiltersOpen(false)} />
      ) : null}
      {statusTarget ? (
        <ConfirmDialog
          title={statusTarget.status === 'active' ? `Deactivate ${clientName(statusTarget)}?` : `Activate ${clientName(statusTarget)}?`}
          description={
            statusTarget.status === 'active'
              ? 'They will stay on the platform, but the account will be inactive until you turn it back on.'
              : 'They will be able to use this account again.'
          }
          confirmLabel={statusTarget.status === 'active' ? 'Deactivate client' : 'Activate client'}
          tone={statusTarget.status === 'active' ? 'warning' : 'caution'}
          error={statusError}
          busy={updatingStatus}
          onConfirm={confirmStatus}
          onClose={() => {
            if (updatingStatus) return
            setStatusTarget(null)
            setStatusError('')
          }}
        />
      ) : null}
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
    <nav className="mt-4 flex flex-col gap-3 border-t border-ink/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Client pages">
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
                page === pages.current ? 'bg-navy text-white' : 'border border-ink/10 text-navy hover:bg-[#F4FBF7]'
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

function ClientSkeleton() {
  return (
    <div className="mt-5 space-y-3" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="skeleton size-9 rounded-full" />
          <div className="skeleton h-4 w-48 rounded-md" />
        </div>
      ))}
    </div>
  )
}
