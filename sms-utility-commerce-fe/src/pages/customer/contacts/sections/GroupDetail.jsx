import { ArrowLeft, ChartPie, CloudUpload, UserPlus, Users } from 'lucide-react'
import { Link } from 'react-router'
import { RiForbid2Line, RiGroupFill, RiProhibited2Fill, RiTimeFill } from 'react-icons/ri'
import { paths } from '../../../../routes/paths'
import { formatCount } from '../../dashboard/format'
import { MembersTable } from './MembersTable'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

// Compact until the card is wide enough for the labels to sit beside the title.
const actionIcon = 'size-4 shrink-0 @3xl/detail:size-[15px]'
const actionLabel = 'hidden @3xl/detail:inline'

const secondary = `inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-ink/15 bg-white px-2 text-xs font-semibold whitespace-nowrap text-navy shadow-[0_1px_2px_rgba(16,33,61,0.05)] transition-colors hover:border-blue/40 hover:bg-canvas @3xl/detail:h-9 @3xl/detail:gap-2 @3xl/detail:px-3 @3xl/detail:text-[13px] ${focusClass}`

const primary = `inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-green px-2 text-xs font-semibold whitespace-nowrap text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] @3xl/detail:h-9 @3xl/detail:gap-2 @3xl/detail:px-3.5 @3xl/detail:text-[13px] ${focusClass}`

const breakdownTiles = [
  { key: 'active', label: 'Active', icon: RiGroupFill, color: '#008859', tint: '#DDF3E6' },
  { key: 'pending', label: 'Pending', icon: RiTimeFill, color: '#E8890C', tint: '#FFEBCB' },
  { key: 'unsubscribed', label: 'Unsubscribed', icon: RiProhibited2Fill, color: '#E0287D', tint: '#FFDDE8' },
  { key: 'blocked', label: 'Blocked', icon: RiForbid2Line, color: '#D7192A', tint: '#FFDFE1' },
]

export function GroupDetail({ group, onAddContact, onOpenInsights }) {
  const Icon = group.icon

  return (
    <section
      aria-labelledby="group-heading"
      className="@container/detail min-w-0 flex-1 rounded-xl border border-[#D8E7FA] bg-white p-4 shadow-[0_1px_2px_rgba(20,115,230,0.06),0_8px_22px_-14px_rgba(20,115,230,0.35)] sm:p-5"
    >
      <header className="flex flex-nowrap items-center gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl @3xl/detail:size-14"
            style={{ backgroundColor: group.tint, color: group.color }}
          >
            <Icon aria-hidden="true" className="size-5 @3xl/detail:size-[26px]" />
          </span>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-x-2.5">
              <h2 id="group-heading" className="truncate text-base font-bold tracking-tight text-navy @3xl/detail:text-lg @5xl/detail:text-xl">
                {group.name}
              </h2>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#E4ECFA] px-2.5 py-0.5 text-[11px] font-semibold text-navy tabular-nums @3xl/detail:px-3 @3xl/detail:py-1 @3xl/detail:text-xs">
                <Users size={12} strokeWidth={2.3} aria-hidden="true" />
                {formatCount(group.count)} contacts
              </span>
            </div>
            <p className="mt-0.5 truncate text-xs text-ink/60 @3xl/detail:text-[13px]">{group.description}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 @3xl/detail:gap-2">
          <Link to={paths.contactUpload(group.id)} aria-label="Import contacts" className={secondary}>
            <CloudUpload strokeWidth={2} aria-hidden="true" className={`${actionIcon} text-blue`} />
            <span className={actionLabel}>Import Contacts</span>
          </Link>
          <button type="button" onClick={onOpenInsights} aria-haspopup="dialog" aria-label="Insights" className={secondary}>
            <ChartPie strokeWidth={2} aria-hidden="true" className={`${actionIcon} text-blue`} />
            <span className={actionLabel}>Insights</span>
          </button>
          <Link to={paths.contacts} aria-label="Back to groups" className={secondary}>
            <ArrowLeft strokeWidth={2.2} aria-hidden="true" className={`${actionIcon} text-blue`} />
            <span className={actionLabel}>Groups</span>
          </Link>
          <button type="button" onClick={onAddContact} aria-label="Add contact" className={primary}>
            <UserPlus strokeWidth={2} aria-hidden="true" className={actionIcon} />
            <span className={actionLabel}>Add Contact</span>
          </button>
        </div>
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-2.5 @3xl/detail:grid-cols-4">
        {breakdownTiles.map((tile) => {
          const TileIcon = tile.icon
          return (
            <div
              key={tile.key}
              className="flex items-center gap-2.5 rounded-xl border border-[#E1EAF6] bg-white p-3"
            >
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: tile.tint, color: tile.color }}
              >
                <TileIcon size={20} />
              </span>
              <div className="min-w-0">
                <dt className="text-xs font-semibold text-navy">{tile.label}</dt>
                <dd className="text-xl leading-7 font-bold tracking-tight text-navy tabular-nums">
                  {formatCount(group.breakdown[tile.key])}
                </dd>
              </div>
            </div>
          )
        })}
      </dl>

      {/* Keyed by group so search, filters, selection and page reset when another group is chosen. */}
      <MembersTable key={group.id} group={group} />
    </section>
  )
}
