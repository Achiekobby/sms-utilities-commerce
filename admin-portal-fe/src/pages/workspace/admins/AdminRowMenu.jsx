import { CircleCheck, CircleOff, Eye, MoreHorizontal, Pencil, Shield, Trash2 } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { placeAnchoredMenu } from '../../../components/placeAnchoredMenu'
import { focusClass } from './ui'

export function AdminRowMenu({ name, active, open, onToggle, onClose, onView, onEdit, onAssign, onStatus, onDelete }) {
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const menuId = useId()
  const statusLabel = active ? 'Deactivate' : 'Activate'
  const StatusIcon = active ? CircleOff : CircleCheck

  useLayoutEffect(() => {
    if (!open) return undefined
    const button = buttonRef.current
    const menu = menuRef.current
    if (!button || !menu) return undefined

    placeAnchoredMenu(button, menu)
    menu.querySelector('[role="menuitem"]')?.focus()
    return undefined
  }, [open])

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      const target = event.target
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return
      onClose()
    }

    function onDismiss() {
      onClose()
    }

    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('resize', onDismiss)
    window.addEventListener('scroll', onDismiss, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('resize', onDismiss)
      window.removeEventListener('scroll', onDismiss, true)
    }
  }, [open, onClose])

  function onMenuKeyDown(event) {
    const items = [...(menuRef.current?.querySelectorAll('[role="menuitem"]') ?? [])]
    const index = items.indexOf(document.activeElement)
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      buttonRef.current?.focus()
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!items.length) return
      const next = event.key === 'ArrowDown' ? index + 1 : index - 1
      items[(next + items.length) % items.length]?.focus()
    }
  }

  function run(action) {
    onClose()
    action()
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Actions for ${name}`}
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
        className={`inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-ink/55 hover:bg-[#F3F6FB] hover:text-navy ${focusClass} ${
          open ? 'bg-[#F3F6FB] text-navy' : ''
        }`}
      >
        <MoreHorizontal size={16} strokeWidth={2} aria-hidden="true" />
      </button>
      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={`Actions for ${name}`}
              onKeyDown={onMenuKeyDown}
              style={{ position: 'fixed', top: 0, left: 0, visibility: 'hidden' }}
              className="z-40 w-52 rounded-xl border border-ink/10 bg-white p-1 shadow-[0_16px_40px_-20px_rgba(6,32,71,0.55)]"
            >
              <MenuItem icon={Eye} label="View" onClick={() => run(onView)} />
              <MenuItem icon={Pencil} label="Edit details" onClick={() => run(onEdit)} />
              <MenuItem icon={Shield} label="Assign role" onClick={() => run(onAssign)} />
              {onStatus ? (
                <MenuItem
                  icon={StatusIcon}
                  label={statusLabel}
                  tone={active ? 'danger' : 'good'}
                  onClick={() => run(onStatus)}
                />
              ) : null}
              {onDelete ? (
                <>
                  <div className="my-1 h-px bg-ink/[0.06]" />
                  <MenuItem icon={Trash2} label="Delete admin" tone="danger" onClick={() => run(onDelete)} />
                </>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

function MenuItem({ icon: Icon, label, onClick, tone = 'default' }) {
  const tones = {
    default: 'text-navy',
    good: 'text-green',
    danger: 'text-[#9F1C26]',
  }
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 text-left text-sm font-medium hover:bg-[#F3F6FB] ${focusClass} ${tones[tone]}`}
    >
      <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
      {label}
    </button>
  )
}
