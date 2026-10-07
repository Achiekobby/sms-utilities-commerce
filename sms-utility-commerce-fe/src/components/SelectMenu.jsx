import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useClickOutside } from '../utils/hooks/useClickOutside'
import { useDisclosure } from '../utils/hooks/useDisclosure'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

// A compact dropdown for choosing one option. Closes on outside click and Escape.
// An option may set `triggerLabel` to read differently on the button than in the list,
// for example a filter that shows "Status" until a value is chosen.
export function SelectMenu({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  compact = false,
  align = 'right',
  placement = 'bottom',
  className = '',
  menuClassName = 'w-48',
}) {
  const menu = useDisclosure()
  const { close } = menu
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const active = options.find((option) => option.id === value) ?? options[0]

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

  function select(id) {
    onChange(id)
    close()
    triggerRef.current?.focus()
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={menu.isOpen}
        aria-label={`${label}: ${active.label}`}
        onClick={menu.toggle}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white font-medium text-navy transition-colors hover:border-blue/40 ${
          compact ? 'h-9 px-2.5 text-[13px]' : 'h-10 px-3 text-sm'
        } ${focusClass} ${menu.isOpen ? 'border-blue/50' : 'border-ink/15'}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {Icon ? <Icon size={15} strokeWidth={2.2} aria-hidden="true" className="shrink-0 text-ink/55" /> : null}
          <span className="truncate">{active.triggerLabel ?? active.label}</span>
        </span>
        <ChevronDown
          size={15}
          strokeWidth={2.2}
          aria-hidden="true"
          className={`shrink-0 text-ink/45 transition-transform duration-200 ${menu.isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {menu.isOpen ? (
        <ul
          role="listbox"
          aria-label={label}
          className={`absolute z-20 overflow-hidden rounded-lg bg-white p-1 shadow-[0_1px_2px_rgba(16,33,61,0.08),0_16px_40px_-12px_rgba(11,31,91,0.4)] ring-1 ring-ink/[0.06] ${
            align === 'left' ? 'left-0' : 'right-0'
          } ${placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'} ${menuClassName}`}
        >
          {options.map((option) => {
            const selected = option.id === value
            return (
              <li key={option.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => select(option.id)}
                  className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue ${
                    selected ? 'font-semibold text-navy' : 'font-medium text-ink/75'
                  }`}
                >
                  {option.label}
                  {selected ? (
                    <Check size={15} strokeWidth={2.4} aria-hidden="true" className="shrink-0 text-blue" />
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
