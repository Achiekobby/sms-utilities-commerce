import { motion, useReducedMotion } from 'framer-motion'
import { Calendar, Check, ChevronDown, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useClickOutside } from '../../../../utils/hooks/useClickOutside'
import { useDisclosure } from '../../../../utils/hooks/useDisclosure'
import { getCustomRange, getPresetRange, presets } from '../dateRanges'
import { formatDay, parseISODate } from '../format'
import { RangeCalendar } from './RangeCalendar'

const focusClass =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function monthOf(iso) {
  const date = parseISODate(iso)
  return { year: date.getFullYear(), month: date.getMonth() }
}

function DateField({ label, value, active }) {
  return (
    <div
      className={`min-w-0 rounded-lg border px-3 py-2 ${
        active ? 'border-blue/60 ring-2 ring-blue/15' : 'border-ink/12'
      }`}
    >
      <p className="text-[11px] font-medium text-ink/45">{label}</p>
      <p
        className={`mt-0.5 text-sm font-semibold whitespace-nowrap tabular-nums ${
          value ? 'text-navy' : 'text-ink/35'
        }`}
      >
        {value ? formatDay(value) : 'Select date'}
      </p>
    </div>
  )
}

export function DateRangePicker({ range, onChange }) {
  const reduce = useReducedMotion()
  const menu = useDisclosure()
  const { close } = menu
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const [draft, setDraft] = useState({ from: range.from, to: range.to })
  const [month, setMonth] = useState(() => monthOf(range.from))

  const label = `${formatDay(range.from)} – ${formatDay(range.to)}`
  const active = range.id === 'custom' ? 'Custom' : presets.find((p) => p.id === range.id)?.label
  const complete = Boolean(draft.from && draft.to)

  useClickOutside(rootRef, close, menu.isOpen)

  useEffect(() => {
    if (!menu.isOpen) return undefined

    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      close()
      triggerRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menu.isOpen, close])

  // Each time the panel opens it starts from the range that is currently applied.
  function toggle() {
    if (!menu.isOpen) {
      setDraft({ from: range.from, to: range.to })
      setMonth(monthOf(range.from))
    }
    menu.toggle()
  }

  function finish() {
    close()
    triggerRef.current?.focus()
  }

  function selectPreset(id) {
    onChange(getPresetRange(id))
    finish()
  }

  // First click starts a range, the second ends it (earlier dates swap), a third starts over.
  function pick(iso) {
    setDraft((current) => {
      if (!current.from || current.to) return { from: iso, to: null }
      return iso < current.from ? { from: iso, to: current.from } : { from: current.from, to: iso }
    })
  }

  function apply(event) {
    event.preventDefault()
    if (!complete) return
    onChange(getCustomRange(draft.from, draft.to))
    finish()
  }

  return (
    <div ref={rootRef} className="relative w-fit shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={menu.isOpen}
        aria-label={`Date range: ${active}, ${label}`}
        onClick={toggle}
        className={`inline-flex h-11 items-center gap-2.5 rounded-xl border bg-white px-4 text-sm font-semibold text-navy shadow-[0_1px_2px_rgba(16,33,61,0.06)] transition-colors hover:border-blue/40 ${focusClass} ${
          menu.isOpen ? 'border-blue/50' : 'border-ink/10'
        }`}
      >
        <Calendar size={16} strokeWidth={2.2} aria-hidden="true" className="text-blue" />
        <span className="whitespace-nowrap tabular-nums">{label}</span>
        <ChevronDown
          size={15}
          strokeWidth={2.2}
          aria-hidden="true"
          className={`text-ink/45 transition-transform duration-200 ${menu.isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {menu.isOpen ? (
        <motion.div
          role="dialog"
          aria-label="Choose date range"
          initial={{ opacity: 0, y: reduce ? 0 : -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-full left-0 z-50 mt-2 w-[min(30rem,calc(100vw-2rem))] origin-top-left overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(16,33,61,0.08),0_20px_48px_-12px_rgba(11,31,91,0.4)] ring-1 ring-ink/[0.06] sm:right-0 sm:left-auto sm:origin-top-right sm:grid sm:grid-cols-[9.5rem_1fr]"
        >
          <ul className="flex gap-1 overflow-x-auto border-b border-ink/10 p-2 sm:flex-col sm:overflow-visible sm:border-r sm:border-b-0">
            {presets.map((preset) => {
              const selected = range.id === preset.id
              return (
                <li key={preset.id} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectPreset(preset.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue ${
                      selected
                        ? 'bg-blue/10 font-semibold text-blue'
                        : 'font-medium text-ink/70 hover:bg-canvas hover:text-navy'
                    }`}
                  >
                    {preset.label}
                  </button>
                </li>
              )
            })}
          </ul>

          <form onSubmit={apply} className="min-w-0 p-4">
            <div className="grid grid-cols-2 gap-2.5">
              <DateField label="From" value={draft.from} active={!draft.from} />
              <DateField label="To" value={draft.to} active={Boolean(draft.from) && !draft.to} />
            </div>

            <div className="mt-4">
              <RangeCalendar
                from={draft.from}
                to={draft.to}
                month={month}
                onMonth={setMonth}
                onPick={pick}
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-ink/10 pt-4">
              <button
                type="button"
                onClick={finish}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-ink/70 transition-colors hover:bg-canvas hover:text-navy ${focusClass}`}
              >
                <X size={15} strokeWidth={2.2} aria-hidden="true" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={!complete}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40 ${focusClass}`}
              >
                <Check size={15} strokeWidth={2.4} aria-hidden="true" />
                Apply range
              </button>
            </div>
          </form>
        </motion.div>
      ) : null}
    </div>
  )
}
