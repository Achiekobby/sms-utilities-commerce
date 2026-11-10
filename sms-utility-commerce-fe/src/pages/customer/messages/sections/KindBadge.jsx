import { Hash, Users } from 'lucide-react'
import { messageTypeLabel } from '../query'

const styles = {
  numbers: {
    icon: Hash,
    className: 'bg-[#E0F2FE] text-[#0284C7] ring-1 ring-[#38BDF8]/35',
  },
  groups: {
    icon: Users,
    className: 'bg-[#FFEDD5] text-[#C2410C] ring-1 ring-[#FB923C]/40',
  },
}

export function KindBadge({ kind }) {
  const style = styles[kind] ?? styles.numbers
  const Icon = style.icon
  const label = messageTypeLabel(kind)

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.className}`}>
      <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
      {label}
      <span className="sr-only">{kind === 'groups' ? 'Bulk message to groups' : 'Quick message to numbers'}</span>
    </span>
  )
}
