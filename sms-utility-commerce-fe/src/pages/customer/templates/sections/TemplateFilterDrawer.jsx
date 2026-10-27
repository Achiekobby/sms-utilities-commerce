import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import { formatCount } from '../../dashboard/format'
import { campaignTypes, typeLabel } from '../../campaigns/model'
import { emptyTemplateFilters, queryTemplates, templateSenders } from '../query'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function Option({ checked, label, onChange }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
        checked ? 'border-blue bg-blue/[0.04] text-navy' : 'border-ink/15 text-navy hover:border-blue/40'
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 accent-blue" />
      {label}
    </label>
  )
}

export function TemplateFilterDrawer({ templates, search, filters, onApply, onClose }) {
  const [draft, setDraft] = useState(filters)
  const count = queryTemplates(templates, { search, ...draft }).length
  const senders = templateSenders(templates)

  function toggle(key, id) {
    setDraft((current) => {
      const selected = current[key]
      const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
      return { ...current, [key]: next }
    })
  }

  return (
    <Drawer label="Filter templates" onClose={onClose}>
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
            <h2 className="text-base font-bold text-navy">Filter templates</h2>
            <p className="mt-0.5 text-[13px] text-ink/60">Type and sender. Search stays in the list.</p>
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
            <legend className="mb-2 text-sm font-semibold text-navy">Type</legend>
            <div className="grid gap-2">
              {campaignTypes.map((type) => (
                <Option
                  key={type.id}
                  label={type.label}
                  checked={draft.types.includes(type.id)}
                  onChange={() => toggle('types', type.id)}
                />
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-navy">Sender</legend>
            <div className="grid gap-2">
              {senders.map((sender) => (
                <Option
                  key={sender}
                  label={sender}
                  checked={draft.senders.includes(sender)}
                  onChange={() => toggle('senders', sender)}
                />
              ))}
            </div>
          </fieldset>

          <p className="text-[13px] leading-5 text-ink/55">Leave a group empty to include every value in it.</p>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ink/10 px-5 py-4">
          <button
            type="button"
            onClick={() => setDraft(emptyTemplateFilters)}
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
            Show {formatCount(count)} {count === 1 ? 'template' : 'templates'}
          </button>
        </footer>
      </form>
    </Drawer>
  )
}

export function templateFilterChips(filters) {
  return [
    ...filters.types.map((id) => ({ key: `type-${id}`, group: 'types', id, label: typeLabel(id) })),
    ...filters.senders.map((id) => ({ key: `sender-${id}`, group: 'senders', id, label: id })),
  ]
}
