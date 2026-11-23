import { Cake, ClipboardList, Megaphone } from 'lucide-react'

const sources = {
  campaign_promotion: {
    label: 'Promotion',
    icon: Megaphone,
    chip: 'border-[#C5DDF8] bg-[#E7F1FC] text-blue',
    mark: 'bg-white text-blue',
  },
  campaign_occasion: {
    label: 'Occasion',
    icon: Cake,
    chip: 'border-[#F6D7A8] bg-[#FFF6E8] text-[#C2410C]',
    mark: 'bg-white text-[#C2410C]',
  },
  survey: {
    label: 'Survey',
    icon: ClipboardList,
    chip: 'border-[#D4D0F5] bg-[#F3F0FF] text-[#5B4BC4]',
    mark: 'bg-white text-[#5B4BC4]',
  },
}

export function campaignSourceMeta(source) {
  return sources[String(source ?? '').toLowerCase()] ?? null
}

export function CampaignSourceBadge({ source }) {
  const meta = campaignSourceMeta(source)
  if (!meta) return null
  const Icon = meta.icon

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-1 text-xs font-semibold ${meta.chip}`}>
      <span className={`inline-flex size-5 items-center justify-center rounded-full ${meta.mark}`}>
        <Icon size={12} strokeWidth={2.4} aria-hidden="true" />
      </span>
      {meta.label}
    </span>
  )
}
