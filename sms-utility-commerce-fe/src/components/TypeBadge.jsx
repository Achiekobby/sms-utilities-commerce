import { Cake, ClipboardList, Gift, Megaphone, PenLine, Receipt, Tag } from 'lucide-react'
import { typeLabel } from '../pages/customer/campaigns/model'

export const typeIcons = {
  occasion: Cake,
  promotion: Megaphone,
  // Legacy template / content labels still seen in older local data
  promotional: Megaphone,
  transactional: Receipt,
  survey: ClipboardList,
  other: PenLine,
  birthday: Gift,
  sale: Tag,
}

const tone = {
  occasion: 'bg-[#FFF1E8] text-[#C2410C]',
  promotion: 'bg-[#E7F1FC] text-blue',
  promotional: 'bg-[#E7F1FC] text-blue',
  transactional: 'bg-[#E8F1FF] text-navy',
  survey: 'bg-[#F3F6FB] text-navy',
  other: 'bg-[#F3F6FB] text-navy',
}

export function TypeBadge({ type }) {
  const Icon = typeIcons[type] ?? Megaphone

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        tone[type] ?? 'bg-[#E7F1FC] text-blue'
      }`}
    >
      <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
      {typeLabel(type)}
    </span>
  )
}
