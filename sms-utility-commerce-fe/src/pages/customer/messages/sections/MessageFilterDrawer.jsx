import { Check, Hash, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Drawer } from '../../../../components/Drawer'
import { formatCount } from '../../dashboard/format'
import {
  activeMessageFilterCount,
  emptyMessageFilters,
  messageSortOptions,
  messageTypeOptions,
  queryMessages,
} from '../query'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const field =
  'h-11 w-full rounded-xl border border-ink/15 bg-white px-3.5 text-sm text-navy outline-none transition-colors placeholder:text-ink/35 focus:border-blue focus:ring-4 focus:ring-blue/15'

const typeIcons = {
  numbers: Hash,
  groups: Users,
}

export function MessageFilterDrawer({ messages, filters, onApply, onClose }) {
  const [draft, setDraft] = useState(filters)
  const count = queryMessages(messages, draft).length
  const filterCount = activeMessageFilterCount(draft)

  function toggleType(id) {
    setDraft((current) => {
      const next = current.types.includes(id) ? current.types.filter((item) => item !== id) : [...current.types, id]
      return { ...current, types: next }
    })
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
            <p className="mt-0.5 text-[13px] text-ink/60">Search, dates, type, and sort order.</p>
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
            <label htmlFor="message-filter-search" className="mb-2 block text-sm font-semibold text-navy">
              Search
            </label>
            <input
              id="message-filter-search"
              data-autofocus
              type="search"
              value={draft.search}
              placeholder="Message, sender, group, or number"
              onChange={(event) => setDraft((current) => ({ ...current, search: event.target.value }))}
              className={field}
            />
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
                  onChange={(event) => setDraft((current) => ({ ...current, from: event.target.value }))}
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
                  onChange={(event) => setDraft((current) => ({ ...current, to: event.target.value }))}
                  className={field}
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-navy">Message type</legend>
            <div className="grid gap-2">
              {messageTypeOptions.map((option) => {
                const checked = draft.types.includes(option.id)
                const Icon = typeIcons[option.id]
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                      checked ? 'border-blue bg-blue/[0.04] text-navy' : 'border-ink/12 text-navy hover:border-blue/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleType(option.id)}
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
            </div>
            <p className="mt-2 text-[13px] leading-5 text-ink/55">Leave empty to include every type.</p>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-navy">Sort order</legend>
            <div className="grid gap-2">
              {messageSortOptions.map((option) => {
                const checked = draft.sort === option.id
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                      checked ? 'border-blue bg-blue/[0.04] text-navy' : 'border-ink/12 text-navy hover:border-blue/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="message-sort"
                      checked={checked}
                      onChange={() => setDraft((current) => ({ ...current, sort: option.id }))}
                      className="size-4 accent-blue"
                    />
                    {option.label}
                  </label>
                )
              })}
            </div>
          </fieldset>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-ink/10 px-5 py-4">
          <button
            type="button"
            onClick={() => setDraft(emptyMessageFilters)}
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
            Show {formatCount(count)} {count === 1 ? 'message' : 'messages'}
          </button>
        </footer>
      </form>
    </Drawer>
  )
}
