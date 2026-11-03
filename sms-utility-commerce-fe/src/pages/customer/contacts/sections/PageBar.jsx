import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCount } from '../../dashboard/format'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function pagesOf(page, lastPage) {
  const wanted = [1, lastPage, page - 1, page, page + 1].filter((number) => number >= 1 && number <= lastPage)
  return [...new Set(wanted)].sort((left, right) => left - right)
}

export function PageBar({ page, lastPage, total, perPage, onPage, label }) {
  if (!total || lastPage < 2) return null

  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)
  const pages = pagesOf(page, lastPage)

  return (
    <nav aria-label={label} className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-ink/55 tabular-nums">
        {formatCount(start)}–{formatCount(end)} of {formatCount(total)}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={`flex size-8 items-center justify-center rounded-lg border border-ink/15 bg-white text-navy disabled:opacity-40 ${focusClass}`}
        >
          <ChevronLeft size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
        {pages.map((number, index) => {
          const gap = index > 0 && number - pages[index - 1] > 1
          return (
            <span key={number} className="flex items-center gap-1">
              {gap ? <span className="px-1 text-xs text-ink/40">…</span> : null}
              <button
                type="button"
                onClick={() => onPage(number)}
                aria-current={number === page ? 'page' : undefined}
                className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold tabular-nums ${focusClass} ${
                  number === page ? 'bg-navy text-white' : 'border border-ink/15 bg-white text-navy hover:border-blue/40'
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
          className={`flex size-8 items-center justify-center rounded-lg border border-ink/15 bg-white text-navy disabled:opacity-40 ${focusClass}`}
        >
          <ChevronRight size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>
    </nav>
  )
}
