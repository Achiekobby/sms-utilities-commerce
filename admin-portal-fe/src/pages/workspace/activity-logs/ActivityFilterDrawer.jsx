import { Check, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { drawerFilters, labelize } from '../../../features/activity-logs/activityModel'
import { focusClass } from './ui'

function SelectField({ id, label, value, options, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 h-11 w-full rounded-xl border border-ink/10 bg-white px-3 text-sm text-ink outline-none focus:border-blue ${focusClass}`}
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {labelize(option)}
          </option>
        ))}
      </select>
    </div>
  )
}

export function ActivityFilterDrawer({ filters, choices, choicesLoading, choicesError, includeClientId, onApply, onClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const moduleId = useId()
  const actionId = useId()
  const clientId = useId()
  const adminId = useId()
  const fromId = useId()
  const toId = useId()
  const [draft, setDraft] = useState(() => drawerFilters(filters))
  const [problems, setProblems] = useState({})

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  function setKey(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
    setProblems((current) => {
      const next = { ...current, [key]: undefined }
      if (key === 'from') next.to = undefined
      return next
    })
  }

  function apply() {
    const nextClient = draft.clientId.trim()
    const nextAdmin = draft.adminId.trim()
    const next = {}
    if (includeClientId && nextClient && !/^\d+$/.test(nextClient)) next.clientId = 'Enter the client’s numeric ID.'
    if (nextAdmin && !/^\d+$/.test(nextAdmin)) next.adminId = 'Enter the admin’s numeric ID.'
    if (draft.from && draft.to && draft.from > draft.to) next.to = 'The end date must be on or after the start date.'
    setProblems(next)
    if (Object.keys(next).length) return
    onApply({
      ...draft,
      clientId: includeClientId ? nextClient : '',
      adminId: nextAdmin,
    })
  }

  const actors = choices.actors.includes(draft.actor) || !draft.actor ? choices.actors : [draft.actor, ...choices.actors]
  const modules = choices.modules.includes(draft.module) || !draft.module ? choices.modules : [draft.module, ...choices.modules]
  const actions = choices.actions.includes(draft.action) || !draft.action ? choices.actions : [draft.action, ...choices.actions]

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
          <p className="mt-1 text-sm text-ink/55">Actor, module, action, people, and dates.</p>
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
        {choicesLoading ? <p className="text-sm text-ink/50">Loading filter options…</p> : null}
        {choicesError ? <p className="text-sm text-[#9F1C26]">Filter options could not be loaded. Search still works.</p> : null}
        <fieldset>
          <legend className="text-sm font-semibold text-navy">Actor</legend>
          <div className="mt-2 grid gap-2">
            {[{ value: '', label: 'Anyone' }, ...actors.map((actor) => ({ value: actor, label: labelize(actor) }))].map((option) => {
              const selected = draft.actor === option.value
              return (
                <label
                  key={option.label}
                  onMouseDown={(event) => event.preventDefault()}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-blue ${
                    selected ? 'border-blue bg-[#E7F0FF] font-semibold text-navy' : 'border-ink/10 bg-white font-medium text-ink/70 hover:border-blue/40'
                  }`}
                >
                  <span>{option.label}</span>
                  <input
                    type="radio"
                    name="activity-actor"
                    value={option.value}
                    checked={selected}
                    onChange={() => setKey('actor', option.value)}
                    className="sr-only outline-none"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                      selected ? 'border-blue bg-blue text-white' : 'border-ink/15 text-transparent'
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <SelectField id={moduleId} label="Module" value={draft.module} options={modules} onChange={(value) => setKey('module', value)} />
        <SelectField id={actionId} label="Action" value={draft.action} options={actions} onChange={(value) => setKey('action', value)} />

        {includeClientId ? (
          <div>
            <label htmlFor={clientId} className="text-sm font-semibold text-navy">
              Client ID
            </label>
            <input
              id={clientId}
              inputMode="numeric"
              value={draft.clientId}
              placeholder="Any client"
              aria-invalid={problems.clientId ? true : undefined}
              onChange={(event) => setKey('clientId', event.target.value)}
              className={`mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm text-ink outline-none focus:border-blue ${focusClass} ${
                problems.clientId ? 'border-[#E0232E]' : 'border-ink/10'
              }`}
            />
            {problems.clientId ? <p className="mt-1 text-xs text-[#9F1C26]">{problems.clientId}</p> : null}
          </div>
        ) : null}

        <div>
          <label htmlFor={adminId} className="text-sm font-semibold text-navy">
            Admin ID
          </label>
          <input
            id={adminId}
            inputMode="numeric"
            value={draft.adminId}
            placeholder="Any admin"
            aria-invalid={problems.adminId ? true : undefined}
            onChange={(event) => setKey('adminId', event.target.value)}
            className={`mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm text-ink outline-none focus:border-blue ${focusClass} ${
              problems.adminId ? 'border-[#E0232E]' : 'border-ink/10'
            }`}
          />
          {problems.adminId ? <p className="mt-1 text-xs text-[#9F1C26]">{problems.adminId}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={fromId} className="text-sm font-semibold text-navy">
              From
            </label>
            <input
              id={fromId}
              type="date"
              value={draft.from}
              onChange={(event) => setKey('from', event.target.value)}
              className={`mt-2 h-11 w-full rounded-xl border border-ink/10 bg-white px-3 text-sm text-ink outline-none focus:border-blue ${focusClass}`}
            />
          </div>
          <div>
            <label htmlFor={toId} className="text-sm font-semibold text-navy">
              To
            </label>
            <input
              id={toId}
              type="date"
              value={draft.to}
              aria-invalid={problems.to ? true : undefined}
              onChange={(event) => setKey('to', event.target.value)}
              className={`mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm text-ink outline-none focus:border-blue ${focusClass} ${
                problems.to ? 'border-[#E0232E]' : 'border-ink/10'
              }`}
            />
            {problems.to ? <p className="mt-1 text-xs text-[#9F1C26]">{problems.to}</p> : null}
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-ink/[0.06] px-5 py-4">
        <button
          type="button"
          onClick={() => {
            setDraft(drawerFilters({}))
            setProblems({})
          }}
          className={`inline-flex h-11 cursor-pointer items-center rounded-xl px-3 text-sm font-semibold text-ink/60 hover:text-navy ${focusClass}`}
        >
          Reset
        </button>
        <button
          type="button"
          onClick={apply}
          className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-navy px-5 text-sm font-semibold text-white hover:bg-[#0a3268] ${focusClass}`}
        >
          Show activity
        </button>
      </footer>
    </dialog>
  )
}
