import { ArrowDownLeft, ArrowUpRight, Check, CircleCheck, Clock, X } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import { formatCount } from '../../dashboard/format'
import { queryEntries } from '../query'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const typeOptions = [
  { id: 'credit', label: 'Credit', icon: ArrowDownLeft },
  { id: 'debit', label: 'Debit', icon: ArrowUpRight },
]

const statusOptions = [
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'completed', label: 'Completed', icon: CircleCheck },
]

function toggle(list, id) {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id]
}

export function WalletFilterDrawer({ entries, search, filters, onApply, onClose }) {
  const [draft, setDraft] = useState(filters)
  const count = queryEntries(entries, { search, ...draft }).length

  return (
    <Drawer label="Filter wallet activity" onClose={onClose}>
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
            <h2 className="text-base font-bold text-navy">Filter wallet activity</h2>
            <p className="mt-0.5 text-[13px] text-ink/60">Credits, debits, and status. Search stays in the list.</p>
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
            <legend className="mb-2 text-sm font-semibold text-navy">Movement</legend>
            <div className="grid gap-2">
              {typeOptions.map((option) => (
                <Option
                  key={option.id}
                  option={option}
                  checked={draft.types.includes(option.id)}
                  onChange={() => setDraft((current) => ({ ...current, types: toggle(current.types, option.id) }))}
                />
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-navy">Status</legend>
            <div className="grid gap-2">
              {statusOptions.map((option) => (
                <Option
                  key={option.id}
                  option={option}
                  checked={draft.statuses.includes(option.id)}
                  onChange={() => setDraft((current) => ({ ...current, statuses: toggle(current.statuses, option.id) }))}
                />
              ))}
            </div>
          </fieldset>
          <p className="text-[13px] leading-5 text-ink/55">Leave a group empty to include every entry in it.</p>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ink/10 px-5 py-4">
          <button
            type="button"
            onClick={() => setDraft({ types: [], statuses: [] })}
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
            Show {formatCount(count)} {count === 1 ? 'entry' : 'entries'}
          </button>
        </footer>
      </form>
    </Drawer>
  )
}

function Option({ option, checked, onChange }) {
  const Icon = option.icon
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
        checked ? 'border-blue bg-blue/[0.04] text-navy' : 'border-ink/12 text-navy hover:border-blue/40'
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-blue" />
      <Icon size={15} strokeWidth={2.2} aria-hidden="true" className="text-blue" />
      {option.label}
    </label>
  )
}
