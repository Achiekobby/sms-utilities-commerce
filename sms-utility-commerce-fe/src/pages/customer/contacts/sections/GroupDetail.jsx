import { Archive, ArrowLeft, ChartPie, CloudUpload, Files, Loader2, Pencil, UserPlus, Users } from 'lucide-react'
import { Link } from 'react-router'
import { RiForbid2Line, RiGroupFill, RiProhibited2Fill, RiTimeFill } from 'react-icons/ri'
import { paths } from '../../../../routes/paths'
import { formatCount } from '../../dashboard/format'
import { GroupContacts } from './GroupContacts'
import { useUploadWatch } from '../uploads/useUploadWatch'

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

function RunningUploads({ groupId }) {
  const list = useUploadWatch(groupId, 1)
  const running = (list.data?.rows ?? []).filter((item) => item.running)
  if (!running.length) return null
  const lead = running[0]

  return (
    <Link
      to={paths.contactUploads(groupId)}
      className={`mt-4 flex items-center gap-3 rounded-xl border border-blue/20 bg-[#F0F6FE] px-4 py-3 ${focusClass}`}
    >
      <Loader2 size={18} className="shrink-0 animate-spin text-blue motion-reduce:animate-none" aria-hidden="true" />
      <span className="min-w-0 flex-1 text-sm text-navy">
        <span className="font-semibold">{lead.fileName}</span> is being added
        {running.length > 1 ? ` · ${running.length - 1} more still running` : ''} · {lead.progress}%
      </span>
      <span className="shrink-0 text-sm font-semibold text-blue">View uploads</span>
    </Link>
  )
}

export function GroupDetail({ group, onAddContact, onArchive, onEdit, onOpenInsights, notice, onNotice }) {
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
          <button type="button" onClick={onEdit} aria-label="Edit group" className={secondary}>
            <Pencil strokeWidth={2} aria-hidden="true" className={`${actionIcon} text-blue`} />
            <span className={actionLabel}>Edit</span>
          </button>
          {onArchive ? (
            <button type="button" onClick={onArchive} aria-label="Archive group" className={secondary}>
              <Archive strokeWidth={2} aria-hidden="true" className={`${actionIcon} text-[#B45F06]`} />
              <span className={actionLabel}>Archive</span>
            </button>
          ) : null}
          <Link to={paths.contactUploads(group.id)} aria-label="View uploads" className={secondary}>
            <Files strokeWidth={2} aria-hidden="true" className={`${actionIcon} text-blue`} />
            <span className={actionLabel}>Uploads</span>
          </Link>
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

      <RunningUploads groupId={group.id} />
      <GroupContacts key={group.id} group={group} onAdd={onAddContact} notice={notice} onNotice={onNotice} />
    </section>
  )
}
