import { useEffect, useMemo, useRef } from 'react'
import { useIsDesktop } from './useIsDesktop'
import { Link } from 'react-router'
import { usePermissions } from '../../features/auth/usePermissions'
import { paths } from '../../routes/paths'
import Images from '../../utils/Images'
import { getAdminNavigation } from './navigation'
import { SidebarBranch } from './SidebarBranch'
import { SidebarItem } from './SidebarItem'
import { SidebarUser } from './SidebarUser'

const focusable =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function useDrawerFocus(active, containerRef) {
  useEffect(() => {
    if (!active) return undefined
    const root = containerRef.current
    if (!root) return undefined

    const previouslyFocused = document.activeElement
    const items = () =>
      [...root.querySelectorAll(focusable)].filter((node) => node.getAttribute('aria-hidden') !== 'true')

    items()[0]?.focus()

    function onKeyDown(event) {
      if (event.key !== 'Tab') return
      const nodes = items()
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    root.addEventListener('keydown', onKeyDown)
    return () => {
      root.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [active, containerRef])
}

export function Sidebar({ open, onClose, iconOnly }) {
  const access = usePermissions()
  const groups = useMemo(() => getAdminNavigation(access), [access])
  const desktop = useIsDesktop()
  const asideRef = useRef(null)
  const hidden = !desktop && !open
  useDrawerFocus(open && !desktop, asideRef)

  useEffect(() => {
    if (!open) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          onClick={onClose}
          className="fixed inset-0 z-30 bg-navy/40 lg:hidden"
        />
      ) : null}

      <aside
        ref={asideRef}
        id="admin-nav"
        inert={hidden ? true : undefined}
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(85vw,260px)] flex-col border-r border-ink/10 bg-white transition-[width,transform,visibility] duration-200 ease-out motion-reduce:transition-none lg:visible lg:translate-x-0 ${
          iconOnly ? 'lg:w-[72px]' : 'lg:w-[260px]'
        } ${hidden ? 'invisible -translate-x-full' : 'translate-x-0'}`}
      >
        <div className={`flex h-14 shrink-0 items-center ${iconOnly ? 'justify-center' : 'px-4'}`}>
          <Link
            to={paths.app}
            aria-label="UtiliSMS dashboard"
            onClick={onClose}
            className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
          >
            {iconOnly ? (
              <>
                <img src={Images.favicon} alt="" className="hidden size-7 object-contain lg:block" />
                <img src={Images.logo} alt="" className="h-8 w-auto lg:hidden" />
              </>
            ) : (
              <img src={Images.logo} alt="" className="h-8 w-auto" />
            )}
          </Link>
        </div>

        <nav aria-label="Admin" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-4">
          {groups.map((group) => (
            <section key={group.id} aria-labelledby={`nav-${group.id}`} className="mt-4 first:mt-1">
              <h2
                id={`nav-${group.id}`}
                className={`mb-1 px-2 text-[11px] font-medium tracking-[0.08em] text-ink/40 uppercase ${
                  iconOnly ? 'lg:sr-only' : ''
                }`}
              >
                {group.label}
              </h2>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.id}>
                    {item.children ? (
                      <SidebarBranch item={item} iconOnly={iconOnly} onNavigate={onClose} />
                    ) : (
                      <SidebarItem item={item} iconOnly={iconOnly} onNavigate={onClose} />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>

        <SidebarUser iconOnly={iconOnly} />
      </aside>
    </>
  )
}
