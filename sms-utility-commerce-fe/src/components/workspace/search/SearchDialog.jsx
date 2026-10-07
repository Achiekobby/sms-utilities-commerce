import { CornerDownLeft, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { searchEntries } from './searchIndex'

// A native modal <dialog>: focus is trapped, Escape closes it, and the page behind is inert.
export function SearchDialog({ entries, onClose }) {
  const dialogRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const results = useMemo(() => searchEntries(entries, query), [entries, query])
  const current = Math.min(active, Math.max(results.length - 1, 0))

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${current}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [current])

  function open(entry) {
    if (!entry?.to) return
    onClose()
    navigate(entry.to)
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((current + 1) % Math.max(results.length, 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((current - 1 + results.length) % Math.max(results.length, 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      open(results[current])
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-label="Search"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="fixed top-[8vh] left-1/2 m-0 h-fit w-[min(36rem,calc(100vw-2rem))] sm:top-[12vh] -translate-x-1/2 overflow-hidden rounded-xl bg-white p-0 text-ink shadow-[0_1px_2px_rgba(16,33,61,0.08),0_24px_64px_-12px_rgba(11,31,91,0.45)] backdrop:bg-navy/30"
    >
      <div className="flex items-center gap-3 border-b border-ink/10 px-4">
        <Search size={18} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-ink/45" />
        <input
          autoFocus
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-activedescendant={results.length ? `search-option-${current}` : undefined}
          aria-label="Search pages"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search pages and tools"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
          className="h-14 w-full bg-transparent text-base text-navy outline-none placeholder:text-ink/40"
        />
        <kbd className="shrink-0 rounded border border-ink/15 px-1.5 py-0.5 text-[11px] font-medium text-ink/50">
          Esc
        </kbd>
      </div>

      <div ref={listRef} id="search-results" role="listbox" className="max-h-[55svh] overflow-y-auto p-2 sm:max-h-80">
        {results.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-ink/55">
            Nothing matches “{query.trim()}”.
          </p>
        ) : (
          <>
            <p className="px-3 pt-1 pb-2 text-[11px] font-semibold tracking-[0.14em] text-ink/45 uppercase">
              {query.trim() ? 'Results' : 'Go to'}
            </p>
            {results.map((entry, index) => {
              const Icon = entry.icon
              const isActive = index === current
              const available = Boolean(entry.to)

              return (
                <div
                  key={`${entry.group}-${entry.label}`}
                  id={`search-option-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isActive}
                  aria-disabled={!available}
                  onMouseMove={() => setActive(index)}
                  onClick={() => open(entry)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                    available ? 'cursor-pointer' : 'cursor-default'
                  } ${isActive ? 'bg-blue/[0.08]' : ''}`}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className={`shrink-0 ${available ? (isActive ? 'text-blue' : 'text-ink/60') : 'text-ink/30'}`}
                  />
                  <span
                    className={`font-medium ${
                      available ? (isActive ? 'text-blue' : 'text-navy') : 'text-ink/40'
                    }`}
                  >
                    {entry.label}
                  </span>
                  <span className="ml-auto text-xs text-ink/45">
                    {available ? entry.group : 'Coming soon'}
                  </span>
                </div>
              )
            })}
          </>
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-ink/10 bg-canvas px-4 py-2.5 text-xs text-ink/55">
        <span>↑↓ to move</span>
        <span className="inline-flex items-center gap-1">
          <CornerDownLeft size={12} aria-hidden="true" /> to open
        </span>
      </div>
    </dialog>
  )
}
