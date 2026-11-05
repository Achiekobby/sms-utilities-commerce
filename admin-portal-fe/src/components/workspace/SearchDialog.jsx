import { CornerDownLeft, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { matchSearchEntries } from './navigation'

export function SearchDialog({ entries, onClose }) {
  const dialogRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const results = useMemo(() => matchSearchEntries(entries, query), [entries, query])
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
      setActive((index) => (index + 1) % Math.max(results.length, 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => (index - 1 + results.length) % Math.max(results.length, 1))
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
      className="fixed top-[10vh] left-1/2 m-0 w-[min(34rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-xl border-0 bg-white p-0 text-ink shadow-[0_24px_64px_-20px_rgba(6,32,71,0.55)] backdrop:bg-navy/40"
    >
      <div className="flex items-center gap-3 border-b border-ink/10 px-4">
        <Search size={16} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-ink/40" />
        <input
          autoFocus
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="admin-search-results"
          aria-activedescendant={results.length ? `admin-search-option-${current}` : undefined}
          aria-label="Search admin pages"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search pages"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
          className="h-12 w-full bg-transparent text-sm text-navy outline-none placeholder:text-ink/40"
        />
        <kbd className="shrink-0 rounded border border-ink/15 px-1.5 py-0.5 text-[11px] font-medium text-ink/45">
          Esc
        </kbd>
      </div>

      <div
        ref={listRef}
        id="admin-search-results"
        role="listbox"
        aria-label="Matching pages"
        className="max-h-[min(24rem,55svh)] overflow-y-auto p-2"
      >
        {results.length === 0 ? (
          <p className="px-3 py-8 text-center text-sm text-ink/55">No pages match “{query.trim()}”.</p>
        ) : (
          results.map((entry, index) => {
            const Icon = entry.icon
            const selected = index === current
            return (
              <div
                key={entry.id}
                id={`admin-search-option-${index}`}
                data-index={index}
                role="option"
                aria-selected={selected}
                onMouseMove={() => setActive(index)}
                onClick={() => open(entry)}
                className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 ${
                  selected ? 'bg-[#F3F6FB]' : ''
                }`}
              >
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" className="shrink-0 text-ink/55" />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-navy">{entry.label}</span>
                  <span className="block truncate text-[11px] text-ink/45">{entry.group}</span>
                </span>
              </div>
            )
          })
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-ink/10 px-4 py-2 text-[11px] text-ink/45">
        <span>↑↓ to move</span>
        <span className="inline-flex items-center gap-1">
          <CornerDownLeft size={12} aria-hidden="true" /> to open
        </span>
      </div>
    </dialog>
  )
}
