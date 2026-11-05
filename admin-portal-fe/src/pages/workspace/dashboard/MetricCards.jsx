import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { metrics } from './data'

const ease = [0.22, 1, 0.36, 1]

function formatChange(change) {
  const value = Math.abs(change)
  return `${value % 1 === 0 ? value : value.toFixed(1)}%`
}

function Change({ change }) {
  const up = change >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight

  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-1.5 text-[13px] leading-5 tabular-nums">
      <span className={`inline-flex items-center gap-0.5 font-semibold ${up ? 'text-green' : 'text-[#D7192A]'}`}>
        <Icon size={15} strokeWidth={2.4} aria-hidden="true" />
        <span className="sr-only">{up ? 'Up' : 'Down'} </span>
        {formatChange(change)}
      </span>
      <span className="text-ink/45">vs last month</span>
    </p>
  )
}

function MetricCard({ metric }) {
  const Icon = metric.icon

  return (
    <div className="@container/card flex h-full flex-col rounded-lg border border-ink/[0.05] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_10px_24px_-18px_rgba(11,31,91,0.45)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(16,33,61,0.05),0_16px_32px_-16px_rgba(11,31,91,0.5)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5">
      <span className="flex size-11 items-center justify-center rounded-md" style={{ backgroundColor: metric.tint, color: metric.color }}>
        <Icon size={20} aria-hidden="true" />
      </span>
      <p className="mt-4 text-sm font-medium text-ink/70">{metric.label}</p>
      <p className="mt-1 flex items-baseline gap-1.5 text-[length:clamp(1.125rem,13cqw,1.75rem)] leading-none font-bold tracking-tight whitespace-nowrap text-navy tabular-nums">
        {metric.prefix ? <span>{metric.prefix}</span> : null}
        {metric.value}
      </p>
      <Change change={metric.change} />
    </div>
  )
}

export function MetricCards() {
  const reduce = useReducedMotion()

  return (
    <section aria-label="Platform totals" className="mt-4 w-full min-w-0 sm:mt-5">
      <div className="grid w-full grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease, delay: reduce ? 0 : index * 0.05 }}
          >
            <MetricCard metric={metric} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
