import { ArrowDownLeft, ArrowUpRight, CircleCheck, Clock } from 'lucide-react'

export function EntryTypeBadge({ type }) {
  const credit = type === 'credit'
  const Icon = credit ? ArrowDownLeft : ArrowUpRight

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        credit ? 'bg-mint/15 text-green' : 'bg-[#E7F1FC] text-blue'
      }`}
    >
      <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
      {credit ? 'Credit' : 'Debit'}
    </span>
  )
}

export function EntryStatusBadge({ status }) {
  const done = status === 'completed'
  const Icon = done ? CircleCheck : Clock

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        done ? 'bg-[#E5F6EC] text-green' : 'bg-[#E7F1FC] text-blue'
      }`}
    >
      <Icon size={13} strokeWidth={2.3} aria-hidden="true" />
      {done ? 'Completed' : 'Pending'}
    </span>
  )
}
