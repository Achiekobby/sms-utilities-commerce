import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useState } from 'react'
import { usePagination } from '../../utils/hooks/usePagination'
import { formatCount } from '../../pages/customer/dashboard/format'

const pageButton =
  'flex size-8 items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue disabled:cursor-not-allowed disabled:opacity-40'

function pageList(current, count) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, 'gap-end', count]
  if (current >= count - 3) return [1, 'gap-start', count - 4, count - 3, count - 2, count - 1, count]
  return [1, 'gap-start', current - 1, current, current + 1, 'gap-end', count]
}

export function useChoicePage(items, { pageSize = 6, matches }) {
  const [query, setQuery] = useState('')
  const term = query.trim().toLowerCase()
  const filtered = term ? items.filter((item) => matches(item, term)) : items
  const pager = usePagination({ total: filtered.length, pageSize })
  const pageItems = filtered.slice(Math.max(pager.rangeStart - 1, 0), pager.rangeEnd)

  function search(value) {
    setQuery(value)
    pager.setPage(1)
  }

  return { query, term, search, filtered, pageItems, pager }
}

export function ChoiceSearch({ label, placeholder, value, onChange }) {
  return (
    <label className="relative mt-3 block">
      <span className="sr-only">{label}</span>
      <Search
        size={15}
        strokeWidth={2}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/45"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-ink/15 bg-white pr-3 pl-9 text-[13px] text-navy placeholder:text-ink/45 focus-visible:border-blue/50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
      />
    </label>
  )
}

export function ChoicePager({ label, noun, pager, total }) {
  if (total === 0 || pager.pageCount < 2) return null

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13px]">
      <p className="text-ink/60 tabular-nums">
        Showing {formatCount(pager.rangeStart)}–{formatCount(pager.rangeEnd)} of {formatCount(total)} {noun}
      </p>
      <nav aria-label={label} className="flex items-center gap-1.5">
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
    </div>
  )
}

export function ChoiceEmpty({ term, noun }) {
  if (!term) return null
  return (
    <p className="mt-3 rounded-xl border border-dashed border-ink/15 px-4 py-6 text-center text-sm text-ink/60">
      No {noun} match “{term}”.
    </p>
  )
}
