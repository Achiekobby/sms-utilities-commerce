import { Cake, ClipboardList, Gift, Hash, Megaphone, PenLine, Receipt, Tag, Users } from 'lucide-react'
import { typeLabel } from '../pages/customer/campaigns/model'
import { templateTypeLabel } from '../features/templates/templateModel'

export const typeIcons = {
  occasion: Cake,
  campaign_occasion: Cake,
  promotion: Megaphone,
  campaign_promotion: Megaphone,
  // Legacy template / content labels still seen in older local data
  promotional: Megaphone,
  transactional: Receipt,
  survey: ClipboardList,
  quick_sms: Hash,
  bulk_sms: Users,
  other: PenLine,
  birthday: Gift,
  sale: Tag,
}

const tone = {
  occasion: 'bg-[#FFF1E8] text-[#C2410C]',
  campaign_occasion: 'bg-[#FFF1E8] text-[#C2410C]',
  promotion: 'bg-[#E7F1FC] text-blue',
  campaign_promotion: 'bg-[#E7F1FC] text-blue',
  promotional: 'bg-[#E7F1FC] text-blue',
  transactional: 'bg-[#E8F1FF] text-navy',
  survey: 'bg-[#F3F6FB] text-navy',
  quick_sms: 'bg-[#E5F6EC] text-[#008859]',
  bulk_sms: 'bg-[#E7F1FC] text-blue',
  other: 'bg-[#F3F6FB] text-navy',
}

export function TypeBadge({ type }) {
  const Icon = typeIcons[type] ?? Megaphone
  const label = typeLabel(type) !== type ? typeLabel(type) : templateTypeLabel(type)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        tone[type] ?? 'bg-[#E7F1FC] text-blue'
      }`}
    >
      <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
      {label}
    </span>
  )
}
