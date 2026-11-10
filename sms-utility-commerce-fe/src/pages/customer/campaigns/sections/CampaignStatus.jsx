import { CalendarClock, CircleCheck, Clock3, Send } from 'lucide-react'
import { statusLabel } from '../model'

const tone = {
  completed: 'bg-[#E5F6EC] text-[#008859]',
  in_progress: 'bg-[#E7F1FC] text-blue',
  queued: 'bg-[#E7F1FC] text-blue',
  scheduled: 'bg-mint/15 text-green',
}

const icons = {
  completed: CircleCheck,
  in_progress: Send,
  queued: Clock3,
  scheduled: CalendarClock,
}

export function CampaignStatus({ status }) {
  const Icon = icons[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone[status] ?? 'bg-canvas text-navy'}`}
    >
      {Icon ? <Icon size={13} strokeWidth={2.3} aria-hidden="true" /> : null}
      {statusLabel[status] ?? status}
    </span>
  )
}
