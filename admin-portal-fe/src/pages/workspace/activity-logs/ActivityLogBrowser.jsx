import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react'
import { useId, useState } from 'react'
import { apiErrorMessage } from '../../../features/auth/session'
import { pageWindow } from '../../../features/clients/clientModel'
import {
  actionTone,
  activeDrawerCount,
  describeActivityFilters,
  emptyActivityFilters,
  filterChoices,
  formatWhen,
  labelize,
  partyLabel,
} from '../../../features/activity-logs/activityModel'
import { useGetActivityFiltersQuery, useGetActivityLogsQuery, useGetClientActivityLogsQuery } from '../../../services/api/activity-logs/activityLogsApi'
import { ActivityFilterDrawer } from './ActivityFilterDrawer'
import { ActivityLogDrawer } from './ActivityLogDrawer'
import { cardClass, cellClass, focusClass, headClass } from './ui'

function Badge({ children, tone = 'neutral' }) {
  const tones = {
    good: 'bg-[#E7F8F0] text-green',
    wait: 'bg-[#FFF4DF] text-[#9A5B00]',
    bad: 'bg-[#FDECEE] text-[#9F1C26]',
    neutral: 'bg-[#F3F6FB] text-navy',
  }
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${tones[tone]}`}>{children}</span>
}

export function ActivityLogBrowser({ clientId = '', filters, page, onChange, onPage }) {
  const searchId = useId()
  const scoped = Boolean(clientId)
  const [draft, setDraft] = useState(filters.search ?? '')
  const [seenSearch, setSeenSearch] = useState(filters.search ?? '')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [openLog, setOpenLog] = useState(null)
  if (seenSearch !== (filters.search ?? '')) {
    setSeenSearch(filters.search ?? '')
    setDraft(filters.search ?? '')
  }

  const filterQuery = useGetActivityFiltersQuery()
  const listQuery = useGetActivityLogsQuery({ page, filters }, { skip: scoped })
  const clientQuery = useGetClientActivityLogsQuery({ clientId, page, filters }, { skip: !scoped })
  const query = scoped ? clientQuery : listQuery
  const { data, isLoading, isFetching, isError, error, refetch } = query
  const choices = filterChoices(filterQuery.data?.data)
  const logs = Array.isArray(data?.data) ? data.data : []
  const pages = pageWindow(
    data?.pagination ?? {
      current_page: page,
      per_page: logs.length || 15,
      total: logs.length,
      last_page: 1,
    },
  )
  const waiting = isLoading && !data
  const filterCount = activeDrawerCount(filters, { includeClientId: !scoped })
  const chips = describeActivityFilters(filters, { includeClientId: !scoped })
  const narrowed = Boolean(filters.search) || filterCount > 0

  function commitSearch(value) {
    const next = value.trim()
    if (next === (filters.search ?? '')) return
    onChange({ ...filters, search: next })
  }

  function clearChip(key) {
    onChange({ ...filters, [key]: '' })
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="relative min-w-0 flex-1"
          onSubmit={(event) => {
            event.preventDefault()
            commitSearch(draft)
          }}
        >
          <label htmlFor={searchId} className="sr-only">
            Search activity
          </label>
          <Search size={16} strokeWidth={2} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink/35" />
          <input
            id={searchId}
            type="search"
            value={draft}
            placeholder="Search activity"
            onChange={(event) => {
              const value = event.target.value
              setDraft(value)
              if (!value.trim()) commitSearch('')
            }}
            className={`h-11 w-full rounded-xl border border-ink/10 bg-white pr-3 pl-10 text-sm text-ink outline-none placeholder:text-ink/35 focus:border-blue ${focusClass}`}
          />
        </form>
        <button
          type="button"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen(true)}
          className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${focusClass} ${
            filterCount ? 'border-blue bg-[#E7F0FF] text-navy' : 'border-ink/10 bg-white text-navy hover:border-blue/40'
          }`}
        >
          <SlidersHorizontal size={16} strokeWidth={2} aria-hidden="true" />
          Filters
          {filterCount ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1.5 text-[11px] font-semibold text-white">
              {filterCount}
            </span>
          ) : null}
        </button>
      </div>

      {chips.length ? (
        <ul aria-label="Active filters" className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                aria-label={`Remove ${chip.label} filter`}
                onClick={() => clearChip(chip.key)}
                className={`inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-[#E7F0FF] px-3 text-sm font-medium text-navy ${focusClass}`}
              >
                <span aria-hidden="true">{chip.label}</span>
                <X size={14} strokeWidth={2.2} aria-hidden="true" />
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => onChange({ ...emptyActivityFilters, search: filters.search })}
              className={`text-sm font-semibold text-blue ${focusClass}`}
            >
              Clear filters
            </button>
          </li>
        </ul>
      ) : null}

      <section className={`${cardClass} mt-4`} aria-busy={isFetching || undefined}>
        {isError && !logs.length ? (
          <div role="alert">
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

        {waiting ? (
          <div className="space-y-3" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="skeleton h-12 rounded-xl" />
            ))}
          </div>
        ) : null}

        {!waiting && !isError && !logs.length ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-navy">{narrowed ? 'No activity matches' : 'No activity yet'}</p>
            <p className="mt-1 text-sm text-ink/55">
              {narrowed ? 'Try another search or filter.' : scoped ? 'Actions on this account will show up here.' : 'Actions across the platform will show up here.'}
            </p>
          </div>
        ) : null}

        {!waiting && logs.length ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[52rem] border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    {['When', 'Activity', 'Module', 'Action', 'Actor', 'By'].map((label) => (
                      <th key={label} scope="col" className={headClass}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="cursor-pointer hover:bg-[#F7FAFC]" onClick={() => setOpenLog(log)}>
                      <td className={cellClass}>{formatWhen(log.created_at)}</td>
                      <th scope="row" className={`${cellClass} whitespace-normal font-semibold text-navy`}>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setOpenLog(log)
                          }}
                          className={`cursor-pointer text-left font-semibold text-navy ${focusClass}`}
                        >
                          {log.title || 'Activity'}
                        </button>
                      </th>
                      <td className={cellClass}>
                        <Badge>{labelize(log.module) || '—'}</Badge>
                      </td>
                      <td className={cellClass}>
                        <Badge tone={actionTone(log.action)}>{labelize(log.action) || '—'}</Badge>
                      </td>
                      <td className={cellClass}>{labelize(log.actor) || '—'}</td>
                      <td className={`${cellClass} max-w-[14rem] truncate`}>{partyLabel(log.transmitter) || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pages={pages} onPage={onPage} />
          </>
        ) : null}
      </section>

      {filtersOpen ? (
        <ActivityFilterDrawer
          filters={filters}
          choices={choices}
          choicesLoading={filterQuery.isLoading}
          choicesError={filterQuery.isError}
          includeClientId={!scoped}
          onApply={(next) => {
            onChange({ ...filters, ...next })
            setFiltersOpen(false)
          }}
          onClose={() => setFiltersOpen(false)}
        />
      ) : null}
      {openLog ? <ActivityLogDrawer log={openLog} onClose={() => setOpenLog(null)} /> : null}
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
    <nav className="mt-4 flex flex-col gap-3 border-t border-ink/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between" aria-label="Activity pages">
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
                item === pages.current ? 'bg-navy text-white' : 'border border-ink/10 text-navy hover:bg-[#F4F7FB]'
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
