import { X } from 'lucide-react'
import { Drawer } from '../../../../components/Drawer'
import { TopUpForm } from './TopUpForm'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function TopUpDrawer({ onClose }) {
  return (
    <Drawer label="Top up" onClose={onClose} widthClass="w-[min(32rem,calc(100vw-1.5rem))]">
      <div className="flex h-full flex-col bg-white">
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-navy">Top up</h2>
            <p className="mt-0.5 text-[13px] text-ink/60">Add money, then come back to this send.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-ink/55 transition-colors hover:bg-canvas hover:text-navy ${focusClass}`}
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 flex-1 px-5 py-4">
          <TopUpForm onDone={onClose} onCancel={onClose} />
        </div>
      </div>
    </Drawer>
  )
}
