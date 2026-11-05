import { ChevronDown, LogOut } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { NavLink, useLocation } from 'react-router'
import { selectCurrentUser } from '../../features/auth/authSlice'
import { adminName } from '../../features/auth/session'
import { usePermissions } from '../../features/auth/usePermissions'
import { useSignOut } from '../../features/auth/useSignOut'
import { getFooterNavigation } from './navigation'

function initials(user) {
  const letters = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()
  return letters || 'A'
}

function Avatar({ user, image }) {
  if (image) return <img src={image} alt="" className="size-8 rounded-full object-cover" />
  return (
    <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-white">
      {initials(user)}
    </span>
  )
}

export function AccountMenu() {
  const user = useSelector(selectCurrentUser)
  const access = usePermissions()
  const profile = getFooterNavigation(access)[0] ?? null
  const name = adminName(user)
  const roleName = user?.role?.name || 'Admin'
  const image = typeof user?.profileImage === 'string' && user.profileImage ? user.profileImage : ''
  const { pathname } = useLocation()
  const [seenPath, setSeenPath] = useState(pathname)
  const [open, setOpen] = useState(false)
  if (seenPath !== pathname) {
    setSeenPath(pathname)
    setOpen(false)
  }
  const menuId = useId()
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const { signOutAdmin, signingOut } = useSignOut()

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    listRef.current?.querySelector('[role="menuitem"]')?.focus()
    return undefined
  }, [open])

  function onMenuKeyDown(event) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setOpen(false)
      return
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const items = [...listRef.current.querySelectorAll('[role="menuitem"]:not([disabled])')]
    const index = items.indexOf(document.activeElement)
    const step = event.key === 'ArrowDown' ? 1 : -1
    const next = index < 0 ? 0 : (index + step + items.length) % items.length
    items[next]?.focus()
  }

  const ProfileIcon = profile?.icon

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${name}, ${roleName}`}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 cursor-pointer items-center gap-2 rounded-md py-0.5 pr-1.5 pl-0.5 transition-colors duration-150 hover:bg-ink/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        <Avatar user={user} image={image} />
        <span className="hidden min-w-0 text-left md:block">
          <span className="block max-w-36 truncate text-[13px] leading-4 font-semibold text-navy">{name}</span>
          <span className="block max-w-36 truncate text-[11px] leading-4 text-ink/50">{roleName}</span>
        </span>
        <ChevronDown size={14} strokeWidth={2} aria-hidden="true" className="hidden text-ink/40 md:block" />
      </button>

      {open ? (
        <div className="absolute top-[calc(100%+0.4rem)] right-0 z-50 w-64 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-[0_16px_40px_-20px_rgba(6,32,71,0.5)]">
          <div className="flex items-center gap-2.5 px-3 py-3">
            <Avatar user={user} image={image} />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-navy">{name}</span>
              <span className="block truncate text-[11px] text-ink/50">{user?.email || roleName}</span>
              {user?.email ? <span className="block truncate text-[11px] text-ink/40">{roleName}</span> : null}
            </span>
          </div>

          <div
            ref={listRef}
            id={menuId}
            role="menu"
            aria-label="Account"
            onKeyDown={onMenuKeyDown}
            className="border-t border-ink/10 p-1"
          >
            {profile && ProfileIcon ? (
              <NavLink
                role="menuitem"
                to={profile.to}
                onClick={() => setOpen(false)}
                className="flex h-8 items-center gap-2 rounded-md px-2 text-[13px] font-medium text-ink/80 hover:bg-[#F3F6FB] hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                <ProfileIcon size={15} strokeWidth={1.8} aria-hidden="true" />
                Profile
              </NavLink>
            ) : null}
            <button
              type="button"
              role="menuitem"
              disabled={signingOut}
              onClick={signOutAdmin}
              className="flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-[13px] font-medium text-ink/80 hover:bg-[#F3F6FB] hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue disabled:cursor-wait disabled:opacity-60"
            >
              <LogOut size={15} strokeWidth={1.8} aria-hidden="true" />
              {signingOut ? 'Signing out' : 'Sign out'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
