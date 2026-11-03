import { motion, useReducedMotion } from 'framer-motion'
import { formatCount } from '../../dashboard/format'
import { contactStats } from '../data'

const ease = [0.22, 1, 0.36, 1]

// The four cards always share one row, so each card adapts to its own width instead:
// icon beside the figure -> icon stacked above the figure when the card is narrow.
function StatCard({ stat }) {
  const Icon = stat.icon

  return (
    <div className="@container/stat h-full min-w-0">
      <div className="flex h-full flex-col items-start gap-2 rounded-xl border border-[#D8E7FA] bg-white p-2.5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)] @min-[11rem]/stat:flex-row @min-[11rem]/stat:items-center @min-[11rem]/stat:gap-3 @min-[11rem]/stat:p-3.5">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg @min-[11rem]/stat:size-11 @min-[11rem]/stat:rounded-xl @min-[15rem]/stat:size-12"
          style={{ backgroundColor: stat.tint, color: stat.color }}
        >
          <Icon aria-hidden="true" className="size-[48%]" />
        </span>

        <div className="min-w-0">
          <p className="text-[11px] leading-4 font-semibold text-navy @min-[11rem]/stat:text-xs">{stat.label}</p>
          <p className="mt-0.5 text-[length:clamp(1.05rem,9.5cqw,1.6rem)] leading-tight font-bold tracking-tight whitespace-nowrap text-navy tabular-nums">
            {stat.value === null ? (
              <span className="skeleton inline-block h-[1.1em] w-10 rounded align-middle" />
            ) : (
              stat.value
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

// `stats` is null until GET /api/client/contact-groups/stats has answered. A failed request shows a dash.
export function ContactStats({ stats = null, failed = false, onRetry }) {
  const reduce = useReducedMotion()
  const cards = contactStats.map((card) => {
    let value = null
    if (stats) value = formatCount(stats[card.key])
    else if (failed) value = '–'
    return { ...card, value }
  })

  return (
    <section aria-label="Contact summary" className="mt-6 sm:mt-7">
      <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {cards.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="min-w-0"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease, delay: reduce ? 0 : index * 0.05 }}
          >
            <StatCard stat={stat} />
          </motion.div>
        ))}
      </div>

      {failed && !stats ? (
        <p role="status" className="mt-2 text-xs text-ink/60">
          We couldn&apos;t load the summary.{' '}
          <button
            type="button"
            onClick={onRetry}
            className="font-semibold text-blue hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            Try again
          </button>
        </p>
      ) : null}
    </section>
  )
}
