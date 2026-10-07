import { ArrowUpDown, ChevronLeft, ChevronRight, CloudUpload, Ellipsis, MessageCircle, Pencil, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { SelectMenu } from '../../../../components/SelectMenu'
import { paths } from '../../../../routes/paths'
import { useDebouncedValue } from '../../../../utils/hooks/useDebouncedValue'
import { usePagination } from '../../../../utils/hooks/usePagination'
import { formatCount, parseISODate } from '../../dashboard/format'
import {
  activityOptions,
  getMembers,
  pageSizeOptions,
  queryMembers,
  sortOptions,
  sourceOptions,
  statusLabels,
  statusOptions,
} from '../members'

const activityDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const statusStyle = {
  active: { dot: '#159447', pill: 'bg-[#DDF3E6] text-[#0E7A38]' },
  pending: { dot: '#F59E0B', pill: 'bg-[#FFEBCB] text-[#B45F06]' },
  unsubscribed: { dot: '#E0287D', pill: 'bg-[#FFDDE8] text-[#C21F67]' },
  blocked: { dot: '#D7192A', pill: 'bg-[#FFDFE1] text-[#B8141F]' },
}

const tagStyle = {
  Promo: 'bg-[#E3EFFD] text-[#1160C7]',
  Utility: 'bg-[#DDF3E6] text-[#0E7A38]',
  Survey: 'bg-[#EEE3FB] text-[#7A35C9]',
  'High Value': 'bg-[#FCE0EC] text-[#C21F67]',
  Engaged: 'bg-[#DDF3E6] text-[#0E7A38]',
  New: 'bg-[#E3EFFD] text-[#1160C7]',
  Inactive: 'bg-[#FFE0E0] text-[#C0262D]',
  VIP: 'bg-[#FFE8D2] text-[#C25B0A]',
}

const avatarTones = [
  ['#DCEBFD', '#1473E6'],
  ['#FDE1EC', '#D6246E'],
  ['#E7DCFA', '#7B3FD6'],
  ['#DDF3E6', '#159447'],
  ['#FFE8D0', '#D9750B'],
  ['#D9F0F5', '#0E8AA6'],
]

const iconButton =
  'flex size-8 items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue'

// The table is sized from its own card width (cqw), so it stays proportionate on every
// screen: text, padding, avatar and buttons all shrink together before any column is dropped.
const cellPad = 'px-[clamp(0.5rem,1.1cqw,0.75rem)] py-[clamp(0.5rem,0.9cqw,0.75rem)]'
const headCell = `bg-[#F3F7FD] ${cellPad} text-[0.86em] font-semibold whitespace-nowrap text-navy`
const bodyCell = `${cellPad} align-middle`
const rowButton =
  'flex size-[clamp(1.75rem,2.4cqw,2rem)] items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue'

function StatusPill({ status }) {
  const tone = statusStyle[status]

  return (
    <span
      className={`inline-flex items-center gap-[0.45em] rounded-lg px-[0.75em] py-[0.3em] text-[0.86em] font-semibold whitespace-nowrap ${tone.pill}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: tone.dot }} />
      {statusLabels[status]}
    </span>
  )
}

function Tags({ tags }) {
  return (
    <span className="flex flex-nowrap gap-[0.4em] whitespace-nowrap">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`rounded-md px-[0.6em] py-[0.15em] text-[0.86em] font-medium whitespace-nowrap ${tagStyle[tag] ?? 'bg-canvas text-navy'}`}
        >
          {tag}
        </span>
      ))}
    </span>
  )
}

function Avatar({ member }) {
  const [tint, color] = avatarTones[member.tone]

  return (
    <span
      aria-hidden="true"
      className="flex size-[clamp(1.75rem,2.7cqw,2.25rem)] shrink-0 items-center justify-center rounded-full text-[0.8em] font-bold"
      style={{ backgroundColor: tint, color }}
    >
      {member.initials}
    </span>
  )
}

function Check({ label, checked, indeterminate = false, onChange }) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      ref={(node) => {
        if (node) node.indeterminate = indeterminate
      }}
      onChange={onChange}
      className="size-4 cursor-pointer rounded accent-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
    />
  )
}

function RowActions({ member }) {
  return (
    <span className="inline-flex items-center gap-[0.4em]">
      <button type="button" aria-label={`Edit ${member.name}`} className={rowButton}>
        <Pencil size={14} strokeWidth={2} aria-hidden="true" />
      </button>
      <button type="button" aria-label={`Message ${member.name}`} className={rowButton}>
        <MessageCircle size={14} strokeWidth={2} aria-hidden="true" />
      </button>
      <button type="button" aria-label={`More actions for ${member.name}`} className={rowButton}>
        <Ellipsis size={15} strokeWidth={2.4} aria-hidden="true" />
      </button>
    </span>
  )
}

// 1 2 3 4 5 … last, with the window following the current page.
function pageList(current, count) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap-end', count]
  if (current >= count - 3) return [1, 'gap-start', count - 4, count - 3, count - 2, count - 1, count]
  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', count]
}

function Pagination({ pager, total, selectedCount, pageSize, onPageSize }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] @2xl/detail:justify-between">
      <p className="text-ink/60 tabular-nums">
        Showing {formatCount(pager.rangeStart)}–{formatCount(pager.rangeEnd)} of {formatCount(total)} members
        {selectedCount ? <span className="font-semibold text-navy"> · {formatCount(selectedCount)} selected</span> : null}
      </p>

      <nav aria-label="Members pages" className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          disabled={pager.page === 1}
          onClick={pager.previous}
          className={`${iconButton} disabled:cursor-not-allowed disabled:opacity-40`}
        >
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
          className={`${iconButton} disabled:cursor-not-allowed disabled:opacity-40`}
        >
          <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </nav>

      <div className="flex items-center gap-2 text-ink/60">
        Show
        <SelectMenu
          label="Members per page"
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

export function MembersTable({ group }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [source, setSource] = useState('all')
  const [activity, setActivity] = useState('any')
  const [sort, setSort] = useState('latest')
  const [pageSize, setPageSize] = useState(8)
  const [selected, setSelected] = useState(() => new Set())
  const search = useDebouncedValue(query, 250)

  const members = getMembers(group)
  const results = useMemo(
    () => queryMembers(members, { status, source, activity, search, sort }),
    [members, status, source, activity, search, sort],
  )

  const pager = usePagination({ total: results.length, pageSize })
  const rows = results.slice(pager.rangeStart - 1, pager.rangeEnd)
  const filtered = status !== 'all' || source !== 'all' || activity !== 'any' || query.trim() !== ''

  const pageSelected = rows.filter((member) => selected.has(member.id)).length
  const allSelected = rows.length > 0 && pageSelected === rows.length

  // Any change to what is listed starts again from the first page.
  const refine = (setter) => (value) => {
    setter(value)
    pager.setPage(1)
  }

  function toggle(id) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((current) => {
      const next = new Set(current)
      rows.forEach((member) => (allSelected ? next.delete(member.id) : next.add(member.id)))
      return next
    })
  }

  function clearFilters() {
    setQuery('')
    setStatus('all')
    setSource('all')
    setActivity('any')
    pager.setPage(1)
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 @xl/detail:flex-row @xl/detail:items-center">
          <h3 className="shrink-0 text-base font-bold whitespace-nowrap text-navy">
            Members <span className="tabular-nums">({formatCount(results.length)})</span>
          </h3>

          <label className="relative min-w-0 @xl/detail:ml-auto @xl/detail:w-80 @xl/detail:max-w-full">
            <span className="sr-only">Search members by name, phone, or email</span>
            <Search
              size={16}
              strokeWidth={2}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/45"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => refine(setQuery)(event.target.value)}
              placeholder="Search members by name, phone, or email..."
              className="h-9 w-full rounded-lg border border-ink/15 bg-white pr-3 pl-9 text-[13px] text-navy placeholder:text-ink/45 focus-visible:border-blue/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2 @3xl/detail:grid-cols-4">
          <SelectMenu
            label="Filter by status"
            value={status}
            options={statusOptions}
            onChange={refine(setStatus)}
            compact
            align="left"
            className="min-w-0"
            menuClassName="w-full min-w-40"
          />
          <SelectMenu
            label="Filter by source"
            value={source}
            options={sourceOptions}
            onChange={refine(setSource)}
            compact
            align="left"
            className="min-w-0"
            menuClassName="w-full min-w-40"
          />
          <SelectMenu
            label="Filter by last activity"
            value={activity}
            options={activityOptions}
            onChange={refine(setActivity)}
            compact
            align="left"
            className="min-w-0"
            menuClassName="w-full min-w-40"
          />
          <SelectMenu
            label="Sort members"
            value={sort}
            options={sortOptions}
            onChange={refine(setSort)}
            icon={ArrowUpDown}
            compact
            align="right"
            className="min-w-0"
            menuClassName="w-full min-w-40"
          />
        </div>
      </div>

      {rows.length ? (
        <>
          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-[#E1EAF6] @2xl/detail:block">
            <table className="w-full border-collapse text-left text-[length:clamp(0.75rem,1.45cqw,0.875rem)]">
              <thead>
                <tr>
                  <th scope="col" className={`${headCell} w-10`}>
                    <Check
                      label="Select all members on this page"
                      checked={allSelected}
                      indeterminate={pageSelected > 0 && !allSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  <th scope="col" className={headCell}>
                    Name
                  </th>
                  <th scope="col" className={headCell}>
                    Phone Number
                  </th>
                  <th scope="col" className={`${headCell} hidden @5xl/detail:table-cell`}>
                    Email
                  </th>
                  <th scope="col" className={headCell}>
                    Status
                  </th>
                  <th scope="col" className={headCell}>
                    Last Activity
                  </th>
                  <th scope="col" className={`${headCell} hidden @3xl/detail:table-cell`}>
                    Tags
                  </th>
                  <th scope="col" className={`${headCell} text-center`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((member) => {
                  const isSelected = selected.has(member.id)
                  return (
                    <tr
                      key={member.id}
                      className={`border-t border-[#E7EEF8] transition-colors ${
                        isSelected ? 'bg-blue/[0.05]' : 'hover:bg-canvas'
                      }`}
                    >
                      <td className={bodyCell}>
                        <Check
                          label={`Select ${member.name}`}
                          checked={isSelected}
                          onChange={() => toggle(member.id)}
                        />
                      </td>
                      <th scope="row" className={`${bodyCell} text-left font-semibold text-navy`}>
                        <span className="flex items-center gap-[0.7em] whitespace-nowrap">
                          <Avatar member={member} />
                          {member.name}
                        </span>
                      </th>
                      <td className={`${bodyCell} whitespace-nowrap text-ink/75 tabular-nums`}>{member.phone}</td>
                      <td className={`${bodyCell} hidden text-ink/75 @5xl/detail:table-cell`}>{member.email}</td>
                      <td className={bodyCell}>
                        <StatusPill status={member.status} />
                      </td>
                      <td className={`${bodyCell} whitespace-nowrap`}>
                        <span className="block text-navy">
                          {activityDate.format(parseISODate(member.activityDate))}
                        </span>
                        <span className="block text-[0.86em] text-ink/50">{member.activity}</span>
                      </td>
                      <td className={`${bodyCell} hidden @3xl/detail:table-cell`}>
                        <Tags tags={member.tags} />
                      </td>
                      <td className={`${bodyCell} text-center`}>
                        <RowActions member={member} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <ul className="mt-4 divide-y divide-[#E7EEF8] rounded-xl border border-[#E1EAF6] @2xl/detail:hidden">
            {rows.map((member) => (
              <li key={member.id} className="flex items-start gap-3 p-3">
                <span className="pt-2">
                  <Check
                    label={`Select ${member.name}`}
                    checked={selected.has(member.id)}
                    onChange={() => toggle(member.id)}
                  />
                </span>
                <Avatar member={member} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-navy">{member.name}</p>
                    <StatusPill status={member.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink/60 tabular-nums">{member.phone}</p>
                  <p className="truncate text-xs text-ink/60">{member.email}</p>
                  <p className="mt-1.5 text-xs text-ink/50">
                    {activityDate.format(parseISODate(member.activityDate))} · {member.activity}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <Tags tags={member.tags} />
                    <RowActions member={member} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : !members.length ? (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-ink/15 px-4 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-[#E3EFFD] text-blue">
            <CloudUpload size={22} strokeWidth={2} aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-semibold text-navy">No contacts in this group yet</p>
          <p className="mt-1 max-w-sm text-sm leading-5 text-ink/55">
            Upload an Excel file and we&apos;ll check it for mistakes before adding anyone.
          </p>
          <Link
            to={paths.contactUpload(group.id)}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-blue px-3.5 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#0F5FC4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            Upload contacts
          </Link>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-ink/15 px-4 py-12 text-center">
          <p className="text-sm font-semibold text-navy">No members match</p>
          <p className="mt-1 text-sm text-ink/55">Try a different search or loosen the filters.</p>
          {filtered ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 h-9 rounded-lg border border-ink/15 px-3.5 text-sm font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      )}

      {results.length ? (
        <Pagination
          pager={pager}
          total={results.length}
          selectedCount={selected.size}
          pageSize={pageSize}
          onPageSize={(id) => refine(setPageSize)(Number(id))}
        />
      ) : null}
    </div>
  )
}
