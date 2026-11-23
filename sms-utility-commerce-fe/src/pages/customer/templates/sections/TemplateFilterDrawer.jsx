import { Check, X } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import { occasionTypes } from '../../../../features/templates/templateForm'
import { templateStatuses } from '../../../../features/templates/templateModel'
import {
  emptyTemplateFilters,
  templateFilterTypeOptions,
} from '../query'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const field =
  'h-11 w-full rounded-xl border border-ink/15 bg-white px-3.5 text-sm text-navy outline-none transition-colors focus:border-blue focus:ring-4 focus:ring-blue/15'

export function TemplateFilterDrawer({ filters, onApply, onClose }) {
  const [draft, setDraft] = useState(filters)
  const filterCount =
    (draft.type ? 1 : 0) +
    (draft.status ? 1 : 0) +
    (draft.category ? 1 : 0) +
    (draft.scope ? 1 : 0) +
    (draft.owner ? 1 : 0) +
    (draft.occasionType ? 1 : 0)

  function setField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
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
            <p className="mt-0.5 text-[13px] text-ink/60">Type, status, category, and ownership.</p>
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
          <div>
            <label htmlFor="template-filter-type" className="mb-2 block text-sm font-semibold text-navy">
              Type
            </label>
            <select
              id="template-filter-type"
              value={draft.type}
              onChange={(event) => setField('type', event.target.value)}
              className={field}
            >
              <option value="">Any type</option>
              {templateFilterTypeOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {draft.type === 'campaign_occasion' ? (
            <div>
              <label htmlFor="template-filter-occasion" className="mb-2 block text-sm font-semibold text-navy">
                Occasion
              </label>
              <select
                id="template-filter-occasion"
                value={draft.occasionType}
                onChange={(event) => setField('occasionType', event.target.value)}
                className={field}
              >
                <option value="">Any occasion</option>
                {occasionTypes.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label htmlFor="template-filter-status" className="mb-2 block text-sm font-semibold text-navy">
              Status
            </label>
            <select
              id="template-filter-status"
              value={draft.status}
              onChange={(event) => setField('status', event.target.value)}
              className={field}
            >
              {templateStatuses.map((option) => (
                <option key={option.value || 'any'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="template-filter-category" className="mb-2 block text-sm font-semibold text-navy">
              Category
            </label>
            <input
              id="template-filter-category"
              type="text"
              value={draft.category}
              placeholder="e.g. Marketing"
              onChange={(event) => setField('category', event.target.value)}
              className={field}
            />
          </div>

          <div>
            <label htmlFor="template-filter-scope" className="mb-2 block text-sm font-semibold text-navy">
              Scope
            </label>
            <select
              id="template-filter-scope"
              value={draft.scope}
              onChange={(event) => setField('scope', event.target.value)}
              className={field}
            >
              <option value="">Any scope</option>
              <option value="global">Global</option>
              <option value="tenant">Workspace</option>
            </select>
          </div>

          <div>
            <label htmlFor="template-filter-owner" className="mb-2 block text-sm font-semibold text-navy">
              Owner
            </label>
            <select
              id="template-filter-owner"
              value={draft.owner}
              onChange={(event) => setField('owner', event.target.value)}
              className={field}
            >
              <option value="">Anyone</option>
              <option value="mine">My templates</option>
            </select>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ink/10 px-5 py-4">
          <button
            type="button"
            onClick={() => setDraft(emptyTemplateFilters)}
            disabled={!filterCount}
            className={`inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-ink/70 transition-colors hover:text-navy disabled:opacity-40 ${focusClass}`}
          >
            <X size={15} strokeWidth={2.2} aria-hidden="true" />
            Clear
          </button>
          <button
            type="submit"
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-green px-4 text-sm font-semibold whitespace-nowrap text-white shadow-[0_1px_2px_rgba(11,31,91,0.25)] transition-colors hover:bg-[#006B46] ${focusClass}`}
          >
            <Check size={16} strokeWidth={2.4} aria-hidden="true" />
            Apply filters
          </button>
        </footer>
      </form>
    </Drawer>
  )
}
