import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { AccountMenu } from './AccountMenu'
import { AdminSearch } from './AdminSearch'

const iconButton =
  'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink/70 transition-colors duration-150 hover:bg-ink/[0.04] hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function AppNavbar({ title, menuOpen, onMenu, collapsed, onToggleCollapse }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-ink/10 bg-white px-3 sm:px-4">
      <button
        type="button"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="admin-nav"
        onClick={onMenu}
        className={`lg:hidden ${iconButton}`}
      >
        <Menu size={18} strokeWidth={1.8} aria-hidden="true" />
      </button>

      <button
        type="button"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
        aria-controls="admin-nav"
        onClick={onToggleCollapse}
        className={`hidden lg:flex ${iconButton}`}
      >
        {collapsed ? (
          <PanelLeftOpen size={18} strokeWidth={1.8} aria-hidden="true" />
        ) : (
          <PanelLeftClose size={18} strokeWidth={1.8} aria-hidden="true" />
        )}
      </button>

      <p className="min-w-0 truncate text-sm font-semibold text-navy sm:max-w-40 lg:max-w-none">{title}</p>

      <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:flex-1 sm:justify-end sm:gap-3">
        <AdminSearch />
        <AccountMenu />
      </div>
    </header>
  )
}
