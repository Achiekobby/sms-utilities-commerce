import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { SelectMenu } from '../../../../components/SelectMenu'
import { TypeBadge } from '../../../../components/TypeBadge'
import { paths } from '../../../../routes/paths'
import { useDisclosure } from '../../../../utils/hooks/useDisclosure'
import { usePagination } from '../../../../utils/hooks/usePagination'
import { formatCount } from '../../dashboard/format'
import { deliveryRate, formatCreated, messageCount, statusLabel, typeLabel } from '../model'
import { activeFilterCount, emptyFilters, queryCampaigns } from '../query'
import { CampaignFilterDrawer } from './CampaignFilterDrawer'
import { CampaignStatus } from './CampaignStatus'

const head =
  'bg-[#F3F6FB] px-3 py-2.5 text-xs font-medium whitespace-nowrap text-ink/50 first:rounded-l-lg last:rounded-r-lg'
const cell = 'border-b border-ink/[0.06] px-3 py-3.5 text-sm whitespace-nowrap text-ink/75'
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

function NameLink({ campaign, className }) {
  return (
    <Link to={paths.campaign(campaign.id)} className={`${className} ${focusClass} rounded-sm hover:text-blue`}>
      {campaign.name}
    </Link>
  )
}

function CampaignCard({ campaign }) {
  return (
    <li>
      <Link
        to={paths.campaign(campaign.id)}
        className={`block rounded-xl border border-[#D8E7FA] bg-white p-4 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)] transition-colors duration-200 hover:border-blue/40 ${focusClass}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-navy">{campaign.name}</p>
            <div className="mt-1.5">
              <TypeBadge type={campaign.type} />
            </div>
          </div>
          <CampaignStatus status={campaign.status} />
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-xs text-ink/50">Messages</dt>
            <dd className="mt-0.5 font-semibold text-navy tabular-nums">{formatCount(messageCount(campaign))}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Delivery</dt>
            <dd className="mt-0.5 font-semibold text-navy tabular-nums">{deliveryRate(campaign)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/50">Created</dt>
            <dd className="mt-0.5 font-medium text-ink/75">{formatCreated(campaign.createdAt)}</dd>
          </div>
        </dl>
      </Link>
    </li>
  )
}

function chipsFor(filters) {
  return [
    ...filters.statuses.map((id) => ({ key: `status-${id}`, group: 'statuses', id, label: statusLabel[id] })),
    ...filters.types.map((id) => ({ key: `type-${id}`, group: 'types', id, label: typeLabel(id) })),
    ...filters.senders.map((id) => ({ key: `sender-${id}`, group: 'senders', id, label: id })),
  ]
}

function FilterChips({ filters, onRemove }) {
  const chips = chipsFor(filters)
  if (!chips.length) return null

  return (
    <ul className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={() => onRemove(chip.group, chip.id)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-blue/20 bg-blue/[0.06] px-3 text-[13px] font-medium text-navy transition-colors hover:border-blue/40 ${focusClass}`}
          >
            {chip.label}
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
            <span className="sr-only">Remove {chip.label} filter</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function Pagination({ pager, total, pageSize, onPageSize }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] sm:justify-between">
      <p className="text-ink/60 tabular-nums">
        Showing {formatCount(pager.rangeStart)}–{formatCount(pager.rangeEnd)} of {formatCount(total)} campaigns
      </p>

      <nav aria-label="Campaign pages" className="flex items-center gap-1.5">
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
                item === pager.page
                  ? 'border-blue bg-blue text-white'
                  : 'border-ink/15 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
              }`}
            >
              {formatCount(item)}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Next page"
          disabled={pager.page === pager.pageCount}
          onClick={pager.next}
          className={pageButton}
        >
          <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </nav>

      <div className="flex items-center gap-2 text-ink/60">
        Show
        <SelectMenu
          label="Campaigns per page"
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

function EmptyResults({ query, filtered, onClear }) {
  const term = query.trim()

  return (
    <div className="mt-4 rounded-xl border border-dashed border-ink/15 bg-white px-4 py-12 text-center">
      <p className="text-sm font-semibold text-navy">No campaigns match</p>
      <p className="mt-1 text-sm text-ink/55">
        {term && filtered
          ? `Nothing matches “${term}” with these filters.`
          : term
            ? `Nothing matches “${term}”. Try a name, group, or sender.`
            : 'Nothing matches these filters.'}
      </p>
      <button
        type="button"
        onClick={onClear}
        className={`mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`}
      >
        <X size={15} strokeWidth={2.2} aria-hidden="true" />
        Clear search and filters
      </button>
    </div>
  )
}

export function CampaignList({ campaigns }) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const [pageSize, setPageSize] = useState(6)
  const drawer = useDisclosure()
  const filterCount = activeFilterCount(filters)
  const search = query.trim()

  const results = useMemo(
    () => queryCampaigns(campaigns, { search, ...filters }),
    [campaigns, search, filters],
  )
  const pager = usePagination({ total: results.length, pageSize })
  const page = results.slice(Math.max(pager.rangeStart - 1, 0), pager.rangeEnd)

  function resetPage() {
    pager.setPage(1)
  }

  function removeFilter(group, id) {
    setFilters((current) => ({ ...current, [group]: current[group].filter((item) => item !== id) }))
    resetPage()
  }

  function clearAll() {
    setQuery('')
    setFilters(emptyFilters)
    resetPage()
  }

  return (
    <section aria-label="Campaigns" className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search campaigns by name, group, or sender</span>
          <Search
            size={15}
            strokeWidth={2}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/45"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              resetPage()
            }}
            placeholder="Search by name, group, or sender"
            className="h-9 w-full rounded-lg border border-ink/15 bg-white pr-3 pl-9 text-[13px] text-navy placeholder:text-ink/45 focus-visible:border-blue/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
          />
        </label>

        <button
          type="button"
          onClick={drawer.open}
          aria-haspopup="dialog"
          aria-expanded={drawer.isOpen}
          className={`inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border px-3 text-[13px] font-semibold transition-colors ${focusClass} ${
            filterCount
              ? 'border-blue bg-blue/[0.06] text-navy'
              : 'border-ink/15 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
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
          {formatCount(results.length)} {results.length === 1 ? 'campaign' : 'campaigns'}
        </p>
        <FilterChips filters={filters} onRemove={removeFilter} />
        {filterCount || query ? (
          <button type="button" onClick={clearAll} className={`inline-flex items-center gap-1 text-[13px] font-semibold text-blue hover:text-blue/80 ${focusClass} rounded-sm`}>
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
            Clear all
          </button>
        ) : null}
      </div>

      {page.length ? (
        <>
          <ul className="mt-4 space-y-3 md:hidden">
            {page.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </ul>

          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-ink/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_12px_28px_-18px_rgba(11,31,91,0.45)] md:block sm:p-5">
            <table className="w-full min-w-[44rem] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th scope="col" className={head}>
                    Campaign name
                  </th>
                  <th scope="col" className={head}>
                    Type
                  </th>
                  <th scope="col" className={head}>
                    Messages
                  </th>
                  <th scope="col" className={head}>
                    Delivery rate
                  </th>
                  <th scope="col" className={head}>
                    Status
                  </th>
                  <th scope="col" className={head}>
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="[&>tr:last-child>*]:border-b-0">
                {page.map((campaign) => (
                  <tr key={campaign.id}>
                    <th scope="row" className={`${cell} text-left font-medium text-navy`}>
                      <NameLink campaign={campaign} />
                    </th>
                    <td className={cell}>
                      <TypeBadge type={campaign.type} />
                    </td>
                    <td className={`${cell} tabular-nums`}>{formatCount(messageCount(campaign))}</td>
                    <td className={`${cell} tabular-nums`}>{deliveryRate(campaign)}</td>
                    <td className={cell}>
                      <CampaignStatus status={campaign.status} />
                    </td>
                    <td className={cell}>{formatCreated(campaign.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
        <EmptyResults query={query} filtered={filterCount > 0} onClear={clearAll} />
      )}

      {drawer.isOpen ? (
        <CampaignFilterDrawer
          campaigns={campaigns}
          search={search}
          filters={filters}
          onApply={(next) => {
            setFilters(next)
            resetPage()
          }}
          onClose={drawer.close}
        />
      ) : null}
    </section>
  )
}
