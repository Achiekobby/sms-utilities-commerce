import { motion, useReducedMotion } from 'framer-motion'
import { formatCount } from '../../dashboard/format'
import { contactStats } from '../data'

const ease = [0.22, 1, 0.36, 1]

// Cards stack to a 2×2 grid on small screens, then one row from md up.
// Inside each card, the icon sits beside the figure once the card is wide enough.
function StatCard({ stat }) {
  const Icon = stat.icon

  return (
    <div className="flex h-full min-w-0 flex-row items-center gap-3 rounded-xl border border-[#D8E7FA] bg-white p-3.5 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)]">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11"
        style={{ backgroundColor: stat.tint, color: stat.color }}
      >
        <Icon aria-hidden="true" className="size-[48%]" />
      </span>

      <div className="min-w-0">
        <p className="text-xs leading-4 font-semibold text-navy">{stat.label}</p>
        <p className="mt-0.5 truncate text-xl leading-tight font-bold tracking-tight text-navy tabular-nums sm:text-[1.35rem]">
          {stat.value === null ? (
            <span className="skeleton inline-block h-[1.1em] w-10 rounded align-middle" />
          ) : (
            stat.value
          )}
        </p>
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
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4 md:gap-4">
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
