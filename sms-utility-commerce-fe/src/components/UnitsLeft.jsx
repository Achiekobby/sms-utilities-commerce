import { Layers } from 'lucide-react'
import { Link } from 'react-router'
import { paths } from '../routes/paths'
import { useGetClientSubscriptionQuery } from '../services/api/subscriptions/subscriptionsApi'
import { formatCount } from '../pages/customer/dashboard/format'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function UnitsLeft() {
  const subscription = useGetClientSubscriptionQuery()
  const units = subscription.data?.units
  const known = units != null && Number.isFinite(units)
  const empty = known && units <= 0

  const value = subscription.isLoading ? '…' : known ? formatCount(units) : '—'
  const label = known && units === 1 ? 'unit left' : 'units left'

  return (
    <Link
      to={paths.plans}
      className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm ${focusClass} ${
        empty
          ? 'border-[#E7C27A] bg-[#FFF8EC] text-[#8A4B08] hover:border-[#D7A84A]'
          : 'border-[#D8E7FA] bg-[#F7FBFF] text-navy hover:border-blue/40'
      }`}
    >
      <Layers size={16} strokeWidth={2.2} aria-hidden="true" className={empty ? 'text-[#B45F06]' : 'text-blue'} />
      <span className="font-bold tabular-nums">{value}</span>
      <span className="font-medium text-ink/60">{known || subscription.isLoading ? label : 'No plan'}</span>
    </Link>
  )
}
