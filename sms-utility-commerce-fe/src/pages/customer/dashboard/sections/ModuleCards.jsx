import { ArrowRight, Gift, LayoutGrid, Lightbulb, Smartphone, Tv, Users, Zap } from 'lucide-react'
import { IoCaretUp } from 'react-icons/io5'
import { formatCount } from '../format'

const card =
  '@container/mod flex h-full min-w-0 flex-col rounded-xl border border-ink/[0.06] bg-white p-4 shadow-[0_1px_2px_rgba(16,33,61,0.04),0_12px_28px_-18px_rgba(11,31,91,0.45)] sm:p-5'

const action =
  'mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue/25 text-sm font-semibold text-blue transition-colors hover:bg-blue/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const rewardBars = [22, 28, 32, 38, 42, 48, 46, 54, 60, 66, 72, 78, 86, 94]
const surveyBars = [48, 70, 42, 88, 56, 96, 64, 78, 52, 84, 60, 92, 74]

const utilities = [
  { label: 'Airtime', icon: Smartphone, color: '#008859', tint: '#E5F6EC' },
  { label: 'Data', icon: Smartphone, color: '#0B63F6', tint: '#E7F1FC' },
  { label: 'Electricity', icon: Lightbulb, color: '#E26A00', tint: '#FFF1E4' },
  { label: 'TV', icon: Tv, color: '#7C3AED', tint: '#F3E8FF' },
]

const activity = [
  {
    initials: 'JD',
    name: 'John Doe',
    action: 'Created campaign "Product Launch"',
    time: '2h ago',
    color: '#0B63F6',
    tint: '#E7F1FC',
  },
  {
    initials: 'SN',
    name: 'Sarah Nelson',
    action: 'Updated sender ID "BRAND"',
    time: '5h ago',
    color: '#7C3AED',
    tint: '#F3E8FF',
  },
  {
    initials: 'MK',
    name: 'Michael K.',
    action: 'Added 1,250 contacts',
    time: '1d ago',
    color: '#E26A00',
    tint: '#FFF1E4',
  },
  {
    initials: 'AT',
    name: 'Aisha T.',
    action: 'Generated campaign report',
    time: '1d ago',
    color: '#008859',
    tint: '#E5F6EC',
  },
]

function ViewAll() {
  return (
    <button
      type="button"
      className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue transition-colors hover:text-blue/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
    >
      <span className="@max-[12rem]/mod:sr-only">View all</span>
      <ArrowRight size={13} strokeWidth={2.2} aria-hidden="true" />
    </button>
  )
}

function CardTitle({ icon: Icon, color, children }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h2 className="flex min-w-0 items-center gap-2 text-sm font-bold text-navy">
        <Icon size={18} strokeWidth={2.2} aria-hidden="true" style={{ color }} className="shrink-0" />
        <span className="truncate">{children}</span>
      </h2>
      <ViewAll />
    </div>
  )
}

function Stat({ value, label, change }) {
  return (
    <div className="mt-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-1.5">
      <p>
        <span className="block text-[length:clamp(1.35rem,13cqw,1.7rem)] leading-none font-bold tracking-tight text-navy tabular-nums">
          {formatCount(value)}
        </span>
        <span className="mt-1 block text-xs text-ink/50">{label}</span>
      </p>
      <p className="pb-0.5 text-right">
        <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-green">
          <IoCaretUp size={12} aria-hidden="true" />
          <span className="sr-only">Up </span>
          {change}%
        </span>
        <span className="mt-0.5 block text-[11px] whitespace-nowrap text-ink/45">vs last month</span>
      </p>
    </div>
  )
}

function Bars({ heights, color }) {
  return (
    <div className="flex h-14 items-end gap-[3px]" aria-hidden="true">
      {heights.map((height, index) => (
        <span
          key={index}
          className="min-w-0 flex-1 rounded-[2px]"
          style={{ height: `${height}%`, backgroundColor: color, opacity: 0.45 + (height / 100) * 0.55 }}
        />
      ))}
    </div>
  )
}

function Action({ children }) {
  return (
    <button type="button" className={action}>
      {children}
      <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
    </button>
  )
}

export function ModuleCards() {
  return (
    <section aria-label="Rewards, utilities, surveys and team" className="@container/modules mt-6 sm:mt-7">
      <div className="grid items-stretch gap-4 @xl/modules:grid-cols-2 @4xl/modules:grid-cols-4">
        <article className={card}>
          <CardTitle icon={Gift} color="#0B63F6">
            Rewards & Loyalty
          </CardTitle>
          <Stat value={12450} label="Points Earned" change={18} />
          <div className="mt-5 flex-1">
            <Bars heights={rewardBars} color="#3B82F6" />
            <p className="mt-3 text-xs text-ink/50">Redeem for discounts and perks</p>
          </div>
          <Action>Explore Rewards</Action>
        </article>

        <article className={card}>
          <CardTitle icon={Zap} color="#0B63F6">
            Utility Marketplace
          </CardTitle>
          <Stat value={1240} label="Transactions" change={28} />
          <ul className="mt-5 grid flex-1 grid-cols-4 content-center gap-1">
            {utilities.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.label} className="text-center">
                  <span
                    className="mx-auto flex aspect-square w-full max-w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: item.tint, color: item.color }}
                  >
                    <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <span className="mt-1.5 block text-[10px] text-ink/55 @min-[14rem]/mod:text-[11px]">
                    {item.label}
                  </span>
                </li>
              )
            })}
          </ul>
          <Action>Browse Utilities</Action>
        </article>

        <article className={card}>
          <CardTitle icon={LayoutGrid} color="#D946A8">
            Surveys
          </CardTitle>
          <Stat value={8421} label="Responses" change={35} />
          <div className="mt-5 flex-1">
            <Bars heights={surveyBars} color="#8B5CF6" />
            <p className="mt-3 text-xs text-ink/50">
              Avg. response rate <span className="font-bold text-navy">72%</span>
            </p>
          </div>
          <Action>Create Survey</Action>
        </article>

        <article className={card}>
          <CardTitle icon={Users} color="#0B63F6">
            Team Activity
          </CardTitle>
          <ul className="mt-4 flex-1 space-y-3.5">
            {activity.map((item) => (
              <li key={item.initials} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{ backgroundColor: item.tint, color: item.color }}
                >
                  {item.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-navy">{item.name}</p>
                    <p className="shrink-0 text-[11px] text-ink/40">{item.time}</p>
                  </div>
                  <p className="truncate text-xs text-ink/55">{item.action}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
