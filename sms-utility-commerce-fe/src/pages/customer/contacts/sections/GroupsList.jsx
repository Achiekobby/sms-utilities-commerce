import { Archive, ArrowRight, ChevronLeft, ChevronRight, Clock, Pencil, RotateCcw, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { SelectMenu } from '../../../../components/SelectMenu'
import { paths } from '../../../../routes/paths'
import { usePagination } from '../../../../utils/hooks/usePagination'
import { formatCount, parseISODate } from '../../dashboard/format'
import { groupSorts } from '../data'
import { insightStatuses } from '../insights'

const pageSizeOptions = [6, 12, 24].map((size) => ({ id: String(size), label: String(size) }))

const pageButton =
  'flex size-8 items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue disabled:cursor-not-allowed disabled:opacity-40'

// 1 2 3 4 5 … last, with the window following the current page.
function pageList(current, count) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap-end', count]
  if (current >= count - 3) return [1, 'gap-start', count - 4, count - 3, count - 2, count - 1, count]
  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', count]
}

const updatedFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const sorters = {
  count: (a, b) => b.count - a.count,
  updated: (a, b) => b.updated.localeCompare(a.updated),
  name: (a, b) => a.name.localeCompare(b.name),
}

function StatusBar({ breakdown, total }) {
  return (
    <div
      role="img"
      aria-label={insightStatuses.map((status) => `${breakdown[status.key]} ${status.label.toLowerCase()}`).join(', ')}
      className="flex h-2 gap-px overflow-hidden rounded-full bg-[#EEF3FA]"
    >
      {insightStatuses.map((status) => (
        <span
          key={status.key}
          className="h-full min-w-[3px]"
          style={{ width: `${total ? (breakdown[status.key] / total) * 100 : 0}%`, backgroundColor: status.color }}
        />
      ))}
    </div>
  )
}

function GroupCardSkeleton() {
  return (
    <li className="rounded-xl border border-[#D8E7FA] bg-white p-4" aria-hidden="true">
      <div className="flex items-start gap-3">
        <span className="skeleton size-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <span className="skeleton block h-4 w-2/3 rounded" />
          <span className="skeleton block h-3 w-full rounded" />
        </div>
      </div>
      <span className="skeleton mt-4 block h-7 w-24 rounded" />
      <span className="skeleton mt-3 block h-2 w-full rounded-full" />
      <span className="skeleton mt-4 block h-3 w-36 rounded" />
    </li>
  )
}

function GroupCard({ group, archived = false, onEdit, onArchive, onRestore, onDiscard }) {
  const Icon = group.icon

  return (
    <li className="flex">
      <article className="flex w-full flex-col rounded-xl border border-[#D8E7FA] bg-white p-4 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)] transition-colors hover:border-blue/40">
        <div className="flex items-start gap-3">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: group.tint, color: group.color }}
          >
            <Icon size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-bold text-navy">{group.name}</h3>
            <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-ink/60">{group.description}</p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            {archived ? null : (
              <button
                type="button"
                onClick={() => onEdit?.(group)}
                aria-label={`Edit ${group.name}`}
                className="flex size-9 items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                <Pencil size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
            {archived ? null : (
              <button
                type="button"
                onClick={() => onArchive?.(group)}
                aria-label={`Archive ${group.name}`}
                className="flex size-9 items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 transition-colors hover:border-[#B45F06]/40 hover:bg-[#FFF8EE] hover:text-[#B45F06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                <Archive size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 flex items-baseline gap-1.5">
          <span className="text-2xl leading-7 font-bold tracking-tight text-navy tabular-nums">
            {formatCount(group.count)}
          </span>
          <span className="text-[13px] text-ink/55">contacts</span>
        </p>

        <div className="my-3">
          <StatusBar breakdown={group.breakdown} total={group.count} />
          <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
            {insightStatuses.map((status) => (
              <li key={status.key} className="flex items-center gap-1.5 text-xs text-ink/65">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                <span className="truncate">{status.label}</span>
                <span className="ml-auto font-semibold text-navy tabular-nums">
                  {formatCount(group.breakdown[status.key])}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-ink/[0.08] pt-3">
          <span className="flex items-center gap-1.5 text-xs whitespace-nowrap text-ink/50">
            <Clock size={13} strokeWidth={2.2} aria-hidden="true" className={archived ? 'text-[#B45F06]' : 'text-green'} />
            {archived ? 'Archived' : 'Updated'} {updatedFormat.format(parseISODate(archived ? group.archivedAt || group.updated : group.updated))}
          </span>
          {archived ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onDiscard?.(group)}
                className="inline-flex h-9 items-center rounded-lg px-2.5 text-[13px] font-semibold text-[#C21F2D] hover:bg-[#FDECEE] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={() => onRestore?.(group)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-green px-3 text-[13px] font-semibold whitespace-nowrap text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                <RotateCcw size={14} strokeWidth={2.2} aria-hidden="true" />
                Restore
              </button>
            </div>
          ) : (
            <Link
              to={paths.contactGroup(group.id)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-green px-3 text-[13px] font-semibold whitespace-nowrap text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              View contacts
              <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
              <span className="sr-only"> in {group.name}</span>
            </Link>
          )}
        </div>
      </article>
    </li>
  )
}

function GroupsPagination({ pager, total, pageSize, onPageSize }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] sm:justify-between">
      <p className="text-ink/60 tabular-nums">
        Showing {formatCount(pager.rangeStart)}–{formatCount(pager.rangeEnd)} of {formatCount(total)} groups
      </p>

      <nav aria-label="Group pages" className="flex items-center gap-1.5">
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
          label="Groups per page"
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

export function GroupsList({ groups, onEdit, onArchive, onRestore, onDiscard, archived = false, loading = false }) {
  const [query, setQuery] = useState('')
  // Newest first, so a group you just created is the first card you see.
  const [sort, setSort] = useState('updated')
  const [pageSize, setPageSize] = useState(6)

  const term = query.trim().toLowerCase()
  const visible = groups
    .filter((group) => !term || `${group.name} ${group.description}`.toLowerCase().includes(term))
    .sort(sorters[sort])
  const pager = usePagination({ total: visible.length, pageSize })
  const page = visible.slice(Math.max(pager.rangeStart - 1, 0), pager.rangeEnd)

  function refine(setter) {
    return (value) => {
      setter(value)
      pager.setPage(1)
    }
  }

  return (
    <section aria-labelledby="groups-heading" aria-busy={loading || undefined} className="mt-6 sm:mt-7">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-3">
        <h2 id="groups-heading" className="mr-1 text-lg font-bold text-navy">
          {archived ? 'Archived' : 'Groups'}{' '}
          {loading ? (
            <span className="sr-only">Loading</span>
          ) : (
            <span className="tabular-nums">({formatCount(visible.length)})</span>
          )}
        </h2>

        <label className="relative order-last w-full min-w-48 flex-1 sm:order-none sm:w-auto sm:max-w-sm sm:ml-auto">
          <span className="sr-only">Search groups</span>
          <Search
            size={15}
            strokeWidth={2}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/45"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => refine(setQuery)(event.target.value)}
            placeholder="Search groups..."
            className="h-9 w-full rounded-lg border border-ink/15 bg-white pr-3 pl-9 text-[13px] text-navy placeholder:text-ink/45 focus-visible:border-blue/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
          />
        </label>

        <SelectMenu
          label="Sort groups"
          value={sort}
          options={groupSorts}
          onChange={refine(setSort)}
          compact
          className="w-40 shrink-0"
        />
      </div>

      {loading ? (
        <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,19rem),1fr))] gap-4" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <GroupCardSkeleton key={index} />
          ))}
        </ul>
      ) : visible.length ? (
        <>
          <ul className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,19rem),1fr))] gap-4">
            {page.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                archived={archived}
                onEdit={onEdit}
                onArchive={onArchive}
                onRestore={onRestore}
                onDiscard={onDiscard}
              />
            ))}
          </ul>
          <GroupsPagination
            pager={pager}
            total={visible.length}
            pageSize={pageSize}
            onPageSize={(value) => {
              setPageSize(Number(value))
              pager.setPage(1)
            }}
          />
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-ink/15 bg-white px-4 py-12 text-center">
          {query.trim() ? (
            <>
              <p className="text-sm font-semibold text-navy">No groups found</p>
              <p className="mt-1 text-sm text-ink/55">Nothing matches "{query.trim()}". Try a different name.</p>
            </>
          ) : (
            archived ? (
              <>
                <p className="text-sm font-semibold text-navy">No archived groups</p>
                <p className="mt-1 text-sm text-ink/55">When you archive a group, it waits here until you restore or remove it.</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-navy">No groups yet</p>
                <p className="mt-1 text-sm text-ink/55">Create a group, then add contacts to it.</p>
              </>
            )
          )}
        </div>
      )}
    </section>
  )
}
