import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { AppNavbar } from './AppNavbar'
import { titleForPath } from './navigation'
import { Sidebar } from './Sidebar'
import { useIsDesktop } from './useIsDesktop'

export function WorkspaceLayout() {
  const desktop = useIsDesktop()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const layoutKey = `${pathname}:${desktop}`
  const [seenLayout, setSeenLayout] = useState(layoutKey)
  if (seenLayout !== layoutKey) {
    setSeenLayout(layoutKey)
    setMenuOpen(false)
  }
  const title = titleForPath(pathname)
  const drawerOpen = menuOpen && !desktop
  const iconOnly = collapsed && desktop

  return (
    <div className="min-h-svh bg-canvas font-sans text-ink">
      <Sidebar open={drawerOpen} onClose={() => setMenuOpen(false)} iconOnly={iconOnly} />

      <div
        className={`min-h-svh w-full min-w-0 transition-[padding] duration-200 ease-out motion-reduce:transition-none ${
          iconOnly ? 'lg:pl-[72px]' : 'lg:pl-[260px]'
        }`}
      >
        <AppNavbar
          title={title}
          menuOpen={drawerOpen}
          onMenu={() => setMenuOpen((value) => !value)}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
        />

        <main inert={drawerOpen ? true : undefined} className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
