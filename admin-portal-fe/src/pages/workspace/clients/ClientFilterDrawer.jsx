import { Check, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { emptyClientFilters } from '../../../features/clients/clientModel'
import { ghanaRegions } from '../../../features/onboarding/clientOnboarding'
import { focusClass } from './ui'

const groups = [
  {
    key: 'accountType',
    legend: 'Account type',
    options: [
      { value: '', label: 'Any type' },
      { value: 'individual', label: 'Individual' },
      { value: 'business', label: 'Business' },
    ],
  },
  {
    key: 'status',
    legend: 'Status',
    options: [
      { value: '', label: 'Any status' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
  {
    key: 'verified',
    legend: 'Verification',
    options: [
      { value: '', label: 'Anyone' },
      { value: 'verified', label: 'Verified' },
      { value: 'unverified', label: 'Unverified' },
    ],
  },
  {
    key: 'onboarding',
    legend: 'Onboarding',
    options: [
      { value: '', label: 'Any source' },
      { value: 'admin', label: 'Onboarded by admin' },
      { value: 'self', label: 'Signed up themselves' },
    ],
  },
]

function ChoiceGroup({ legend, name, value, options, onChange }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-navy">{legend}</legend>
      <div className="mt-2 grid gap-2">
        {options.map((option) => {
          const selected = value === option.value
          return (
            <label
              key={option.label}
              onMouseDown={(event) => event.preventDefault()}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                selected ? 'border-green bg-[#E7F8F0] font-semibold text-navy' : 'border-ink/10 bg-white font-medium text-ink/70 hover:border-green/40'
              }`}
            >
              <span>{option.label}</span>
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="sr-only outline-none"
              />
              <span
                aria-hidden="true"
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                  selected ? 'border-green bg-green text-white' : 'border-ink/15 text-transparent'
                }`}
              >
                <Check size={12} strokeWidth={3} />
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function ClientFilterDrawer({ filters, onApply, onClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const regionId = useId()
  const [draft, setDraft] = useState(filters)
  const unchanged = JSON.stringify(draft) === JSON.stringify(emptyClientFilters)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  function setKey(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="drawer-right fixed inset-y-0 right-0 left-auto z-50 m-0 flex h-dvh max-h-none w-[min(24rem,100vw)] max-w-none flex-col rounded-none border-0 bg-white p-0 text-ink shadow-[-24px_0_64px_-24px_rgba(11,31,91,0.45)] backdrop:bg-navy/40"
    >
      <header className="flex items-start justify-between gap-4 border-b border-ink/[0.06] px-5 py-4">
        <div>
          <h2 id={titleId} className="text-lg font-bold tracking-tight text-navy">
            Filters
          </h2>
          <p className="mt-1 text-sm text-ink/55">Narrow the clients on this page.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className={`flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink/50 hover:bg-ink/[0.04] hover:text-navy ${focusClass}`}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
        {groups.map((group) => (
          <ChoiceGroup
            key={group.key}
            legend={group.legend}
            name={group.key}
            value={draft[group.key]}
            options={group.options}
            onChange={(value) => setKey(group.key, value)}
          />
        ))}

        <div>
          <label htmlFor={regionId} className="text-sm font-semibold text-navy">
            Region
          </label>
          <select
            id={regionId}
            value={draft.region}
            onChange={(event) => setKey('region', event.target.value)}
            className={`mt-2 h-12 w-full rounded-xl border border-ink/10 bg-white px-3.5 text-sm text-ink outline-none focus:border-green ${focusClass}`}
          >
            <option value="">Any region</option>
            {ghanaRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-ink/[0.06] px-5 py-4">
        <button
          type="button"
          onClick={() => setDraft(emptyClientFilters)}
          disabled={unchanged}
          className={`inline-flex h-11 cursor-pointer items-center rounded-xl px-3 text-sm font-semibold text-ink/60 hover:text-navy disabled:cursor-not-allowed disabled:opacity-40 ${focusClass}`}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={() => onApply(draft)}
          className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-green px-5 text-sm font-semibold text-white hover:bg-[#006B46] ${focusClass}`}
        >
          Show clients
        </button>
      </footer>
    </dialog>
  )
}
