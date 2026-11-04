import { ChevronDown, MoreHorizontal } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { useDisclosure } from '../utils/hooks/useDisclosure'

const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'
const itemFocus = 'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue'
const MENU_WIDTH = 236
const GAP = 8
const EDGE = 8

const toneClass = {
  default: 'text-navy hover:bg-canvas',
  muted: 'text-ink/75 hover:bg-canvas hover:text-navy',
  caution: 'text-[#B45F06] hover:bg-[#FFF6E8]',
  danger: 'text-[#C21F2D] hover:bg-[#FDECEE]',
}

function place(trigger, size) {
  const rect = trigger.getBoundingClientRect()
  const viewW = window.innerWidth
  const viewH = window.innerHeight
  const below = viewH - rect.bottom - GAP
  const above = rect.top - GAP
  const placement = below >= size.height || below >= above ? 'bottom' : 'top'

  let top = placement === 'bottom' ? rect.bottom + GAP : rect.top - GAP - size.height
  let left = rect.right - size.width

  if (left < EDGE) left = EDGE
  if (left + size.width > viewW - EDGE) left = Math.max(EDGE, viewW - EDGE - size.width)
  top = Math.max(EDGE, Math.min(top, viewH - EDGE - size.height))

  return { top, left, placement }
}

function MenuItem({ item, onSelect }) {
  const Icon = item.icon
  const className = `flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors ${itemFocus} ${
    toneClass[item.tone] ?? toneClass.muted
  }`

  const content = (
    <>
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: item.tint, color: item.color }}
      >
        <Icon size={16} strokeWidth={2.1} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{item.label}</span>
        {item.hint ? <span className="mt-0.5 block truncate text-xs font-normal text-ink/45">{item.hint}</span> : null}
      </span>
    </>
  )

  if (item.to) {
    return (
      <Link to={item.to} role="menuitem" tabIndex={-1} onClick={onSelect} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      disabled={item.disabled}
      onClick={() => {
        if (item.disabled) return
        onSelect()
        item.onClick?.()
      }}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-45`}
    >
      {content}
    </button>
  )
}

// A compact trigger that opens a portal menu. The panel flips above or below the button from the
// space left in the viewport, and stays inside the edges of the screen.
export function ActionMenu({
  label = 'Actions',
  items,
  align = 'end',
  className = '',
  triggerClassName = '',
  icon: TriggerIcon = MoreHorizontal,
  iconOnly = false,
}) {
  const menu = useDisclosure()
  const { close, isOpen } = menu
  const reduce = useReducedMotion()
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const listRef = useRef(null)
  const menuId = useId()
  const [coords, setCoords] = useState(null)

  function updatePlace() {
    const trigger = triggerRef.current
    const panel = panelRef.current
    if (!trigger || !panel) return
    const next = place(trigger, {
      width: panel.offsetWidth || MENU_WIDTH,
      height: panel.offsetHeight || 0,
    })
    setCoords(next)
  }

  useLayoutEffect(() => {
    if (!isOpen) return undefined
    updatePlace()
    listRef.current?.querySelector('[role="menuitem"]:not([disabled])')?.focus()
    return undefined
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        close()
        triggerRef.current?.focus()
        return
      }

      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      event.preventDefault()
      const nodes = [...(listRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])') ?? [])]
      const index = nodes.indexOf(document.activeElement)
      const step = event.key === 'ArrowDown' ? 1 : -1
      nodes[(index + step + nodes.length) % nodes.length]?.focus()
    }

    function onPointerDown(event) {
      if (triggerRef.current?.contains(event.target)) return
      if (panelRef.current?.contains(event.target)) return
      close()
    }

    function onReposition() {
      updatePlace()
    }

    function onScroll(event) {
      if (panelRef.current?.contains(event.target)) return
      close()
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [close, isOpen])

  const sections = []
  items.forEach((item) => {
    if (item === 'separator') {
      if (sections.length && sections[sections.length - 1].length) sections.push([])
      return
    }
    if (!sections.length) sections.push([])
    sections[sections.length - 1].push(item)
  })

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={menu.toggle}
        className={triggerClassName}
      >
        {iconOnly ? (
          <TriggerIcon size={16} strokeWidth={2.2} aria-hidden="true" />
        ) : (
          <>
            <span>{label}</span>
            <ChevronDown
              size={15}
              strokeWidth={2.2}
              aria-hidden="true"
              className={`text-ink/45 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              ref={panelRef}
              id={menuId}
              role="presentation"
              initial={reduce ? false : { opacity: 0, y: coords?.placement === 'top' ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: coords?.placement === 'top' ? 4 : -4, scale: 0.98 }}
              transition={{ duration: reduce ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'fixed',
                top: coords?.top ?? 0,
                left: coords?.left ?? 0,
                width: MENU_WIDTH,
                visibility: coords ? 'visible' : 'hidden',
                zIndex: 80,
                transformOrigin:
                  coords?.placement === 'top'
                    ? align === 'start'
                      ? 'bottom left'
                      : 'bottom right'
                    : align === 'start'
                      ? 'top left'
                      : 'top right',
              }}
              className="overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(16,33,61,0.08),0_20px_48px_-12px_rgba(11,31,91,0.42)] ring-1 ring-ink/[0.06]"
            >
              <div ref={listRef} role="menu" aria-label={label} className="p-1.5">
                {sections.map((section, index) => (
                  <div key={index} className={index > 0 ? 'mt-1 border-t border-ink/10 pt-1' : ''}>
                    {section.map((item) => (
                      <MenuItem key={item.id ?? item.label} item={item} onSelect={close} />
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  )
}

export const actionMenuTrigger = `inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-ink/15 bg-white px-2.5 text-xs font-semibold whitespace-nowrap text-navy shadow-[0_1px_2px_rgba(16,33,61,0.05)] transition-colors hover:border-blue/40 hover:bg-canvas @3xl/detail:h-9 @3xl/detail:px-3 @3xl/detail:text-[13px] ${focusClass}`

export const actionIconTrigger = `inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-ink/15 bg-white text-navy/80 shadow-[0_1px_2px_rgba(16,33,61,0.05)] transition-colors hover:border-blue/40 hover:bg-canvas hover:text-blue ${focusClass}`
