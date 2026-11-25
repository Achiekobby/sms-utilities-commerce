import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDisclosure } from '../../../../utils/hooks/useDisclosure'
import { formatCount } from '../../dashboard/format'
import { TypeBadge } from '../../../../components/TypeBadge'
import { CampaignStatus } from '../../campaigns/sections/CampaignStatus'
import { formatCreated, messageCount } from '../../campaigns/model'
import { useGroups } from '../../contacts/useGroups'
import { messageDeliveryRate } from '../model'
import {
  activeMessageFilterCount,
  emptyMessageFilters,
  messageFilterChips,
  queryMessages,
} from '../query'
import { KindBadge } from './KindBadge'
import { MessageActions } from './MessageActions'
import { MessageDetailsDrawer } from './MessageDetailsDrawer'
import { MessageFilterDrawer } from './MessageFilterDrawer'
import { MessagesEmpty } from './MessagesEmpty'
import { useMessageActions } from './useMessageActions'

const messagePreview =
  'block w-full min-w-0 max-w-full truncate text-left'

const head =
  'bg-[#F3F6FB] px-3 py-2.5 text-xs font-medium whitespace-nowrap text-ink/50 first:rounded-l-lg last:rounded-r-lg'
const cell = 'border-b border-ink/[0.06] px-3 py-3.5 text-sm whitespace-nowrap text-ink/75'
const messageCell = `${cell} max-w-[14rem] overflow-hidden sm:max-w-[18rem] lg:max-w-[22rem]`
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const pageButton =
  'flex size-8 cursor-pointer items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue disabled:cursor-not-allowed disabled:opacity-40'

function pageList(current, count) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap-end', count]
  if (current >= count - 3) return [1, 'gap-start', count - 4, count - 3, count - 2, count - 1, count]
  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', count]
}

function FilterChips({ filters, groups, onRemove }) {
  const chips = messageFilterChips(filters, groups)
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

function Pagination({ page, lastPage, total, perPage, onPageChange }) {
  if (!total || lastPage < 2) {
    if (!total) return null
    return (
      <div className="mt-4 border-t border-ink/[0.06] pt-4">
        <p className="text-[13px] text-ink/60 tabular-nums">
          Showing {formatCount(1)}–{formatCount(Math.min(perPage, total))} of {formatCount(total)}
        </p>
      </div>
    )
  }

  const rangeStart = (page - 1) * perPage + 1
  const rangeEnd = Math.min(page * perPage, total)

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-ink/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-ink/60 tabular-nums">
        Showing {formatCount(rangeStart)}–{formatCount(rangeEnd)} of {formatCount(total)}
      </p>
      <nav aria-label="Message pages" className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
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
              aria-label={`Page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={`flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-2 text-[13px] font-semibold tabular-nums transition-colors ${focusClass} ${
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
          onClick={() => onPageChange(page + 1)}
          className={`${pageButton} ${focusClass}`}
        >
          <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </nav>
    </div>
  )
}

export function MessageList({
  messages,
  filters,
  onFiltersChange,
  page,
  lastPage,
  total,
  perPage,
  onPageChange,
  fetching = false,
}) {
  const [selected, setSelected] = useState(null)
  const drawer = useDisclosure()
  const { groups } = useGroups()
  const actions = useMessageActions({
    onDone: () => setSelected(null),
  })
  const filterCount = activeMessageFilterCount(filters)
  const hasSearch = Boolean(filters.search.trim())
  const results = useMemo(() => queryMessages(messages, filters), [messages, filters])
  const narrowed = filterCount > 0 || hasSearch
  const emptyWorkspace = !total && !narrowed

  function clearAll() {
    onFiltersChange(emptyMessageFilters)
  }

  if (emptyWorkspace) return <MessagesEmpty />

  return (
    <section aria-label="Messages" className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-ink/60 tabular-nums" aria-live="polite">
          {formatCount(hasSearch ? results.length : total)}{' '}
          {(hasSearch ? results.length : total) === 1 ? 'report' : 'reports'}
          {narrowed ? ' match' : ''}
          {fetching ? ' · Updating…' : ''}
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <label className="relative w-full min-w-48 flex-1 sm:max-w-sm">
            <span className="sr-only">Search messages</span>
            <Search
              size={15}
              strokeWidth={2}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/45"
            />
            <input
              type="search"
              value={filters.search}
              placeholder="Search message, source, sender, group…"
              onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
              className={`h-9 w-full rounded-lg border border-ink/15 bg-white pr-3 pl-9 text-[13px] text-navy placeholder:text-ink/45 focus-visible:border-blue/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue ${focusClass}`}
            />
          </label>
          <button
            type="button"
            onClick={drawer.open}
            aria-haspopup="dialog"
            aria-expanded={drawer.isOpen}
            className={`inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-lg border px-3 text-[13px] font-semibold transition-colors sm:self-auto ${focusClass} ${
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

      {filterCount > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <FilterChips
            filters={filters}
            groups={groups}
            onRemove={(group) => {
              onFiltersChange({ ...filters, [group]: '' })
            }}
          />
          <button
            type="button"
            onClick={() => onFiltersChange({ ...emptyMessageFilters, search: filters.search })}
            className={`inline-flex items-center gap-1 rounded-sm text-[13px] font-semibold text-blue hover:text-blue/80 ${focusClass}`}
          >
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
            Clear filters
          </button>
        </div>
      ) : null}

      {results.length ? (
        <>
          <ul className="mt-4 space-y-3 md:hidden">
            {results.map((message) => (
              <li
                key={message.id}
                className="rounded-xl border border-[#D8E7FA] bg-white p-4 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      title={message.body || message.name}
                      onClick={() => setSelected(message)}
                      className={`block w-full min-w-0 truncate text-left text-[15px] font-bold text-navy hover:text-blue ${focusClass}`}
                    >
                      {message.name}
                    </button>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <KindBadge kind={message.kind} />
                      {message.source ? <TypeBadge type={message.source} /> : null}
                    </div>
                  </div>
                  <CampaignStatus status={message.status} />
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-ink/50">Recipients</dt>
                    <dd className="mt-0.5 font-semibold text-navy tabular-nums">{formatCount(message.recipients)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink/50">Delivery</dt>
                    <dd className="mt-0.5 font-semibold text-navy tabular-nums">{messageDeliveryRate(message)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink/50">Created</dt>
                    <dd className="mt-0.5 font-medium text-ink/75">{formatCreated(message.createdAt)}</dd>
                  </div>
                </dl>
                <div className="mt-4">
                  <MessageActions
                    message={message}
                    actions={actions}
                    includeView
                    onView={setSelected}
                    iconOnly
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-ink/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_12px_28px_-18px_rgba(11,31,91,0.45)] md:block sm:p-5">
            <table className="w-full min-w-[64rem] border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  {['Message', 'Message type', 'Source', 'Recipients', 'Messages', 'Delivery', 'Status', 'Created', 'Actions'].map(
                    (label) => (
                      <th key={label} scope="col" className={head}>
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="[&>tr:last-child>*]:border-b-0">
                {results.map((message) => (
                  <tr key={message.id}>
                    <th scope="row" className={`${messageCell} text-left font-medium text-navy`}>
                      <button
                        type="button"
                        title={String(message.body || message.name || '').trim() || undefined}
                        onClick={() => setSelected(message)}
                        className={`${messagePreview} rounded-sm hover:text-blue ${focusClass}`}
                      >
                        {message.name}
                      </button>
                    </th>
                    <td className={cell}>
                      <KindBadge kind={message.kind} />
                    </td>
                    <td className={cell}>
                      {message.source ? <TypeBadge type={message.source} /> : <span className="text-ink/40">—</span>}
                    </td>
                    <td className={`${cell} tabular-nums`}>{formatCount(message.recipients)}</td>
                    <td className={`${cell} tabular-nums`}>{formatCount(messageCount(message))}</td>
                    <td className={`${cell} tabular-nums`}>{messageDeliveryRate(message)}</td>
                    <td className={cell}>
                      <CampaignStatus status={message.status} />
                    </td>
                    <td className={cell}>{formatCreated(message.createdAt)}</td>
                    <td className={cell}>
                      <MessageActions
                        message={message}
                        actions={actions}
                        includeView
                        onView={setSelected}
                        iconOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={page}
              lastPage={lastPage}
              total={total}
              perPage={perPage}
              onPageChange={onPageChange}
            />
          </div>

          <div className="md:hidden">
            <Pagination
              page={page}
              lastPage={lastPage}
              total={total}
              perPage={perPage}
              onPageChange={onPageChange}
            />
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-ink/15 bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold text-navy">No reports match</p>
          <p className="mt-1 text-sm text-ink/55">
            {filters.search.trim()
              ? `Nothing matches “${filters.search.trim()}” with these filters.`
              : 'Nothing matches these filters.'}
          </p>
          <button
            type="button"
            onClick={clearAll}
            className={`mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`}
          >
            <X size={15} strokeWidth={2.2} aria-hidden="true" />
            Clear filters
          </button>
        </div>
      )}

      {drawer.isOpen ? (
        <MessageFilterDrawer
          filters={filters}
          groups={groups}
          onApply={(draft) => onFiltersChange({ ...draft, search: filters.search })}
          onClose={drawer.close}
        />
      ) : null}

      {selected ? (
        <MessageDetailsDrawer message={selected} onClose={() => setSelected(null)} actions={actions} />
      ) : null}

      {actions.dialog}
    </section>
  )
}
