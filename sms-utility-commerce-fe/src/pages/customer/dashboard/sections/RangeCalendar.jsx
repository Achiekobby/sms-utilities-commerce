import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toISODate } from '../dateRanges'

const monthName = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })
const fullDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' })
const weekdays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const navButton =
  'flex size-8 items-center justify-center rounded-lg text-ink/60 transition-colors hover:bg-canvas hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue'

// Weeks start on Monday. Leading blanks pad the first row so day 1 lands on its weekday.
function buildDays({ year, month }) {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7
  const count = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: count }, (_, index) => toISODate(new Date(year, month, index + 1)))
  return [...Array(lead).fill(null), ...days]
}

export function RangeCalendar({ from, to, month, onMonth, onPick }) {
  const today = toISODate(new Date())
  const cells = buildDays(month)
  const heading = monthName.format(new Date(month.year, month.month, 1))

  function shift(step) {
    const next = new Date(month.year, month.month + step, 1)
    onMonth({ year: next.getFullYear(), month: next.getMonth() })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Previous month" onClick={() => shift(-1)} className={navButton}>
          <ChevronLeft size={18} strokeWidth={2.2} aria-hidden="true" />
        </button>
        <p aria-live="polite" className="text-sm font-semibold text-navy">
          {heading}
        </p>
        <button type="button" aria-label="Next month" onClick={() => shift(1)} className={navButton}>
          <ChevronRight size={18} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center">
        {weekdays.map((day) => (
          <span key={day} className="pb-1.5 text-[11px] font-medium text-ink/40">
            {day}
          </span>
        ))}

        {cells.map((iso, index) => {
          if (!iso) return <span key={`blank-${index}`} />

          const isStart = iso === from
          const isEnd = iso === to
          const between = Boolean(from && to && iso > from && iso < to)
          const hasSpan = Boolean(from && to && from !== to)
          const column = index % 7

          const band = between
            ? `bg-blue/[0.09] ${column === 0 ? 'rounded-l-lg' : ''} ${column === 6 ? 'rounded-r-lg' : ''}`
            : hasSpan && isStart
              ? 'rounded-l-lg bg-blue/[0.09]'
              : hasSpan && isEnd
                ? 'rounded-r-lg bg-blue/[0.09]'
                : ''

          const tone =
            isStart || isEnd
              ? 'bg-navy font-semibold text-white'
              : between
                ? 'text-navy hover:bg-blue/15'
                : iso === today
                  ? 'font-semibold text-blue hover:bg-canvas'
                  : 'text-ink/80 hover:bg-canvas'

          return (
            <div key={iso} className={`flex justify-center py-0.5 ${band}`}>
              <button
                type="button"
                aria-label={fullDate.format(new Date(`${iso}T00:00:00`))}
                aria-pressed={isStart || isEnd}
                onClick={() => onPick(iso)}
                className={`size-9 rounded-lg text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue ${tone}`}
              >
                {Number(iso.slice(8))}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
