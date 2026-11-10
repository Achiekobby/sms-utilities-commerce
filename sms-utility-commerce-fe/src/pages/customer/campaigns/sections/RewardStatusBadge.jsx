import { rewardStatusLabels, rewardStatusTone } from '../reward'

export function RewardStatusBadge({ status }) {
  const label = rewardStatusLabels[status] ?? status
  const tone = rewardStatusTone[status] ?? 'bg-[#EEF2F7] text-ink/55'
  return (
    <span className={`inline-flex h-6 items-center rounded-md px-2 text-[11px] font-semibold ${tone}`}>
      {label}
    </span>
  )
}
