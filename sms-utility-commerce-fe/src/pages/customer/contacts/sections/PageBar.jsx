import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCount } from '../../dashboard/format'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const pageButton =
  'flex size-8 cursor-pointer items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue disabled:cursor-not-allowed disabled:opacity-40'

function pagesOf(page, lastPage) {
  const wanted = [1, lastPage, page - 1, page, page + 1].filter((number) => number >= 1 && number <= lastPage)
  return [...new Set(wanted)].sort((left, right) => left - right)
}

export function PageBar({ page, lastPage, total, perPage, onPage, label, className = 'mt-4', showSummary = true }) {
  if (!total || lastPage < 2) return null

  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)
  const pages = pagesOf(page, lastPage)

  return (
    <nav aria-label={label} className={`flex flex-wrap items-center ${showSummary ? 'justify-between' : 'justify-end'} gap-3 ${className}`}>
      {showSummary ? (
        <p className="text-[13px] text-ink/60 tabular-nums">
          {formatCount(start)}–{formatCount(end)} of {formatCount(total)}
        </p>
      ) : null}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`${pageButton} ${focusClass}`}
        >
          <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
        {pages.map((number, index) => {
          const gap = index > 0 && number - pages[index - 1] > 1
          return (
            <span key={number} className="flex items-center gap-1.5">
              {gap ? <span className="px-1 text-xs text-ink/40">…</span> : null}
              <button
                type="button"
                onClick={() => onPage(number)}
                aria-current={number === page ? 'page' : undefined}
                className={`flex h-8 min-w-8 cursor-pointer items-center justify-center rounded-lg px-2 text-[13px] font-semibold tabular-nums transition-colors ${focusClass} ${
                  number === page
                    ? 'border border-blue bg-blue text-white'
                    : 'border border-ink/15 bg-white text-navy hover:border-blue/40 hover:bg-canvas'
                }`}
              >
                {formatCount(number)}
              </button>
            </span>
          )
        })}
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= lastPage}
          aria-label="Next page"
          className={`${pageButton} ${focusClass}`}
        >
          <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
