import { ChevronLeft, ChevronRight, Clock, Megaphone, MessageSquare, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { SelectMenu } from '../../../components/SelectMenu'
import { TypeBadge } from '../../../components/TypeBadge'
import { paths } from '../../../routes/paths'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { useDisclosure } from '../../../utils/hooks/useDisclosure'
import { usePagination } from '../../../utils/hooks/usePagination'
import { formatSendAt } from '../campaigns/model'
import { CampaignStatus } from '../campaigns/sections/CampaignStatus'
import { formatCount } from '../dashboard/format'
import { sendHasPassed, useScheduledQueue } from './queue'
import {
  ScheduleFilterDrawer,
  activeScheduleFilterCount,
  emptyScheduleFilters,
  querySchedule,
  scheduleFilterChips,
} from './sections/ScheduleFilterDrawer'
import { SourceBadge } from './sections/SourceBadge'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const pageButton =
  'flex size-8 items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue disabled:cursor-not-allowed disabled:opacity-40'
const pageSizeOptions = [6, 12, 24].map((size) => ({ id: String(size), label: String(size) }))

function pageList(current, count) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap-end', count]
  if (current >= count - 3) return [1, 'gap-start', count - 4, count - 3, count - 2, count - 1, count]
  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', count]
}

function Pagination({ pager, total, pageSize, onPageSize }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] sm:justify-between">
      <p className="text-ink/60 tabular-nums">
        Showing {formatCount(pager.rangeStart)}–{formatCount(pager.rangeEnd)} of {formatCount(total)} sends
      </p>
      <nav aria-label="Scheduled pages" className="flex items-center gap-1.5">
        <button type="button" aria-label="Previous page" disabled={pager.page === 1} onClick={pager.previous} className={pageButton}>
          <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
        {pageList(pager.page, pager.pageCount).map((item) =>
          typeof item === 'string' ? (
            <span key={item} aria-hidden="true" className="px-1 text-ink/40">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === pager.page ? 'page' : undefined}
              onClick={() => pager.setPage(item)}
              className={`h-8 min-w-8 rounded-lg border px-2 text-[13px] font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue ${
                item === pager.page ? 'border-blue bg-blue text-white' : 'border-ink/15 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
              }`}
            >
              {formatCount(item)}
            </button>
          ),
        )}
        <button type="button" aria-label="Next page" disabled={pager.page === pager.pageCount} onClick={pager.next} className={pageButton}>
          <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </nav>
      <div className="flex items-center gap-2 text-ink/60">
        Show
        <SelectMenu
          label="Sends per page"
          value={String(pageSize)}
          options={pageSizeOptions}
          onChange={onPageSize}
          compact
          placement="top"
          align="left"
          className="w-[4.25rem]"
          menuClassName="w-20"
        />
        per page
      </div>
    </div>
  )
}

export function ScheduledSmsPage() {
  useDocumentTitle('Scheduled')
  const queue = useScheduledQueue()
  const filtersOpen = useDisclosure()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(emptyScheduleFilters)
  const [pageSize, setPageSize] = useState(6)
  const filterCount = activeScheduleFilterCount(filters)
  const search = query.trim()
  const results = useMemo(() => querySchedule(queue, { search, ...filters }), [queue, search, filters])
  const pager = usePagination({ total: results.length, pageSize })
  const page = results.slice(Math.max(pager.rangeStart - 1, 0), pager.rangeEnd)
  const chips = scheduleFilterChips(filters)

  function resetPage() {
    pager.setPage(1)
  }

  function clearAll() {
    setQuery('')
    setFilters(emptyScheduleFilters)
    resetPage()
  }

  return (
    <div className="w-full">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem] lg:text-3xl">Scheduled</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60 sm:text-[15px]">
          Campaigns and messages waiting for their send time. Soonest first. Open one to see the full record.
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search scheduled sends</span>
          <Search size={15} strokeWidth={2} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/45" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              resetPage()
            }}
            placeholder="Search by name, audience, or sender"
            className="h-9 w-full rounded-lg border border-ink/15 bg-white pr-3 pl-9 text-[13px] text-navy placeholder:text-ink/45 focus-visible:border-blue/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
          />
        </label>
        <button
          type="button"
          onClick={filtersOpen.open}
          aria-haspopup="dialog"
          aria-expanded={filtersOpen.isOpen}
          className={`inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-[13px] font-semibold transition-colors ${focusClass} ${
            filterCount ? 'border-blue bg-blue/[0.06] text-navy' : 'border-ink/15 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
          }`}
        >
          <SlidersHorizontal size={15} strokeWidth={2.2} aria-hidden="true" />
          Filters
          {filterCount ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue px-1.5 text-[11px] font-bold text-white tabular-nums">
              {filterCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-[13px] text-ink/60 tabular-nums" aria-live="polite">
          {formatCount(results.length)} {results.length === 1 ? 'send' : 'sends'}
        </p>
        {chips.length ? (
          <ul className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <li key={chip.key}>
                <button
                  type="button"
                  onClick={() => {
                    setFilters((current) => ({ sources: current.sources.filter((item) => item !== chip.id) }))
                    resetPage()
                  }}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-blue/20 bg-blue/[0.06] px-3 text-[13px] font-medium text-navy transition-colors hover:border-blue/40 ${focusClass}`}
                >
                  {chip.label}
                  <X size={14} strokeWidth={2.2} aria-hidden="true" />
                  <span className="sr-only">Remove {chip.label} filter</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {filterCount || query ? (
          <button type="button" onClick={clearAll} className={`inline-flex items-center gap-1 rounded-sm text-[13px] font-semibold text-blue hover:text-blue/80 ${focusClass}`}>
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
            Clear all
          </button>
        ) : null}
      </div>

      {queue.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-ink/15 bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-navy">Nothing is waiting to send</p>
          <p className="mt-1 text-sm text-ink/55">Choose Schedule when you create a campaign or a message.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Link to={paths.newCampaign} className={`inline-flex h-9 items-center gap-1.5 rounded-lg bg-green px-3 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}>
              <Megaphone size={15} strokeWidth={2.2} aria-hidden="true" />
              Create campaign
            </Link>
            <Link to={paths.newMessage} className={`inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy hover:border-blue/40 hover:bg-canvas ${focusClass}`}>
              <MessageSquare size={15} strokeWidth={2.2} aria-hidden="true" />
              New message
            </Link>
          </div>
        </div>
      ) : results.length ? (
        <>
          <ul className="mt-4 grid gap-3">
            {page.map((row) => {
              const passed = sendHasPassed(row.sendAt)
              return (
                <li key={row.key}>
                  <Link
                    to={row.to}
                    className={`block rounded-xl border border-[#D8E7FA] bg-white p-4 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)] transition-colors hover:border-blue/40 ${focusClass}`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-bold text-navy">{row.name}</span>
                        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <SourceBadge source={row.source} />
                          <TypeBadge type={row.type} />
                        </span>
                      </span>
                      <CampaignStatus status="scheduled" />
                    </span>
                    <span className="mt-3 block text-sm text-ink/70">{row.audience}</span>
                    <span className="mt-3 flex flex-wrap items-end justify-between gap-3">
                      <span>
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                          <Clock size={15} strokeWidth={2.2} aria-hidden="true" className="text-green" />
                          {row.sendAt ? formatSendAt(row.sendAt) : 'No send time'}
                        </span>
                        {passed ? <span className="mt-1 block text-xs font-medium text-[#B45F06]">Send time has passed</span> : null}
                      </span>
                      <span className="text-right">
                        <span className="block text-xs text-ink/50">Recipients</span>
                        <span className="text-sm font-semibold text-navy tabular-nums">{formatCount(row.recipients)}</span>
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
          <Pagination
            pager={pager}
            total={results.length}
            pageSize={pageSize}
            onPageSize={(value) => {
              setPageSize(Number(value))
              resetPage()
            }}
          />
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-ink/15 bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-navy">No scheduled sends match</p>
          <p className="mt-1 text-sm text-ink/55">
            {search ? `Nothing matches “${search}”.` : 'Nothing matches these filters.'}
          </p>
          <button
            type="button"
            onClick={clearAll}
            className={`mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`}
          >
            <X size={15} strokeWidth={2.2} aria-hidden="true" />
            Clear search and filters
          </button>
        </div>
      )}

      {filtersOpen.isOpen ? (
        <ScheduleFilterDrawer
          rows={queue}
          search={search}
          filters={filters}
          onApply={(next) => {
            setFilters(next)
            resetPage()
          }}
          onClose={filtersOpen.close}
        />
      ) : null}
    </div>
  )
}
