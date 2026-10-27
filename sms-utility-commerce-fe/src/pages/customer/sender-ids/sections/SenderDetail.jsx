import { X } from 'lucide-react'
import { Drawer } from '../../../../components/Drawer'
import { formatCreated } from '../../campaigns/model'
import { SenderStatus } from './SenderStatus'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function Fact({ label, children }) {
  return (
    <div className="border-b border-ink/10 py-3">
      <dt className="text-xs font-medium text-ink/50">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-navy">{children}</dd>
    </div>
  )
}

export function SenderDetail({ sender, onClose }) {
  return (
    <Drawer label={sender.name} onClose={onClose} widthClass="w-[min(28rem,calc(100vw-1.5rem))]">
      <div className="flex h-full flex-col bg-white">
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink/50">Sender ID</p>
            <h2 className="mt-1 font-mono text-lg font-bold tracking-wide text-navy">{sender.name}</h2>
            <div className="mt-2">
              <SenderStatus status={sender.status} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            data-autofocus="true"
            className={`-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-ink/55 transition-colors hover:bg-canvas hover:text-navy ${focusClass}`}
          >
            <X size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {sender.status === 'rejected' ? (
            <p className="rounded-xl bg-[#FFDFE1] px-3 py-3 text-sm leading-6 text-[#B8141F]">{sender.reason}</p>
          ) : null}
          <dl className={sender.status === 'rejected' ? 'mt-2' : ''}>
            <Fact label="Requested">{formatCreated(sender.requestedAt)}</Fact>
            <Fact label="Used for">{sender.purpose}</Fact>
            <Fact label="Sample SMS">{sender.sample}</Fact>
          </dl>
          {sender.status === 'pending' ? (
            <p className="mt-4 text-sm leading-6 text-ink/60">
              The networks are still reviewing this name. It cannot be used to send until it is approved.
            </p>
          ) : null}
        </div>
      </div>
    </Drawer>
  )
}
