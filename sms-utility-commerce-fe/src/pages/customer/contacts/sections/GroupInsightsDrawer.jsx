import { ArrowRight, X } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import { formatCount } from '../../dashboard/format'
import { getGroupActivity, insightStatuses } from '../insights'

const size = 220
const stroke = 26
const radius = (size - stroke) / 2
const circumference = 2 * Math.PI * radius
const gap = 2

function share(value, total) {
  return `${total ? ((value / total) * 100).toFixed(1) : '0.0'}%`
}

function StatusDonut({ group, hovered, onHover }) {
  const total = group.count
  const slices = insightStatuses.reduce((list, status) => {
    const value = group.breakdown[status.key]
    const start = list.length ? list[list.length - 1].end : 0
    return [...list, { ...status, value, start, end: start + (total ? value / total : 0) }]
  }, [])
  const focus = slices.find((slice) => slice.key === hovered)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Contacts by status">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EEF3FA" strokeWidth={stroke} />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {slices.filter((slice) => slice.value > 0).map((slice) => {
            const length = Math.max((slice.end - slice.start) * circumference - gap, 1.5)
            return (
              <circle
                key={slice.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={hovered === slice.key ? stroke + 3 : stroke}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-slice.start * circumference}
                opacity={hovered && hovered !== slice.key ? 0.35 : 1}
                className="cursor-pointer transition-[opacity,stroke-width] duration-150"
                onMouseEnter={() => onHover(slice.key)}
                onMouseLeave={() => onHover(null)}
              >
                <title>{`${slice.label}: ${formatCount(slice.value)} (${share(slice.value, total)})`}</title>
              </circle>
            )
          })}
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl leading-8 font-bold tracking-tight text-navy tabular-nums">
          {formatCount(focus ? focus.value : total)}
        </span>
        <span className="mt-1 text-[13px] text-ink/60">{focus ? focus.label : 'Total Contacts'}</span>
      </div>
    </div>
  )
}

function Insights({ group }) {
  const [hovered, setHovered] = useState(null)

  return (
    <section aria-labelledby="insights-breakdown" className="px-5 py-5">
      <h3 id="insights-breakdown" className="text-sm font-bold text-navy">
        Contacts by status
      </h3>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4">
        <StatusDonut group={group} hovered={hovered} onHover={setHovered} />

        <ul className="min-w-44 flex-1 divide-y divide-ink/[0.07]">
          {insightStatuses.map((status) => (
            <li
              key={status.key}
              onMouseEnter={() => setHovered(status.key)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-2.5 py-2 text-[13px] transition-opacity first:pt-0 last:pb-0 ${
                hovered && hovered !== status.key ? 'opacity-50' : ''
              }`}
            >
              <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: status.color }} />
              <span className="flex-1 text-ink/80">{status.label}</span>
              <span className="font-semibold text-navy tabular-nums">{formatCount(group.breakdown[status.key])}</span>
              <span className="w-12 text-right text-xs text-ink/55 tabular-nums">
                {share(group.breakdown[status.key], group.count)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Activity({ group, onViewAll }) {
  const items = getGroupActivity(group)

  if (!group.count) {
    return (
      <section aria-labelledby="insights-activity" className="border-t border-ink/10 px-5 py-5">
        <h3 id="insights-activity" className="text-sm font-bold text-navy">
          Recent Group Activity
        </h3>
        <p className="mt-3 rounded-xl border border-dashed border-ink/15 px-4 py-8 text-center text-[13px] leading-5 text-ink/60">
          Nothing has happened in this group yet. Upload contacts and the activity will show up here.
        </p>
      </section>
    )
  }

  return (
    <section aria-labelledby="insights-activity" className="border-t border-ink/10 px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <h3 id="insights-activity" className="text-sm font-bold text-navy">
          Recent Group Activity
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 rounded text-[13px] font-semibold text-blue hover:text-[#0056D6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          View All
          <ArrowRight size={14} strokeWidth={2.2} aria-hidden="true" />
        </button>
      </div>

      <ol className="relative mt-4">
        <span aria-hidden="true" className="absolute top-3 bottom-3 left-[3px] w-px bg-blue/25" />
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id} className="relative flex items-center gap-3 py-2.5 pl-5">
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-0 size-[7px] -translate-y-1/2 rounded-full"
                style={{ backgroundColor: item.dot }}
              />
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: item.tint, color: item.color }}
              >
                <Icon size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-5 font-semibold text-navy">{item.title}</p>
                <p className="text-xs leading-4 text-ink/55">{item.detail}</p>
              </div>
              <span className="shrink-0 text-xs whitespace-nowrap text-ink/55">{item.when}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export function GroupInsightsDrawer({ group, onViewAll, onClose }) {
  return (
    <Drawer
      label={`${group.name} insights`}
      side="right"
      onClose={onClose}
      widthClass="w-[min(32rem,calc(100vw-1.5rem))]"
    >
      <div className="flex h-full flex-col bg-white">
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-navy">Group Insights</h2>
            <p className="mt-0.5 truncate text-[13px] text-ink/60">{group.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close insights"
            className="-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-ink/55 transition-colors hover:bg-canvas hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue"
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Insights key={group.id} group={group} />
          <Activity group={group} onViewAll={onViewAll} />
        </div>
      </div>
    </Drawer>
  )
}
