import { Bell, Calendar, Camera, FolderOpen, MapPin, Mic, Users } from 'lucide-react'
import { focusClass } from './ui'

const icons = {
  camera: Camera,
  microphone: Mic,
  location: MapPin,
  notifications: Bell,
  files: FolderOpen,
  contacts: Users,
  calendar: Calendar,
}

const badges = {
  allowed: { label: 'Allowed', className: 'bg-[#DDF3E6] text-[#0E7A38]', dot: 'bg-[#0E7A38]' },
  blocked: { label: 'Blocked', className: 'bg-[#FDECEE] text-[#9F1C26]', dot: 'bg-[#C21F2D]' },
  ask: { label: 'Ask', className: 'bg-[#F3F6FB] text-ink/70', dot: 'bg-ink/35' },
  unavailable: { label: 'Unavailable', className: 'bg-[#F3F6FB] text-ink/70', dot: 'bg-ink/35' },
}

export function PermissionRow({ item, state, busy, onAllow }) {
  const Icon = icons[item.id] ?? Bell
  const badge = badges[state] ?? badges.unavailable
  const canAsk = state === 'ask' && item.query

  return (
    <li className="flex flex-col gap-3 border-b border-ink/[0.06] py-4 last:border-b-0 sm:flex-row sm:items-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F6FB] text-navy">
        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-navy">{item.title}</h3>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${badge.className}`}>
            <span aria-hidden="true" className={`size-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
        </div>
        <p className="mt-1 text-sm leading-5 text-ink/60">{item.description}</p>
      </div>
      <div className="sm:shrink-0">
        {canAsk ? (
          <button
            type="button"
            onClick={onAllow}
            disabled={busy}
            className={`inline-flex h-9 cursor-pointer items-center rounded-lg bg-navy px-3 text-sm font-semibold text-white hover:bg-[#0a3268] disabled:cursor-wait disabled:opacity-60 ${focusClass}`}
          >
            {busy ? 'Asking' : 'Allow'}
          </button>
        ) : (
          <p className="text-sm text-ink/55">{state === 'blocked' || state === 'allowed' ? 'Manage browser permission' : 'Manage in device settings'}</p>
        )}
      </div>
    </li>
  )
}
