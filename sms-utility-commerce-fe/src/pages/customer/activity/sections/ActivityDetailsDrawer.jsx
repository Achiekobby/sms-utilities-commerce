import { X } from 'lucide-react'
import { Drawer } from '../../../../components/Drawer'
import { formatStamp } from '../../../../features/contacts/contactImport'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function Fact({ label, children }) {
  return (
    <div className="border-b border-ink/10 py-3 last:border-b-0">
      <dt className="text-xs font-medium text-ink/50">{label}</dt>
      <dd className="mt-0.5 text-sm text-navy">{children || '—'}</dd>
    </div>
  )
}

function Party({ party }) {
  if (!party?.name && !party?.email) return '—'
  return (
    <span className="block">
      {party.name ? <span className="block">{party.name}</span> : null}
      {party.email ? <span className="block text-[13px] text-ink/55">{party.email}</span> : null}
    </span>
  )
}

export function ActivityDetailsDrawer({ entry, onClose }) {
  const when = formatStamp(entry.createdAt)

  return (
    <Drawer label="Activity details" onClose={onClose} widthClass="w-[min(28rem,calc(100vw-1.5rem))]">
      <div className="flex h-full min-h-0 flex-col bg-white">
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-navy">{entry.title || 'Activity'}</h2>
            <p className="mt-1 text-[13px] text-ink/60">{when || 'Activity details'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink/55 hover:bg-canvas hover:text-navy ${focusClass}`}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          <dl>
            <Fact label="Activity">{entry.title}</Fact>
            <Fact label="Module">{entry.moduleLabel}</Fact>
            <Fact label="Action">{entry.actionLabel}</Fact>
            <Fact label="Actor">{entry.actorLabel}</Fact>
            <Fact label="Performed by">
              <Party party={entry.transmitter} />
            </Fact>
            <Fact label="Affected user">
              <Party party={entry.receiver} />
            </Fact>
            <Fact label="Date">{when}</Fact>
            {entry.details ? <Fact label="Details">{entry.details}</Fact> : null}
          </dl>
        </div>
      </div>
    </Drawer>
  )
}
