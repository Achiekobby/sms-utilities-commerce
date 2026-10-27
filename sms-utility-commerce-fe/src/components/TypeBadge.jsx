import { ClipboardList, Megaphone, Receipt } from 'lucide-react'
import { typeLabel } from '../pages/customer/campaigns/model'

export const typeIcons = {
  promotional: Megaphone,
  transactional: Receipt,
  survey: ClipboardList,
}

export function TypeBadge({ type }) {
  const Icon = typeIcons[type] ?? Megaphone

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E7F1FC] px-2.5 py-1 text-xs font-semibold text-blue">
      <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
      {typeLabel(type)}
    </span>
  )
}
