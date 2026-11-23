import { Check, Hash, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import {
  activeMessageFilterCount,
  emptyMessageFilters,
  messageModeOptions,
  messageRequestTypeOptions,
  messageStatusOptions,
  messageTypeOptions,
} from '../query'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const field =
  'h-11 w-full rounded-xl border border-ink/15 bg-white px-3.5 text-sm text-navy outline-none transition-colors placeholder:text-ink/35 focus:border-blue focus:ring-4 focus:ring-blue/15'

const typeIcons = {
  quick: Hash,
  bulk: Users,
}

export function MessageFilterDrawer({ filters, groups = [], onApply, onClose }) {
  const [draft, setDraft] = useState(filters)
  const filterCount = activeMessageFilterCount(draft)

  function setField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  return (
    <Drawer label="Filter messages" onClose={onClose}>
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
            <h2 className="text-base font-bold text-navy">Filter messages</h2>
            <p className="mt-0.5 text-[13px] text-ink/60">Type, status, group, dates, and mode.</p>
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
            <legend className="mb-2 text-sm font-semibold text-navy">Message type</legend>
            <div className="grid gap-2">
              {messageTypeOptions.map((option) => {
                const checked = draft.type === option.id
                const Icon = typeIcons[option.id]
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                      checked ? 'border-blue bg-blue/[0.04] text-navy' : 'border-ink/12 text-navy hover:border-blue/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="message-type"
                      checked={checked}
                      onChange={() => setField('type', option.id)}
                      className="size-4 accent-blue"
                    />
                    <Icon size={15} strokeWidth={2.2} aria-hidden="true" className="text-blue" />
                    <span className="min-w-0">
                      <span className="block">{option.label}</span>
                      <span className="block text-xs font-medium text-ink/50">{option.detail}</span>
                    </span>
                  </label>
                )
              })}
              <button
                type="button"
                onClick={() => setField('type', '')}
                className={`text-left text-[13px] font-semibold text-blue ${focusClass}`}
              >
                Any type
              </button>
            </div>
          </fieldset>

          <div>
            <label htmlFor="message-filter-status" className="mb-2 block text-sm font-semibold text-navy">
              Status
            </label>
            <select
              id="message-filter-status"
              value={draft.status}
              onChange={(event) => setField('status', event.target.value)}
              className={field}
            >
              <option value="">Any status</option>
              {messageStatusOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message-filter-group" className="mb-2 block text-sm font-semibold text-navy">
              Contact group
            </label>
            <select
              id="message-filter-group"
              value={draft.contactGroupId}
              onChange={(event) => setField('contactGroupId', event.target.value)}
              className={field}
            >
              <option value="">Any group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="message-filter-request-type" className="mb-2 block text-sm font-semibold text-navy">
                Request type
              </label>
              <select
                id="message-filter-request-type"
                value={draft.requestType}
                onChange={(event) => setField('requestType', event.target.value)}
                className={field}
              >
                <option value="">Any</option>
                {messageRequestTypeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="message-filter-mode" className="mb-2 block text-sm font-semibold text-navy">
                Mode
              </label>
              <select
                id="message-filter-mode"
                value={draft.mode}
                onChange={(event) => setField('mode', event.target.value)}
                className={field}
              >
                <option value="">Any</option>
                {messageModeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-navy">Date range</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="message-filter-from" className="mb-1.5 block text-xs font-medium text-ink/55">
                  From
                </label>
                <input
                  id="message-filter-from"
                  type="date"
                  value={draft.from}
                  max={draft.to || undefined}
                  onChange={(event) => setField('from', event.target.value)}
                  className={field}
                />
              </div>
              <div>
                <label htmlFor="message-filter-to" className="mb-1.5 block text-xs font-medium text-ink/55">
                  To
                </label>
                <input
                  id="message-filter-to"
                  type="date"
                  value={draft.to}
                  min={draft.from || undefined}
                  onChange={(event) => setField('to', event.target.value)}
                  className={field}
                />
              </div>
            </div>
          </fieldset>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ink/10 px-5 py-4">
          <button
            type="button"
            onClick={() => setDraft({ ...emptyMessageFilters, search: draft.search })}
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
