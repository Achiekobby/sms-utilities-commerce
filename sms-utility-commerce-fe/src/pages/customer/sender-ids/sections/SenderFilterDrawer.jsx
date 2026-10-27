import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import { formatCount } from '../../dashboard/format'
import { senderStatuses, statusLabel } from '../model'
import { emptySenderFilters, querySenderIds } from '../query'
import { SenderStatus } from './SenderStatus'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function SenderFilterDrawer({ records, search, filters, onApply, onClose }) {
  const [draft, setDraft] = useState(filters)
  const count = querySenderIds(records, { search, ...draft }).length

  function toggle(id) {
    setDraft((current) => {
      const next = current.statuses.includes(id)
        ? current.statuses.filter((item) => item !== id)
        : [...current.statuses, id]
      return { statuses: next }
    })
  }

  return (
    <Drawer label="Filter sender IDs" onClose={onClose}>
      <form
        className="flex h-full flex-col bg-white"
        onSubmit={(event) => {
          event.preventDefault()
          onApply(draft)
          onClose()
        }}
      >
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-navy">Filter sender IDs</h2>
            <p className="mt-0.5 text-[13px] text-ink/60">Status. Search stays in the list.</p>
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

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-navy">Status</legend>
            <div className="grid gap-2">
              {senderStatuses.map((status) => {
                const checked = draft.statuses.includes(status)
                return (
                  <label
                    key={status}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                      checked ? 'border-blue bg-blue/[0.04] text-navy' : 'border-ink/12 text-navy hover:border-blue/40'
                    }`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggle(status)} className="size-4 accent-blue" />
                    <SenderStatus status={status} />
                    <span className="sr-only">{statusLabel[status]}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
          <p className="text-[13px] leading-5 text-ink/55">Leave this empty to include every status.</p>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ink/10 px-5 py-4">
          <button
            type="button"
            onClick={() => setDraft(emptySenderFilters)}
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
            Show {formatCount(count)} {count === 1 ? 'sender ID' : 'sender IDs'}
          </button>
        </footer>
      </form>
    </Drawer>
  )
}
