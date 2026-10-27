import { CircleCheck, CircleX, Clock } from 'lucide-react'
import { statusLabel } from '../model'

const tone = {
  approved: 'bg-[#E5F6EC] text-[#008859]',
  pending: 'bg-[#E7F1FC] text-blue',
  rejected: 'bg-[#FFDFE1] text-[#B8141F]',
}

const icons = {
  approved: CircleCheck,
  pending: Clock,
  rejected: CircleX,
}

export function SenderStatus({ status }) {
  const Icon = icons[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone[status] ?? 'bg-canvas text-navy'}`}>
      {Icon ? <Icon size={13} strokeWidth={2.3} aria-hidden="true" /> : null}
      {statusLabel[status] ?? status}
    </span>
  )
}
