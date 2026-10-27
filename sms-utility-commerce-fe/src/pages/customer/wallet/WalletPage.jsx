import { ChevronLeft, ChevronRight, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { SelectMenu } from '../../../components/SelectMenu'
import { paths } from '../../../routes/paths'
import { useDocumentTitle } from '../../../utils/hooks/useDocumentTitle'
import { useDisclosure } from '../../../utils/hooks/useDisclosure'
import { usePagination } from '../../../utils/hooks/usePagination'
import { formatCreated } from '../campaigns/model'
import { formatCount } from '../dashboard/format'
import { formatUnits, smsRateUnits } from './money'
import { activeWalletFilterCount, emptyWalletFilters, queryEntries, walletFilterChips } from './query'
import { EntryStatusBadge, EntryTypeBadge } from './sections/EntryBadge'
import { EntryDetail } from './sections/EntryDetail'
import { WalletFilterDrawer } from './sections/WalletFilterDrawer'

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
        Showing {formatCount(pager.rangeStart)}–{formatCount(pager.rangeEnd)} of {formatCount(total)} entries
      </p>
      <nav aria-label="Wallet pages" className="flex items-center gap-1.5">
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
          label="Entries per page"
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

export function WalletPage() {
  useDocumentTitle('Wallet')
  const balance = useSelector((state) => state.wallet.balance)
  const entries = useSelector((state) => state.wallet.entries)
  const filtersOpen = useDisclosure()
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(emptyWalletFilters)
  const [pageSize, setPageSize] = useState(6)
  const [selectedId, setSelectedId] = useState(null)
  const filterCount = activeWalletFilterCount(filters)
  const search = query.trim()
  const results = useMemo(() => queryEntries(entries, { search, ...filters }), [entries, search, filters])
  const pager = usePagination({ total: results.length, pageSize })
  const page = results.slice(Math.max(pager.rangeStart - 1, 0), pager.rangeEnd)
  const chips = walletFilterChips(filters)
  const selected = entries.find((entry) => entry.id === selectedId) ?? null

  function resetPage() {
    pager.setPage(1)
  }

  function clearAll() {
    setQuery('')
    setFilters(emptyWalletFilters)
    resetPage()
  }

  return (
    <div className="w-full">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy sm:text-[1.75rem] lg:text-3xl">Wallet</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink/60 sm:text-[15px]">
            Money kept for this workspace. Campaigns and messages are paid from here at {formatUnits(smsRateUnits)} per segment.
          </p>
        </div>
        <Link
          to={paths.walletTopUp}
          className={`inline-flex h-10 items-center gap-1.5 rounded-lg bg-green px-3.5 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
        >
          <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
          Top up
        </Link>
      </header>

      <section className="mt-6 rounded-xl border border-[#D8E7FA] bg-white p-5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_12px_28px_-18px_rgba(11,31,91,0.45)]">
        <p className="text-sm font-medium text-ink/55">Available balance</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-navy tabular-nums">{formatUnits(balance)}</p>
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search wallet activity</span>
          <Search size={15} strokeWidth={2} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/45" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              resetPage()
            }}
            placeholder="Search by description or reference"
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
          {formatCount(results.length)} {results.length === 1 ? 'entry' : 'entries'}
        </p>
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => {
              setFilters((current) => ({ ...current, [chip.group]: current[chip.group].filter((item) => item !== chip.id) }))
              resetPage()
            }}
            className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-blue/20 bg-blue/[0.06] px-3 text-[13px] font-medium text-navy transition-colors hover:border-blue/40 ${focusClass}`}
          >
            {chip.label}
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
            <span className="sr-only">Remove {chip.label} filter</span>
          </button>
        ))}
        {filterCount || query ? (
          <button type="button" onClick={clearAll} className={`inline-flex items-center gap-1 rounded-sm text-[13px] font-semibold text-blue hover:text-blue/80 ${focusClass}`}>
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
            Clear all
          </button>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-ink/15 bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-navy">Your wallet is empty</p>
          <p className="mt-1 text-sm text-ink/55">Top up to send a campaign or a message.</p>
          <Link
            to={paths.walletTopUp}
            className={`mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-green px-3 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
          >
            <Plus size={15} strokeWidth={2.2} aria-hidden="true" />
            Top up
          </Link>
        </div>
      ) : results.length ? (
        <>
          <ul className="mt-4 grid gap-3">
            {page.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(entry.id)}
                  className={`flex w-full items-start justify-between gap-3 rounded-xl border border-[#D8E7FA] bg-white p-4 text-left shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)] transition-colors hover:border-blue/40 ${focusClass}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-bold text-navy">{entry.description}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <EntryTypeBadge type={entry.type} />
                      <EntryStatusBadge status={entry.status} />
                    </span>
                    <span className="mt-2 block text-xs text-ink/50">{formatCreated(entry.createdAt)}</span>
                  </span>
                  <span className={`shrink-0 text-sm font-bold tabular-nums ${entry.type === 'credit' ? 'text-green' : 'text-navy'}`}>
                    {entry.type === 'credit' ? '+' : '−'}
                    {formatUnits(entry.amount)}
                  </span>
                </button>
              </li>
            ))}
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
          <p className="text-sm font-semibold text-navy">No wallet entries match</p>
          <p className="mt-1 text-sm text-ink/55">{search ? `Nothing matches “${search}”.` : 'Nothing matches these filters.'}</p>
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
        <WalletFilterDrawer
          entries={entries}
          search={search}
          filters={filters}
          onApply={(next) => {
            setFilters(next)
            resetPage()
          }}
          onClose={filtersOpen.close}
        />
      ) : null}
      {selected ? <EntryDetail entry={selected} onClose={() => setSelectedId(null)} /> : null}
    </div>
  )
}
