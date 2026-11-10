import { Ban, CalendarClock, CircleCheck, CircleDashed, LoaderCircle, Pause, Send, TriangleAlert } from 'lucide-react'
import { statusLabel } from '../model'

const tone = {
  draft: 'bg-[#F3F6FB] text-ink/70',
  active: 'bg-[#E5F6EC] text-[#008859]',
  scheduled: 'bg-[#FFF8EE] text-[#B45F06]',
  sending: 'bg-[#E7F1FC] text-blue',
  completed: 'bg-[#E5F6EC] text-[#008859]',
  paused: 'bg-[#F3F6FB] text-ink/65',
  failed: 'bg-[#FDECEE] text-[#C21F2D]',
  queued: 'bg-[#E7F1FC] text-blue',
  in_progress: 'bg-[#E7F1FC] text-blue',
}

const icons = {
  draft: CircleDashed,
  active: CircleCheck,
  scheduled: CalendarClock,
  sending: LoaderCircle,
  completed: CircleCheck,
  paused: Pause,
  failed: TriangleAlert,
  queued: Send,
  in_progress: Send,
}

export function CampaignStatus({ status }) {
  const key = status === 'in_progress' ? 'sending' : status
  const Icon = icons[key] ?? Ban

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone[key] ?? 'bg-canvas text-navy'}`}
    >
      <Icon size={13} strokeWidth={2.3} aria-hidden="true" className={key === 'sending' ? 'animate-spin' : undefined} />
      {statusLabel[status] ?? status}
    </span>
  )
}
