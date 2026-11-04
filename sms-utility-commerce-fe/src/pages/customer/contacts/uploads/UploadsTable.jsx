import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Loader2,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { ActionMenu, actionIconTrigger } from '../../../../components/ActionMenu'
import { SelectMenu } from '../../../../components/SelectMenu'
import { formatStamp } from '../../../../features/contacts/contactImport'
import { useDebouncedValue } from '../../../../utils/hooks/useDebouncedValue'
import { usePagination } from '../../../../utils/hooks/usePagination'
import { formatCount } from '../../dashboard/format'
import { formatBytes } from '../upload/rules'
import { PageBar } from '../sections/PageBar'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const statusLook = {
  queued: { label: 'Queued', icon: Clock3, pill: 'bg-[#FFF4DF] text-[#B45F06] ring-[#F0D7A8]' },
  processing: { label: 'Adding', icon: Loader2, pill: 'bg-[#EAF2FE] text-[#0B63F6] ring-[#C9DBF8]' },
  completed: { label: 'Completed', icon: CheckCircle2, pill: 'bg-[#E7F7EE] text-[#0E7A38] ring-[#B7E4C7]' },
  failed: { label: 'Failed', icon: AlertCircle, pill: 'bg-[#FDECEE] text-[#C21F2D] ring-[#F3B8BD]' },
}

const lengthOptions = [
  { id: '10', label: '10' },
  { id: '25', label: '25' },
  { id: '50', label: '50' },
  { id: '100', label: '100' },
]

const statusFilters = [
  { id: 'all', label: 'All' },
  { id: 'queued', label: 'Queued' },
  { id: 'processing', label: 'Adding' },
  { id: 'completed', label: 'Completed' },
  { id: 'failed', label: 'Failed' },
]

const columns = [
  { id: 'fileName', label: 'File', align: 'left', sort: true },
  { id: 'status', label: 'Status', align: 'left', sort: true },
  { id: 'progress', label: 'Progress', align: 'left', sort: true },
  { id: 'total', label: 'In File', align: 'right', sort: true },
  { id: 'inserted', label: 'Added', align: 'right', sort: true },
  { id: 'skipped', label: 'Skipped', align: 'right', sort: true, className: 'hidden xl:table-cell' },
  { id: 'failed', label: 'Failed', align: 'right', sort: true, className: 'hidden lg:table-cell' },
  { id: 'createdAt', label: 'Uploaded', align: 'left', sort: true },
  { id: 'actions', label: 'Actions', align: 'right', sort: false },
]

function canViewContacts(item) {
  return !item.running && Number(item.inserted) > 0
}

function canReviewSkipped(item) {
  return !item.running && Number(item.skipped) > 0
}

function canDeleteUpload(item) {
  return !item.running
}

function uploadActions(item, { onViewContacts, onReviewSkipped, onDelete }) {
  const items = [
    {
      id: 'contacts',
      label: 'View contacts',
      hint: canViewContacts(item) ? 'Manage people from this file' : item.running ? 'Available when the upload finishes' : 'No contacts were added',
      icon: Users,
      color: '#0B63F6',
      tint: '#E3EFFD',
      disabled: !canViewContacts(item),
      onClick: () => onViewContacts?.(item),
    },
  ]

  if (canReviewSkipped(item)) {
    items.push({
      id: 'skipped',
      label: 'Review skipped rows',
      hint: 'See why contacts were left out',
      icon: AlertTriangle,
      color: '#B45F06',
      tint: '#FFEBCB',
      onClick: () => onReviewSkipped?.(item),
    })
  }

  items.push('separator', {
    id: 'delete',
    label: 'Delete upload',
    hint: canDeleteUpload(item) ? 'Remove this upload record' : 'Wait until the upload finishes',
    icon: Trash2,
    color: '#C21F2D',
    tint: '#FDECEE',
    tone: 'danger',
    disabled: !canDeleteUpload(item),
    onClick: () => onDelete?.(item),
  })

  return items
}

const head =
  'sticky top-0 z-[1] border-b border-[#E1EAF6] bg-[#F3F7FD] px-2.5 py-2.5 text-[11px] font-semibold tracking-wide whitespace-nowrap text-navy uppercase first:pl-4 last:pr-4 sm:px-3'
const cell = 'border-b border-[#E7EEF8] px-2.5 py-3.5 align-middle text-sm first:pl-4 last:pr-4 sm:px-3'

function compare(left, right, key) {
  const a = left[key]
  const b = right[key]
  if (key === 'fileName' || key === 'status' || key === 'createdAt') {
    return String(a ?? '').localeCompare(String(b ?? ''), undefined, { sensitivity: 'base', numeric: true })
  }
  return (Number(a) || 0) - (Number(b) || 0)
}

function StatusPill({ item }) {
  const look = statusLook[item.status] ?? { label: item.status, icon: Clock3, pill: 'bg-canvas text-navy ring-ink/10' }
  const Icon = look.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${look.pill}`}>
      <Icon
        size={13}
        strokeWidth={2.4}
        aria-hidden="true"
        className={item.running ? 'animate-spin motion-reduce:animate-none' : ''}
      />
      {look.label}
    </span>
  )
}

function ProgressCell({ item }) {
  const width = item.running ? Math.max(item.progress, 8) : item.progress
  const bar = item.status === 'failed' ? 'bg-[#C21F2D]' : item.status === 'completed' ? 'bg-green' : 'bg-blue'

  return (
    <div
      className="w-full min-w-[7.5rem] max-w-[11rem]"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={item.progress}
      aria-label={`${item.fileName} progress`}
    >
      <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-ink/50">
        <span className="truncate">
          {item.running ? 'Working…' : item.status === 'failed' ? 'Stopped' : 'Done'}
          {item.chunksExpected > 0 ? ` · ${item.chunksDone}/${item.chunksExpected}` : ''}
        </span>
        <span className="tabular-nums text-navy">{item.progress}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/[0.08]">
        <div className={`relative h-full rounded-full transition-[width] duration-500 ease-out ${bar}`} style={{ width: `${width}%` }}>
          {item.running ? <span className="upload-slide absolute inset-y-0 w-1/3 bg-white/50" /> : null}
        </div>
      </div>
    </div>
  )
}

function FileCell({ item }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
          item.running
            ? 'bg-[#EAF2FE] text-blue'
            : item.status === 'failed'
              ? 'bg-[#FDECEE] text-[#C21F2D]'
              : item.status === 'completed'
                ? 'bg-[#E7F7EE] text-green'
                : 'bg-[#FFF4DF] text-[#B45F06]'
        }`}
      >
        {item.running ? (
          <Loader2 size={17} strokeWidth={2.2} className="animate-spin motion-reduce:animate-none" />
        ) : (
          <FileSpreadsheet size={17} strokeWidth={2.1} />
        )}
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-navy">{item.fileName}</p>
        <p className="mt-0.5 truncate text-xs text-ink/50">
          {item.fileSize ? formatBytes(item.fileSize) : 'Excel file'}
          {item.message ? ` · ${item.message}` : ''}
        </p>
      </div>
    </div>
  )
}

function Metric({ value, muted = false }) {
  return <span className={`tabular-nums ${muted ? 'text-ink/45' : 'font-semibold text-navy'}`}>{formatCount(value)}</span>
}

function rowTone(item, featured) {
  if (featured) return 'bg-blue/[0.05]'
  if (item.running) return 'bg-blue/[0.03]'
  if (item.status === 'failed') return 'bg-[#C21F2D]/[0.025]'
  return 'bg-white hover:bg-[#F7FAFE]'
}

function SortButton({ column, sort, onSort }) {
  const active = sort.key === column.id
  const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown

  return (
    <button
      type="button"
      onClick={() => onSort(column.id)}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md uppercase transition-colors hover:text-navy ${focusClass} ${
        column.align === 'right' ? 'w-full justify-end' : ''
      } ${active ? 'text-navy' : 'text-navy/70'}`}
    >
      {column.label}
      <Icon size={12} strokeWidth={2.4} aria-hidden="true" className={active ? 'text-blue' : 'text-ink/40'} />
    </button>
  )
}

function RowActions({ item, onViewContacts, onReviewSkipped, onDelete }) {
  return (
    <div className="flex justify-end">
      <ActionMenu
        label="Upload actions"
        iconOnly
        items={uploadActions(item, { onViewContacts, onReviewSkipped, onDelete })}
        triggerClassName={actionIconTrigger}
      />
    </div>
  )
}

function DesktopRow({ item, featured, onViewContacts, onReviewSkipped, onDelete }) {
  return (
    <tr className={`transition-colors duration-150 ${rowTone(item, featured)}`}>
      <th scope="row" className={`${cell} relative w-full min-w-0 text-left font-normal`}>
        {featured || item.running ? (
          <span
            aria-hidden="true"
            className={`absolute inset-y-2 left-1.5 w-0.5 rounded-full ${item.status === 'failed' ? 'bg-[#C21F2D]' : 'bg-blue'}`}
          />
        ) : null}
        <FileCell item={item} />
      </th>
      <td className={`${cell} whitespace-nowrap`}>
        <StatusPill item={item} />
      </td>
      <td className={`${cell} whitespace-nowrap`}>
        <ProgressCell item={item} />
      </td>
      <td className={`${cell} whitespace-nowrap text-right`}>
        <Metric value={item.total} muted={!item.total} />
      </td>
      <td className={`${cell} whitespace-nowrap text-right`}>
        <Metric value={item.inserted} muted={!item.inserted} />
      </td>
      <td className={`${cell} hidden whitespace-nowrap text-right xl:table-cell`}>
        <Metric value={item.skipped} muted={!item.skipped} />
      </td>
      <td className={`${cell} hidden whitespace-nowrap text-right lg:table-cell`}>
        <Metric value={item.failed} muted={!item.failed} />
      </td>
      <td className={`${cell} whitespace-nowrap text-ink/60`}>{item.createdAt ? formatStamp(item.createdAt) : '—'}</td>
      <td className={`${cell} text-right`}>
        <RowActions
          item={item}
          onViewContacts={onViewContacts}
          onReviewSkipped={onReviewSkipped}
          onDelete={onDelete}
        />
      </td>
    </tr>
  )
}

function MobileRow({ item, featured, onViewContacts, onReviewSkipped, onDelete }) {
  return (
    <article
      className={`relative rounded-xl border p-4 transition-colors ${
        featured || item.running
          ? 'border-blue/25 bg-blue/[0.04] shadow-[0_1px_2px_rgba(20,115,230,0.06)]'
          : item.status === 'failed'
            ? 'border-[#F3B8BD]/60 bg-[#FFF8F8]'
            : 'border-[#D8E7FA] bg-white shadow-[0_1px_2px_rgba(20,115,230,0.04),0_8px_22px_-16px_rgba(20,115,230,0.28)]'
      }`}
    >
      {(featured || item.running) && (
        <span aria-hidden="true" className="absolute inset-y-3 left-0 w-0.5 rounded-r-full bg-blue" />
      )}
      <div className="flex items-start justify-between gap-3">
        <FileCell item={item} />
        <StatusPill item={item} />
      </div>
      <div className="mt-3.5">
        <ProgressCell item={item} />
      </div>
      <dl className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['In File', item.total],
          ['Added', item.inserted],
          ['Skipped', item.skipped],
          ['Failed', item.failed],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-lg bg-[#F5F8FC] px-2.5 py-2 text-center">
            <dt className="text-[10px] font-semibold tracking-wide text-ink/50 uppercase">{label}</dt>
            <dd className="mt-0.5 text-sm font-bold text-navy tabular-nums">{formatCount(value)}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        {item.createdAt ? <p className="text-xs text-ink/45">{formatStamp(item.createdAt)}</p> : <span />}
        <RowActions
          item={item}
          onViewContacts={onViewContacts}
          onReviewSkipped={onReviewSkipped}
          onDelete={onDelete}
        />
      </div>
    </article>
  )
}

export function UploadsTable({ items, featuredId = '', onViewContacts, onReviewSkipped, onDelete }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [pageSize, setPageSize] = useState(10)
  const [sort, setSort] = useState({ key: 'createdAt', dir: 'desc' })
  const debounced = useDebouncedValue(query.trim().toLowerCase(), 200)

  const filtered = useMemo(() => {
    const next = items.filter((item) => {
      if (status !== 'all' && item.status !== status) return false
      if (!debounced) return true
      const haystack = `${item.fileName} ${item.status} ${item.message ?? ''}`.toLowerCase()
      return haystack.includes(debounced)
    })

    next.sort((left, right) => {
      const result = compare(left, right, sort.key)
      return sort.dir === 'asc' ? result : -result
    })
    return next
  }, [debounced, items, sort, status])

  const statusCounts = useMemo(() => {
    const counts = { all: items.length, queued: 0, processing: 0, completed: 0, failed: 0 }
    items.forEach((item) => {
      if (counts[item.status] != null) counts[item.status] += 1
    })
    return counts
  }, [items])

  const pager = usePagination({ total: filtered.length, pageSize })
  const page = filtered.slice(Math.max(pager.rangeStart - 1, 0), pager.rangeEnd)
  const filteredAway = filtered.length !== items.length

  function refine(setter) {
    return (value) => {
      setter(value)
      pager.setPage(1)
    }
  }

  function onSort(key) {
    setSort((current) =>
      current.key === key ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'fileName' ? 'asc' : 'desc' },
    )
    pager.setPage(1)
  }

  function clearFilters() {
    setQuery('')
    setStatus('all')
    pager.setPage(1)
  }

  return (
    <section aria-label="Upload history" className="w-full min-w-0">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative min-w-0 flex-1 lg:max-w-md">
          <span className="sr-only">Search uploads</span>
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
            placeholder="Search by file name or message…"
            className="h-10 w-full rounded-lg border border-ink/15 bg-white pr-9 pl-9 text-[13px] text-navy placeholder:text-ink/45 transition-colors focus-visible:border-blue/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
          />
          {query ? (
            <button
              type="button"
              onClick={() => refine(setQuery)('')}
              aria-label="Clear search"
              className={`absolute top-1/2 right-2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-ink/45 transition-colors hover:bg-canvas hover:text-navy ${focusClass}`}
            >
              <X size={14} strokeWidth={2.2} aria-hidden="true" />
            </button>
          ) : null}
        </label>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {statusFilters.map((item) => {
            const selected = status === item.id
            const count = statusCounts[item.id] ?? 0
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => refine(setStatus)(item.id)}
                className={`inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold transition-colors ${focusClass} ${
                  selected
                    ? 'border-blue bg-blue/[0.06] text-navy'
                    : 'border-ink/15 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
                }`}
              >
                {item.label}
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                    selected ? 'bg-blue text-white' : 'bg-canvas text-ink/60'
                  }`}
                >
                  {formatCount(count)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-[13px] text-ink/60 tabular-nums" aria-live="polite">
          {formatCount(filtered.length)} {filtered.length === 1 ? 'upload' : 'uploads'}
          {filteredAway ? ` of ${formatCount(items.length)}` : ''}
        </p>
        {filteredAway ? (
          <button
            type="button"
            onClick={clearFilters}
            className={`inline-flex cursor-pointer items-center gap-1 rounded-sm text-[13px] font-semibold text-blue transition-colors hover:text-blue/80 ${focusClass}`}
          >
            <X size={14} strokeWidth={2.2} aria-hidden="true" />
            Clear filters
          </button>
        ) : null}
      </div>

      {page.length ? (
        <>
          <div className="mt-4 hidden w-full min-w-0 overflow-x-auto rounded-xl border border-[#D8E7FA] bg-white shadow-[0_1px_2px_rgba(20,115,230,0.05),0_12px_28px_-18px_rgba(11,31,91,0.4)] md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      scope="col"
                      className={`${head} ${column.align === 'right' ? 'text-right' : 'text-left'} ${column.className ?? ''}`}
                      aria-sort={
                        sort.key === column.id ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'
                      }
                    >
                      {column.sort ? <SortButton column={column} sort={sort} onSort={onSort} /> : column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&>tr:last-child>*]:border-b-0">
                {page.map((item) => (
                  <DesktopRow
                    key={item.id}
                    item={item}
                    featured={item.id === featuredId}
                    onViewContacts={onViewContacts}
                    onReviewSkipped={onReviewSkipped}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 md:hidden">
            {page.map((item) => (
              <MobileRow
                key={item.id}
                item={item}
                featured={item.id === featuredId}
                onViewContacts={onViewContacts}
                onReviewSkipped={onReviewSkipped}
                onDelete={onDelete}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-ink/15 bg-[#F8FBFF] px-4 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-[#E3EFFD] text-blue">
            <Search size={20} strokeWidth={2} aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-bold text-navy">No matching uploads</p>
          <p className="mt-1 max-w-sm text-sm text-ink/55">
            {query.trim() || status !== 'all'
              ? 'Try a different search or clear the status filter.'
              : 'Upload an Excel file and it will show up here while it is added.'}
          </p>
          {filteredAway ? (
            <button
              type="button"
              onClick={clearFilters}
              className={`mt-4 inline-flex h-9 cursor-pointer items-center rounded-lg border border-ink/15 bg-white px-3 text-sm font-semibold text-navy transition-colors hover:border-blue/40 hover:bg-canvas ${focusClass}`}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-[13px] text-ink/60 tabular-nums" aria-live="polite">
            {filtered.length === 0
              ? 'Showing 0 entries'
              : `Showing ${formatCount(pager.rangeStart)}–${formatCount(pager.rangeEnd)} of ${formatCount(filtered.length)}`}
          </p>
          <label className="inline-flex items-center gap-2 text-[13px] text-ink/60">
            <span className="whitespace-nowrap">Show</span>
            <SelectMenu
              label="Rows per page"
              value={String(pageSize)}
              options={lengthOptions}
              onChange={(id) => {
                setPageSize(Number(id))
                pager.setPage(1)
              }}
              compact
              placement="top"
              align="left"
              className="w-[4.5rem]"
              menuClassName="w-24"
            />
            <span>per page</span>
          </label>
        </div>
        <PageBar
          page={pager.page}
          lastPage={pager.pageCount}
          total={filtered.length}
          perPage={pageSize}
          onPage={pager.setPage}
          label="Upload table pages"
          className=""
          showSummary={false}
        />
      </div>
    </section>
  )
}
