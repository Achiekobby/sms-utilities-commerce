import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import { formatCount } from '../../dashboard/format'
import { campaignTypes, statusLabel } from '../model'
import { emptyFilters, queryCampaigns, senderOptions, statusOptions } from '../query'
import { approvedSenderNames } from '../../sender-ids/model'
import { useSenderIds } from '../../sender-ids/useSenderIds'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function DrawerHeader({ onClose }) {
  return (
    <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-base font-bold text-navy">Filter campaigns</h2>
        <p className="mt-0.5 text-[13px] text-ink/60">Status, type, and sender. Search stays in the list.</p>
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
  )
}

function Option({ checked, label, onChange }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
        checked ? 'border-blue bg-blue/[0.04] text-navy' : 'border-ink/12 text-navy hover:border-blue/40'
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-blue" />
      {label}
    </label>
  )
}

function Group({ legend, children }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-navy">{legend}</legend>
      <div className="grid gap-2">{children}</div>
    </fieldset>
  )
}

export function CampaignFilterDrawer({ campaigns, search, filters, onApply, onClose }) {
  const [draft, setDraft] = useState(filters)
  const approved = approvedSenderNames(useSenderIds())
  const count = queryCampaigns(campaigns, { search, ...draft }).length
  const senders = senderOptions(campaigns, approved)

  function toggle(key, id) {
    setDraft((current) => {
      const selected = current[key]
      const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
      return { ...current, [key]: next }
    })
  }

  return (
    <Drawer label="Filter campaigns" onClose={onClose}>
      <form
        className="flex h-full flex-col bg-white"
        onSubmit={(event) => {
          event.preventDefault()
          onApply(draft)
          onClose()
        }}
      >
        <DrawerHeader onClose={onClose} />

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
          <Group legend="Status">
            {statusOptions.map((status) => (
              <Option
                key={status}
                label={statusLabel[status]}
                checked={draft.statuses.includes(status)}
                onChange={() => toggle('statuses', status)}
              />
            ))}
          </Group>

          <Group legend="Type">
            {campaignTypes.map((type) => (
              <Option
                key={type.id}
                label={type.label}
                checked={draft.types.includes(type.id)}
                onChange={() => toggle('types', type.id)}
              />
            ))}
          </Group>

          <Group legend="Sender">
            {senders.map((sender) => (
              <Option
                key={sender}
                label={sender}
                checked={draft.senders.includes(sender)}
                onChange={() => toggle('senders', sender)}
              />
            ))}
          </Group>

          <p className="text-[13px] leading-5 text-ink/55">Leave a group empty to include every value in it.</p>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ink/10 px-5 py-4">
          <button
            type="button"
            onClick={() => setDraft(emptyFilters)}
            className={`inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-ink/70 transition-colors hover:text-navy ${focusClass}`}
          >
            <X size={15} strokeWidth={2.2} aria-hidden="true" />
            Clear
          </button>
          <button
            type="submit"
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold whitespace-nowrap text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] ${focusClass}`}
          >
            <Check size={16} strokeWidth={2.4} aria-hidden="true" />
            Show {formatCount(count)} {count === 1 ? 'campaign' : 'campaigns'}
          </button>
        </footer>
      </form>
    </Drawer>
  )
}
