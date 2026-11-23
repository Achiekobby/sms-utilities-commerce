import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { SelectMenu } from '../../../../components/SelectMenu'
import { TypeBadge } from '../../../../components/TypeBadge'
import { useApiErrorToast } from '../../../../features/notifications/useApiErrorToast'
import { paths } from '../../../../routes/paths'
import { useGetContactGroupsQuery } from '../../../../services/api/contacts/contactsApi'
import { useGetCampaignsQuery } from '../../../../services/api/campaigns/campaignsApi'
import { useDebouncedValue } from '../../../../utils/hooks/useDebouncedValue'
import { useDisclosure } from '../../../../utils/hooks/useDisclosure'
import { formatCount } from '../../dashboard/format'
import {
  audienceLabel,
  deliveryRate,
  messageCount,
  scheduleLabel,
  statusLabel,
  typeLabel,
} from '../model'
import { withGroupNames } from '../fromApi'
import { activeFilterCount, emptyFilters, typeTabs } from '../query'
import { CampaignActions } from './CampaignActions'
import { CampaignFilterDrawer } from './CampaignFilterDrawer'
import { CampaignMetrics } from './CampaignMetrics'
import { CampaignSourceBadge, campaignSourceMeta } from './CampaignSourceBadge'
import { CampaignStatus } from './CampaignStatus'
import { CampaignsEmpty } from './CampaignsEmpty'

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

function CampaignKind({ campaign }) {
  if (campaignSourceMeta(campaign.source)) return <CampaignSourceBadge source={campaign.source} />
  return <TypeBadge type={campaign.type} />
}

function NameLink({ campaign, className = '' }) {
  return (
    <Link to={paths.campaign(campaign.id)} className={`${className} ${focusClass} rounded-sm hover:text-blue`}>
      {campaign.name}
    </Link>
  )
}

function CampaignCard({ campaign }) {
  return (
    <li className="rounded-xl border border-[#D8E7FA] bg-white p-4 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <NameLink campaign={campaign} className="block truncate text-[15px] font-bold text-navy" />
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <CampaignKind campaign={campaign} />
            <CampaignStatus status={campaign.status} />
          </div>
        </div>
        <CampaignActions campaign={campaign} includeView iconOnly />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-ink/50">Audience</dt>
          <dd className="mt-0.5 truncate font-medium text-navy">{audienceLabel(campaign)}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink/50">Schedule</dt>
          <dd className="mt-0.5 font-medium text-ink/75">{scheduleLabel(campaign)}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink/50">Delivery</dt>
          <dd className="mt-0.5 font-semibold text-navy tabular-nums">{deliveryRate(campaign)}</dd>
        </div>
      </dl>
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
  if (!total) return null

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
        <button type="button" aria-label="Next page" disabled={pager.page === pager.pageCount} onClick={pager.next} className={pageButton}>
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
            ? `Nothing matches “${term}”. Try a name, audience, or sender.`
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

export function CampaignList() {
  const [query, setQuery] = useState('')
  const [typeTab, setTypeTab] = useState('all')
  const [filters, setFilters] = useState(emptyFilters)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)
  const drawer = useDisclosure()
  const filterCount = activeFilterCount(filters)
  const search = useDebouncedValue(query.trim())
  const type = typeTab !== 'all' ? typeTab : filters.types
  const list = useGetCampaignsQuery({
    page,
    perPage: pageSize,
    search,
    type,
    status: filters.statuses,
    sender: filters.senders,
  })
  const groups = useGetContactGroupsQuery()
  useApiErrorToast(list.error, list.isError && !list.isFetching)
  useApiErrorToast(groups.error, groups.isError && !groups.isFetching)
  const total = list.data?.total ?? 0
  const knownCount = list.data?.lastPage
  const pageCount = knownCount ? Math.max(1, knownCount) : 1
  const currentPage = knownCount ? Math.min(page, pageCount) : page
  const campaigns = useMemo(
    () => (list.data?.rows ?? []).map((campaign) => withGroupNames(campaign, groups.data)),
    [groups.data, list.data?.rows],
  )
  const pager = {
    page: currentPage,
    pageCount,
    rangeStart: total === 0 ? 0 : (currentPage - 1) * pageSize + 1,
    rangeEnd: Math.min(currentPage * pageSize, total),
    setPage,
    next() {
      setPage((value) => Math.min(pageCount, value + 1))
    },
    previous() {
      setPage((value) => Math.max(1, value - 1))
    },
  }
  const filtered = filterCount > 0 || typeTab !== 'all' || Boolean(search)

  function resetPage() {
    setPage(1)
  }

  function removeFilter(group, id) {
    setFilters((current) => {
      return { ...current, [group]: current[group].filter((item) => item !== id) }
    })
    resetPage()
  }

  function clearAll() {
    setQuery('')
    setTypeTab('all')
    setFilters(emptyFilters)
    resetPage()
  }

  if (list.isSuccess && !total && !filtered && !query.trim()) return <CampaignsEmpty />

  return (
    <>
    {campaigns.length ? <CampaignMetrics campaigns={campaigns} /> : null}
    <section aria-label="Campaigns" className="mt-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Campaign type" className="flex flex-wrap gap-1.5 rounded-xl bg-[#F3F6FB] p-1">
          {typeTabs.map((tab) => {
            const selected = typeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setTypeTab(tab.id)
                  resetPage()
                }}
                className={`h-8 rounded-lg px-3 text-[13px] font-semibold transition-colors ${focusClass} ${
                  selected ? 'bg-white text-navy shadow-[0_1px_2px_rgba(16,33,61,0.08)]' : 'text-ink/60 hover:text-navy'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1 sm:w-72">
            <span className="sr-only">Search campaigns</span>
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
              placeholder="Search campaigns"
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
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-[13px] text-ink/60 tabular-nums" aria-live="polite">
          {formatCount(total)} {total === 1 ? 'campaign' : 'campaigns'}
        </p>
        <FilterChips filters={filters} onRemove={removeFilter} />
        {filterCount || query || typeTab !== 'all' ? (
          <button
            type="button"
            onClick={clearAll}
            className={`inline-flex items-center gap-1 rounded-sm text-[13px] font-semibold text-blue hover:text-blue/80 ${focusClass}`}
          >
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
            Clear all
          </button>
        ) : null}
      </div>

      {list.isLoading ? (
        <div role="status" className="mt-4 space-y-2">
          <span className="sr-only">Loading campaigns</span>
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="skeleton block h-14 rounded-xl" />
          ))}
        </div>
      ) : list.isError ? (
        <div role="alert" className="mt-4 flex flex-col gap-3 rounded-xl border border-[#E0232E]/25 bg-[#FDECEE] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#9F1C26]">Campaigns could not be loaded.</p>
          <button type="button" onClick={list.refetch} className={`h-9 rounded-lg bg-white px-3 text-sm font-semibold text-navy ${focusClass}`}>
            Try again
          </button>
        </div>
      ) : campaigns.length ? (
        <>
          <ul className="mt-4 space-y-3 md:hidden">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </ul>

          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-ink/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_12px_28px_-18px_rgba(11,31,91,0.45)] md:block sm:p-5">
            <table className="w-full min-w-[64rem] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  {['Campaign', 'Type', 'Audience', 'Status', 'Schedule / Trigger', 'Sent', 'Delivery rate', 'Actions'].map(
                    (label) => (
                      <th key={label} scope="col" className={head}>
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="[&>tr:last-child>*]:border-b-0">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <th scope="row" className={`${cell} text-left font-medium text-navy`}>
                      <NameLink campaign={campaign} />
                    </th>
                    <td className={cell}>
                      <CampaignKind campaign={campaign} />
                    </td>
                    <td className={`${cell} max-w-[12rem] truncate`}>{audienceLabel(campaign)}</td>
                    <td className={cell}>
                      <CampaignStatus status={campaign.status} />
                    </td>
                    <td className={`${cell} max-w-[14rem] truncate`}>{scheduleLabel(campaign)}</td>
                    <td className={`${cell} tabular-nums`}>
                      {campaign.delivered == null && campaign.sent == null ? '—' : formatCount(messageCount(campaign))}
                    </td>
                    <td className={`${cell} tabular-nums`}>{deliveryRate(campaign)}</td>
                    <td className={cell}>
                      <CampaignActions campaign={campaign} includeView iconOnly />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            pager={pager}
            total={total}
            pageSize={pageSize}
            onPageSize={(value) => {
              setPageSize(Number(value))
              resetPage()
            }}
          />
        </>
      ) : (
        <EmptyResults query={query} filtered={filtered} onClear={clearAll} />
      )}

      {drawer.isOpen ? (
        <CampaignFilterDrawer
          campaigns={campaigns}
          filters={filters}
          onApply={(next) => {
            setFilters(next)
            resetPage()
          }}
          onClose={drawer.close}
        />
      ) : null}
    </section>
    </>
  )
}
