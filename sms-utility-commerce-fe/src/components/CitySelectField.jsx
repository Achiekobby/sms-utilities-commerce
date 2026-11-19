import { Check, ChevronDown, Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { citiesForRegion, isCustomCity, OTHER_CITY } from '../features/auth/regions'
import { useClickOutside } from '../utils/hooks/useClickOutside'
import { useDisclosure } from '../utils/hooks/useDisclosure'

const errorColor = '#E0232E'
const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

function matchedCity(region, city) {
  const needle = String(city ?? '').trim().toLowerCase()
  if (!needle) return ''
  return citiesForRegion(region).find((item) => item.toLowerCase() === needle) ?? ''
}

export function CitySelectField({
  id,
  label = 'City',
  error,
  hint,
  dense = false,
  region = '',
  value = '',
  onChange,
  onBlur,
}) {
  const listId = useId()
  const customId = `${id}-custom`
  const menu = useDisclosure()
  const { close } = menu
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const searchRef = useRef(null)
  const regionRef = useRef(region)
  const [query, setQuery] = useState('')
  // True when the user chose Other, or when a saved city is not in the region list.
  const [otherMode, setOtherMode] = useState(() => isCustomCity(region, value))

  const cities = useMemo(() => citiesForRegion(region), [region])
  const listedMatch = matchedCity(region, value)
  const listed = Boolean(listedMatch)
  const customValue = isCustomCity(region, value)
  const usingOther = otherMode || customValue
  const disabled = !region
  const display = listedMatch || (usingOther ? OTHER_CITY : '')

  // Keep Other mode in sync with server/saved values: unknown city ⇒ custom.
  useEffect(() => {
    if (regionRef.current !== region) {
      regionRef.current = region
      setOtherMode(isCustomCity(region, value))
      return
    }

    if (listed) {
      setOtherMode(false)
      return
    }

    if (customValue) setOtherMode(true)
  }, [region, value, listed, customValue])

  useClickOutside(rootRef, close, menu.isOpen)

  useEffect(() => {
    if (!menu.isOpen) {
      setQuery('')
      return undefined
    }

    searchRef.current?.focus()

    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      close()
      triggerRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menu.isOpen, close])

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return cities
    return cities.filter((city) => city.toLowerCase().includes(needle))
  }, [cities, query])

  function pick(city) {
    setOtherMode(false)
    onChange(city)
    close()
    triggerRef.current?.focus()
  }

  function pickOther() {
    setOtherMode(true)
    if (listed) onChange('')
    close()
    requestAnimationFrame(() => document.getElementById(customId)?.focus())
  }

  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label
        htmlFor={usingOther ? customId : id}
        className={`${hint ? 'mb-1' : dense ? 'mb-1.5' : 'mb-2'} block font-medium text-navy ${
          dense ? 'text-[13px]' : 'text-sm'
        }`}
      >
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="mb-2 text-xs leading-5 text-ink/55">
          {hint}
        </p>
      ) : null}

      <div ref={rootRef} className="relative">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={menu.isOpen}
          aria-controls={menu.isOpen ? listId : undefined}
          aria-invalid={error && !usingOther ? true : undefined}
          aria-describedby={usingOther ? undefined : describedBy}
          onClick={() => (menu.isOpen ? close() : menu.open())}
          onBlur={() => {
            if (usingOther) return
            onBlur?.(value)
          }}
          className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white pr-3 pl-4 text-left text-ink transition-all duration-200 ${
            dense ? 'h-10 text-sm' : 'h-12 text-base'
          } ${focusClass} ${
            disabled
              ? 'cursor-not-allowed border-ink/10 bg-canvas text-ink/50'
              : `focus-visible:border-blue focus-visible:ring-4 focus-visible:ring-blue/15 ${
                  menu.isOpen ? 'border-blue ring-4 ring-blue/15' : error && !usingOther ? '' : 'border-ink/15 hover:border-blue/40'
                }`
          }`}
          style={!disabled && error && !usingOther ? { borderColor: errorColor } : undefined}
        >
          <span className="min-w-0 truncate">
            {display || (disabled ? 'Select a region first' : 'Select a city')}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={2.2}
            aria-hidden="true"
            className={`shrink-0 text-ink/45 transition-transform duration-200 ${menu.isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {menu.isOpen && !disabled ? (
          <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(16,33,61,0.08),0_16px_40px_-12px_rgba(11,31,91,0.4)] ring-1 ring-ink/[0.06]">
            <div className="flex items-center gap-2 border-b border-ink/10 px-3">
              <Search size={15} strokeWidth={2.2} aria-hidden="true" className="shrink-0 text-ink/45" />
              <input
                ref={searchRef}
                type="search"
                value={query}
                autoComplete="off"
                spellCheck={false}
                placeholder="Search cities"
                aria-label="Search cities"
                aria-controls={listId}
                onChange={(event) => setQuery(event.target.value)}
                className={`h-10 w-full bg-transparent text-ink outline-none placeholder:text-ink/40 ${
                  dense ? 'text-sm' : 'text-base'
                }`}
              />
            </div>
            <ul id={listId} role="listbox" aria-label={label} className="max-h-56 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <li className="px-2.5 py-3 text-center text-sm text-ink/55">No cities match “{query.trim()}”.</li>
              ) : (
                filtered.map((city) => {
                  const selected = !usingOther && city.toLowerCase() === String(value).trim().toLowerCase()
                  return (
                    <li key={city} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => pick(city)}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue ${
                          selected ? 'font-semibold text-navy' : 'font-medium'
                        }`}
                      >
                        {city}
                        {selected ? (
                          <Check size={15} strokeWidth={2.4} aria-hidden="true" className="shrink-0 text-blue" />
                        ) : null}
                      </button>
                    </li>
                  )
                })
              )}
              <li role="presentation" className="mt-0.5 border-t border-ink/10 pt-0.5">
                <button
                  type="button"
                  role="option"
                  aria-selected={usingOther}
                  onClick={pickOther}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue ${
                    usingOther ? 'font-semibold text-navy' : 'font-medium'
                  }`}
                >
                  {OTHER_CITY}
                  {usingOther ? (
                    <Check size={15} strokeWidth={2.4} aria-hidden="true" className="shrink-0 text-blue" />
                  ) : null}
                </button>
              </li>
            </ul>
          </div>
        ) : null}
      </div>

      {usingOther && !disabled ? (
        <div
          className={`mt-2 flex items-center rounded-xl border bg-white transition-all duration-200 focus-within:border-blue focus-within:ring-4 focus-within:ring-blue/15 ${
            dense ? 'h-10' : 'h-12'
          } ${error ? '' : 'border-ink/15'}`}
          style={error ? { borderColor: errorColor } : undefined}
        >
          <input
            id={customId}
            name="city"
            type="text"
            autoComplete="address-level2"
            placeholder="Enter your city or town"
            value={value}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            onChange={(event) => onChange(event.target.value)}
            onBlur={(event) => onBlur?.(event.target.value)}
            className={`h-full w-full rounded-xl bg-transparent px-4 text-ink outline-none placeholder:text-ink/40 ${
              dense ? 'text-sm' : 'text-base'
            }`}
          />
        </div>
      ) : null}

      <p
        id={errorId}
        role="alert"
        className={`mt-1.5 ${dense ? 'min-h-4 text-[13px]' : 'min-h-5 text-sm'}`}
        style={{ color: errorColor }}
      >
        {error}
      </p>
    </div>
  )
}
