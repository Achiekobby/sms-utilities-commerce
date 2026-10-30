import { LogOut } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router'
import { signOut } from '../../../features/auth/signOut'
import { useAuth } from '../../../utils/hooks/useAuth'
import { useClickOutside } from '../../../utils/hooks/useClickOutside'
import { useDisclosure } from '../../../utils/hooks/useDisclosure'
import { IdentityAvatar } from '../IdentityAvatar'
import { getIdentity } from '../identity'
import { getAccountMenu } from '../navigation'

const rowClass =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium'
const focusClass =
  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue'

function MenuRow({ item, onSelect }) {
  const Icon = item.icon
  const icon = <Icon size={18} strokeWidth={1.8} aria-hidden="true" className="shrink-0" />

  if (item.to) {
    return (
      <Link
        to={item.to}
        role="menuitem"
        tabIndex={-1}
        onClick={onSelect}
        className={`${rowClass} ${focusClass} text-ink/75 hover:bg-canvas hover:text-navy`}
      >
        {icon}
        {item.label}
      </Link>
    )
  }

  if (item.onClick) {
    return (
      <button
        type="button"
        role="menuitem"
        tabIndex={-1}
        onClick={item.onClick}
        className={`${rowClass} ${focusClass} text-ink/75 hover:bg-canvas hover:text-navy`}
      >
        {icon}
        {item.label}
      </button>
    )
  }

  return (
    <span role="menuitem" aria-disabled="true" className={`${rowClass} cursor-default text-ink/40`}>
      {icon}
      {item.label}
      <span className="ml-auto text-xs font-normal text-ink/40">Soon</span>
    </span>
  )
}

export function AccountMenu() {
  const dispatch = useDispatch()
  const reduce = useReducedMotion()
  const { user } = useAuth()
  const identity = getIdentity(user)
  const menu = useDisclosure()
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const listRef = useRef(null)
  const { close } = menu

  const sections = [
    ...getAccountMenu(),
    [{ label: 'Sign out', icon: LogOut, onClick: () => { close(); dispatch(signOut()) } }],
  ]
  const contact = user?.email || user?.identifier || ''

  useClickOutside(rootRef, close, menu.isOpen)

  useEffect(() => {
    if (!menu.isOpen) return
    listRef.current?.querySelector('[role="menuitem"]:not([aria-disabled])')?.focus()
  }, [menu.isOpen])

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      close()
      triggerRef.current?.focus()
      return
    }

    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    event.preventDefault()
    const items = [...listRef.current.querySelectorAll('[role="menuitem"]:not([aria-disabled])')]
    const index = items.indexOf(document.activeElement)
    const step = event.key === 'ArrowDown' ? 1 : -1
    items[(index + step + items.length) % items.length]?.focus()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={menu.isOpen}
        aria-label="Account menu"
        onClick={menu.toggle}
        className="flex size-8 items-center justify-center overflow-hidden rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        <IdentityAvatar
          key={user?.profileImage || identity.initials}
          src={user?.profileImage}
          initials={identity.initials}
          size="sm"
        />
      </button>

      {menu.isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-full right-0 z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(16,33,61,0.08),0_20px_48px_-12px_rgba(11,31,91,0.4)] ring-1 ring-ink/[0.06]"
        >
          <div className="flex items-center gap-3 px-4 py-4">
            <IdentityAvatar
              key={user?.profileImage || identity.initials}
              src={user?.profileImage}
              initials={identity.initials}
              size="lg"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-navy">{identity.person}</p>
              {contact ? <p className="truncate text-xs text-ink/55">{contact}</p> : null}
              <p className="mt-0.5 truncate text-xs text-ink/45">
                {identity.kind}
                {user?.accountType === 'business' ? ` · ${identity.name}` : ''}
              </p>
            </div>
          </div>

          <div ref={listRef} role="menu" aria-label="Account" onKeyDown={onKeyDown}>
            {sections.map((section, index) => (
              <div key={index} className="border-t border-ink/10 p-2">
                {section.map((item) => (
                  <MenuRow key={item.label} item={item} onSelect={close} />
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </div>
  )
}
