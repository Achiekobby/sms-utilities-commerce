import { Check, Hash, Megaphone, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import { formatCount } from '../../dashboard/format'
import { scheduleSources } from '../queue'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

const icons = {
  campaign: Megaphone,
  groups: Users,
  numbers: Hash,
}

export const emptyScheduleFilters = { sources: [] }

export function activeScheduleFilterCount(filters) {
  return filters.sources.length
}

export function querySchedule(rows, { search = '', sources = [] } = {}) {
  const term = search.trim().toLowerCase()
  return rows.filter((row) => {
    if (sources.length && !sources.includes(row.source)) return false
    if (!term) return true
    const label = scheduleSources.find((item) => item.id === row.source)?.label ?? ''
    return [row.name, row.sender, row.audience, label].join(' ').toLowerCase().includes(term)
  })
}

export function scheduleFilterChips(filters) {
  return filters.sources.map((id) => ({
    key: id,
    id,
    label: scheduleSources.find((item) => item.id === id)?.label ?? id,
  }))
}

export function ScheduleFilterDrawer({ rows, search, filters, onApply, onClose }) {
  const [draft, setDraft] = useState(filters)
  const count = querySchedule(rows, { search, ...draft }).length

  function toggle(id) {
    setDraft((current) => {
      const next = current.sources.includes(id) ? current.sources.filter((item) => item !== id) : [...current.sources, id]
      return { sources: next }
    })
  }

  return (
    <Drawer label="Filter scheduled sends" onClose={onClose}>
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
            <h2 className="text-base font-bold text-navy">Filter scheduled sends</h2>
            <p className="mt-0.5 text-[13px] text-ink/60">Campaigns, group sends, and number sends. Search stays in the list.</p>
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
            <legend className="mb-2 text-sm font-semibold text-navy">Send</legend>
            <div className="grid gap-2">
              {scheduleSources.map((source) => {
                const checked = draft.sources.includes(source.id)
                const Icon = icons[source.id]
                return (
                  <label
                    key={source.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                      checked ? 'border-blue bg-blue/[0.04] text-navy' : 'border-ink/12 text-navy hover:border-blue/40'
                    }`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggle(source.id)} className="size-4 accent-blue" />
                    <Icon size={15} strokeWidth={2.2} aria-hidden="true" className="text-blue" />
                    {source.label}
                  </label>
                )
              })}
            </div>
          </fieldset>
          <p className="text-[13px] leading-5 text-ink/55">Leave this empty to include every send.</p>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ink/10 px-5 py-4">
          <button
            type="button"
            onClick={() => setDraft(emptyScheduleFilters)}
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
            Show {formatCount(count)} {count === 1 ? 'send' : 'sends'}
          </button>
        </footer>
      </form>
    </Drawer>
  )
}
