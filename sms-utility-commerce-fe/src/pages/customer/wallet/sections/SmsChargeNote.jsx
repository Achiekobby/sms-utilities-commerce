import { Plus } from 'lucide-react'
import { formatUnits } from '../money'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function SmsChargeNote({ cost, balance, onTopUp }) {
  if (cost <= balance) return null

  return (
    <div className="mt-4 rounded-xl bg-[#FFF4E5] px-4 py-3 text-sm leading-6 text-navy">
      <p>This send needs {formatUnits(cost - balance)} more than the wallet holds.</p>
      <button
        type="button"
        onClick={onTopUp}
        className={`mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg bg-green px-3 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
      >
        <Plus size={15} strokeWidth={2.3} aria-hidden="true" />
        Top up
      </button>
    </div>
  )
}
