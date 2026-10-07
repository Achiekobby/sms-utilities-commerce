import { useEffect } from 'react'
import { useAuth } from '../../utils/hooks/useAuth'
import { SidebarBrand } from './SidebarBrand'
import { SidebarGroup } from './SidebarGroup'
import { WorkspaceCard } from './WorkspaceCard'
import { getNavigation } from './navigation'

// From lg up it is a full-height column that owns the logo, so it and the top bar form one
// white frame around the page. Below lg it is a drawer under the top bar, with a scrim and Escape.
export function Sidebar({ open, onClose, collapsed }) {
  const { isBusiness } = useAuth()
  const groups = getNavigation({ isBusiness })

  useEffect(() => {
    if (!open) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    // Keep the page behind the drawer from scrolling.
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
          className="fixed inset-x-0 top-18 bottom-0 z-20 cursor-default bg-navy/30 lg:hidden"
        />
      ) : null}

      <aside
        id="workspace-nav"
        className={`fixed top-18 bottom-0 left-0 z-30 flex w-72 max-w-[85vw] flex-col overflow-hidden bg-white transition-[width,transform,visibility] duration-200 ease-out motion-reduce:transition-none lg:visible lg:top-0 lg:z-50 lg:translate-x-0 lg:shadow-[1px_0_0_rgba(16,33,61,0.05),14px_0_32px_-14px_rgba(11,31,91,0.26),28px_0_56px_-28px_rgba(20,115,230,0.32)] ${
          collapsed ? 'lg:w-18' : 'lg:w-64 lg:max-w-none'
        } ${
          open ? 'translate-x-0 shadow-[0_24px_48px_-12px_rgba(11,31,91,0.35)]' : '-translate-x-full invisible'
        }`}
      >
        <SidebarBrand collapsed={collapsed} />

        <div className={`shrink-0 px-3 pt-4 pb-3 lg:pt-1 ${collapsed ? 'lg:px-4' : ''}`}>
          <WorkspaceCard collapsed={collapsed} />
        </div>

        <nav
          aria-label="Workspace"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-2 pb-6"
        >
          {groups.map((group, index) => (
            <SidebarGroup
              key={group.id}
              group={group}
              first={index === 0}
              collapsed={collapsed}
              onNavigate={onClose}
            />
          ))}
        </nav>
      </aside>
    </>
  )
}
