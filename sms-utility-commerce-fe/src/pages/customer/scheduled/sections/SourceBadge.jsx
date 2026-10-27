import { Hash, Megaphone, Users } from 'lucide-react'
import { scheduleSources } from '../queue'

const icons = {
  campaign: Megaphone,
  groups: Users,
  numbers: Hash,
}

const tone = {
  campaign: 'bg-[#E7F1FC] text-blue',
  groups: 'bg-mint/15 text-green',
  numbers: 'bg-mint/15 text-green',
}

export function SourceBadge({ source }) {
  const Icon = icons[source] ?? Megaphone
  const label = scheduleSources.find((item) => item.id === source)?.label ?? source

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone[source] ?? 'bg-canvas text-navy'}`}>
      <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
      {label}
    </span>
  )
}
