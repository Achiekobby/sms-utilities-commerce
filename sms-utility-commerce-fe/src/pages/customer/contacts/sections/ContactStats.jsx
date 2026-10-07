import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'
import { contactStats } from '../data'

const ease = [0.22, 1, 0.36, 1]

function formatChange(change) {
  const value = Math.abs(change)
  return `${value % 1 === 0 ? value : value.toFixed(1)}%`
}

function Change({ change }) {
  const up = change >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight

  return (
    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] leading-4 tabular-nums @min-[11rem]/stat:mt-1 @min-[11rem]/stat:text-xs">
      <span className={`inline-flex items-center gap-0.5 font-semibold ${up ? 'text-green' : 'text-[#D7192A]'}`}>
        <Icon size={13} strokeWidth={2.6} aria-hidden="true" />
        <span className="sr-only">{up ? 'Up' : 'Down'} </span>
        {formatChange(change)}
      </span>
      <span className="hidden whitespace-nowrap text-navy/60 @min-[11rem]/stat:inline">vs last month</span>
    </p>
  )
}

function Sparkline({ values, color }) {
  const id = useId()
  const data = values.map((value, index) => ({ index, value }))
  const low = Math.min(...values)
  const high = Math.max(...values)
  const pad = (high - low) * 0.18 || 1

  return (
    <div aria-hidden="true" className="hidden h-14 min-w-14 flex-1 @min-[15rem]/stat:block">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[low - pad, high + pad]} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${id})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// The four cards always share one row, so each card adapts to its own width instead:
// full (icon, figures, sparkline) -> no sparkline -> icon stacked above the figures.
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
            {stat.value}
          </p>
          <Change change={stat.change} />
        </div>

        <Sparkline values={stat.trend} color={stat.color} />
      </div>
    </div>
  )
}

export function ContactStats() {
  const reduce = useReducedMotion()

  return (
    <section aria-label="Contact summary" className="mt-6 sm:mt-7">
      <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {contactStats.map((stat, index) => (
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
    </section>
  )
}
