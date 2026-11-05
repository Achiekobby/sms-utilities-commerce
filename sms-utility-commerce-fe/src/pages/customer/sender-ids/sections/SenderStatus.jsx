import { CheckCircle2, CircleX, Clock3 } from 'lucide-react'
import { statusLabel } from '../model'

const look = {
  approved: { icon: CheckCircle2, className: 'bg-[#DDF3E6] text-[#0E7A38]' },
  pending: { icon: Clock3, className: 'bg-[#FFF4DF] text-[#B45F06]' },
  rejected: { icon: CircleX, className: 'bg-[#FDECEE] text-[#C21F2D]' },
}

export function SenderStatus({ status, compact = false }) {
  const label = statusLabel[status] ?? (status ? status.charAt(0).toUpperCase() + status.slice(1) : '')
  if (!label) return null
  const tone = look[status] ?? { icon: Clock3, className: 'bg-[#F3F6FB] text-navy' }
  const Icon = tone.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 font-semibold ${tone.className} ${
        compact ? 'text-[11px]' : 'text-xs'
      }`}
    >
      <Icon size={compact ? 11 : 12} strokeWidth={2.3} aria-hidden="true" className="shrink-0" />
      {label}
    </span>
  )
}
