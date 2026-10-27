import { Hash, Users } from 'lucide-react'
import { kindLabel } from '../model'

const icons = {
  numbers: Hash,
  groups: Users,
}

export function KindBadge({ kind }) {
  const Icon = icons[kind]

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-2.5 py-1 text-xs font-semibold text-green">
      {Icon ? <Icon size={13} strokeWidth={2.3} aria-hidden="true" /> : null}
      {kindLabel(kind)}
    </span>
  )
}
