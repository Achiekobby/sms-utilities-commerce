import { ChevronLeft, ChevronRight, Layers, Plus, Search, SlidersHorizontal, Star, X } from 'lucide-react'
import { useId, useState } from 'react'
import { useSearchParams } from 'react-router'
import { apiErrorMessage } from '../../../features/auth/session'
import { usePermissions } from '../../../features/auth/usePermissions'
import { pageWindow } from '../../../features/clients/clientModel'
import {
  activeFilterCount,
  describePlanFilters,
  emptyPlanFilters,
  formatUnits,
  labelize,
  money,
  monthSpan,
  planMatches,
  planMatchesFilters,
} from '../../../features/plans/planModel'
import { useGetPlansQuery } from '../../../services/api/plans/plansApi'
import { AccessDeniedPage } from '../AccessDeniedPage'
import { PlanDrawer } from './PlanDrawer'
import { PlanFilterDrawer } from './PlanFilterDrawer'
import { PlanRowMenu } from './PlanRowMenu'
import { cardClass, focusClass } from './ui'

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    featured: 'bg-[#FFF4DF] text-[#9A5B00]',
    neutral: 'bg-[#F3F6FB] text-navy',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function PlansPage() {
  const access = usePermissions()
  const allowed = access.hasPermission('plan.manage')
  const searchId = useId()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(emptyPlanFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [menuId, setMenuId] = useState(null)
  const [panel, setPanel] = useState(null)
  const requestedPage = Math.max(1, Number(searchParams.get('page')) || 1)
  const { data, isLoading, isFetching, isError, error, refetch } = useGetPlansQuery({ page: requestedPage }, { skip: !allowed })

  if (!allowed) return <AccessDeniedPage />

  const plans = Array.isArray(data?.data) ? data.data : []
  const filterCount = activeFilterCount(filters)
  const chips = describePlanFilters(filters)
  const narrowed = Boolean(query.trim()) || filterCount > 0
  const visible = plans.filter((plan) => planMatches(plan, query) && planMatchesFilters(plan, filters))
  const pages = pageWindow(
    data?.pagination ?? {
      current_page: requestedPage,
      per_page: plans.length || 15,
      total: plans.length,
      last_page: 1,
    },
  )
  const waiting = isLoading && !data

  function openPage(next) {
    setSearchParams(next <= 1 ? {} : { page: String(next) }, { replace: true })
  }

  function clearNarrowing() {
    setQuery('')
    setFilters(emptyPlanFilters)
  }

  return (
    <div className="w-full min-w-0">
      <header className="overflow-hidden rounded-2xl border border-ink/[0.06] bg-white shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)]">
        <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#E7F8F0] text-green ring-1 ring-green/15">
              <Layers size={22} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-green uppercase">Billing</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <h1 className="text-[1.75rem] leading-none font-bold tracking-tight text-navy">Plans</h1>
                <span aria-live="polite" className="inline-flex h-6 items-center rounded-full bg-[#F3F6FB] px-2 text-xs font-semibold text-navy tabular-nums">
                  {waiting ? '…' : pages.total}
                </span>
              </div>
              <p className="mt-1.5 max-w-xl text-sm leading-5 text-ink/60">
                Subscription lengths, SMS units, and prices clients can buy.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPanel({ mode: 'create' })}
            className={`inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 self-start rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#006B46] sm:self-center ${focusClass}`}
          >
            <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
            New plan
          </button>
        </div>

        <div className="border-t border-ink/[0.06] bg-canvas/70 px-5 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <label htmlFor={searchId} className="sr-only">
                Search plans on this page
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
                placeholder="Search plan name"
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

      <section className="mt-5" aria-busy={isFetching || undefined}>
        {isError && !plans.length ? (
          <div className="rounded-2xl border border-[#E0232E]/20 bg-[#FDECEE] px-5 py-4" role="alert">
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

        {waiting ? <PlanSkeleton /> : null}

        {!waiting && !isError && !plans.length ? (
          <div className={`${cardClass} py-10 text-center`}>
            <p className="text-sm font-semibold text-navy">No plans yet</p>
            <p className="mt-1 text-sm text-ink/55">Create a plan to set SMS units and prices.</p>
            <button
              type="button"
              onClick={() => setPanel({ mode: 'create' })}
              className={`mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg bg-green px-3 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
            >
              New plan
            </button>
          </div>
        ) : null}

        {!waiting && plans.length ? (
          <>
            {visible.length ? (
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((plan) => {
                  const details = Array.isArray(plan.details) ? plan.details : []
                  return (
                    <li key={plan.id} className="min-w-0">
                      <article
                        className={`flex h-full cursor-pointer flex-col rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_18px_40px_-28px_rgba(16,33,61,0.35)] transition-colors hover:border-green/40 ${
                          plan.is_featured ? 'border-[#E7C27A] ring-1 ring-[#E7C27A]/70' : 'border-ink/[0.06]'
                        }`}
                        onClick={() => setPanel({ mode: 'view', id: plan.id })}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setPanel({ mode: 'view', id: plan.id })
                              }}
                              className={`max-w-full cursor-pointer truncate text-left text-lg font-bold tracking-tight text-navy ${focusClass}`}
                            >
                              {plan.name}
                            </button>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Badge tone={plan.status === 'active' ? 'good' : 'neutral'}>{labelize(plan.status) || 'Unknown'}</Badge>
                              {plan.is_featured ? (
                                <Badge tone="featured">
                                  <Star size={11} strokeWidth={2.2} aria-hidden="true" className="mr-1" />
                                  Featured
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                          <div onClick={(event) => event.stopPropagation()}>
                            <PlanRowMenu
                              name={plan.name}
                              open={menuId === plan.id}
                              onToggle={() => setMenuId((current) => (current === plan.id ? null : plan.id))}
                              onClose={() => setMenuId(null)}
                              onView={() => setPanel({ mode: 'view', id: plan.id })}
                              onEdit={() => setPanel({ mode: 'edit', id: plan.id })}
                            />
                          </div>
                        </div>
                        {details.length ? (
                          <ul className="mt-4 space-y-2">
                            {details.map((row, index) => (
                              <li key={`${plan.id}-${row.months}-${index}`} className="rounded-xl bg-[#F7FAFC] px-3 py-2.5">
                                <div className="flex items-baseline justify-between gap-3">
                                  <span className="text-sm font-semibold text-navy">{monthSpan(row.months)}</span>
                                  <span className="text-sm font-semibold text-navy tabular-nums">{money(row.price)}</span>
                                </div>
                                <p className="mt-0.5 text-xs text-ink/50 tabular-nums">{formatUnits(row.units)} SMS units</p>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-4 text-sm text-ink/40">No durations</p>
                        )}
                      </article>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className={`${cardClass} py-10 text-center`} role="status">
                <p className="text-sm font-semibold text-navy">No plans match</p>
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
              <p className="mt-3 text-xs text-ink/45">Search and filters check the plans loaded on this page.</p>
            ) : null}
          </>
        ) : null}
      </section>

      {filtersOpen ? (
        <PlanFilterDrawer
          filters={filters}
          onApply={(next) => {
            setFilters(next)
            setFiltersOpen(false)
          }}
          onClose={() => setFiltersOpen(false)}
        />
      ) : null}
      {panel ? (
        <PlanDrawer
          mode={panel.mode}
          id={panel.id}
          onClose={() => setPanel(null)}
          onEdit={() => setPanel({ mode: 'edit', id: panel.id })}
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
    <nav className="mt-4 flex flex-col gap-3 border-t border-ink/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Plan pages">
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

function PlanSkeleton() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="skeleton h-56 rounded-2xl" />
      ))}
    </ul>
  )
}
